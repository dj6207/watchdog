use tokio::time::{self, Duration};
use sqlx::sqlite::SqlitePool;

use windows::{
    core::{Error as WindowsError, HSTRING},
    Win32::{
        Foundation::{CloseHandle, GetLastError, HANDLE, HWND, E_FAIL},
        System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ},
        System::ProcessStatus::GetModuleFileNameExW,
        UI::WindowsAndMessaging::{
            GetWindowThreadProcessId, 
            GetForegroundWindow, 
            GetWindowTextLengthW, 
            GetWindowTextW,
        },
    },
    Media::Control::{
        GlobalSystemMediaTransportControlsSessionManager, 
        GlobalSystemMediaTransportControlsSession,
    },
};

use tauri::{
    plugin::{
        Builder, 
        TauriPlugin
    },
    Runtime,
};

use crate::database::sqlite_connector::{
    create_application, 
    create_application_window,
    create_usage_logs,
    select_application_by_executable_name,
    select_application_window_by_window_name,
    select_usage_log_by_window_id,
    select_user_by_name,
    usage_logs_exists, 
    update_usage_logs_time,
};

const MONITOR_INTERVAL:u64 = 1;

async fn get_current_media_session() -> Result<(), WindowsError> {
    let media_session_manager = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?.await?;
    if let Ok(current_session) = media_session_manager.GetCurrentSession() {
        let media_properties = current_session.TryGetMediaPropertiesAsync()?.await?;
        log::info!("Media Properties Title {:?}", media_properties.Title());
    } else {
        log::info!("No media currently playing")
    }
    Ok(())
}

fn get_process_handle(process_id: u32) -> Result<HANDLE, WindowsError> {
    unsafe {
        match OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, process_id) {
            Ok(process_handle) => {return Ok(process_handle);}
            Err(err) => {return Err(err);}
        }
    }
}

fn get_foreground_process_id(window_handle: HWND) -> Result<u32, ()>{
    unsafe {
        let mut process_id = 0;
        GetWindowThreadProcessId(window_handle, Some(&mut process_id));
        if process_id == 0 {
            return Err(());
        }
        return Ok(process_id);
    }
}

fn get_foreground_window_handle() -> Result<HWND , ()> {
    unsafe {
        let window_handle = GetForegroundWindow();
        if window_handle.0 == 0{
            return Err(());
        }
        return Ok(window_handle);
    }
}

fn get_window_name_length_w(window_handle: HWND) -> Result<usize, ()> {
    unsafe {
        let window_name_length = GetWindowTextLengthW(window_handle);
        if window_name_length == 0 {
            return Err(());
        }
        return Ok(window_name_length as usize);
    }
}

fn get_module_file_name_ex_w(process_handle: HANDLE, executable_name: &mut Vec<u16>) -> Result<u32, ()> {
    unsafe {
        // Maybe replace GetModuleFileNameExW with QueryFullProcessImageNameW
        let module_file_name = GetModuleFileNameExW(process_handle, None, executable_name);
        let _  = CloseHandle(process_handle);
        if module_file_name == 0 {
            return Err(());
        }
        return Ok(module_file_name);
    }
}


fn get_foreground_window() -> Result<String, WindowsError> {
    unsafe {
        match get_foreground_window_handle() {
            Ok(window_handle) => {
                match get_window_name_length_w(window_handle) {
                    Ok(length) => {
                        let mut buffer = vec![0u16; length + 1];
                        let len = GetWindowTextW(window_handle, &mut buffer);
                        if len == 0 {
                            match GetLastError() {
                                Ok(_) => {return Err(WindowsError::new(E_FAIL, HSTRING::from("GetUserNameW failed without last error")));}
                                Err(err) => {return Err(err)}
                            }
                        } else {
                            buffer.truncate(len as usize);
                            let window_name = String::from_utf16_lossy(&buffer);
                            log::info!("Window: {}", window_name.clone());
                            return Ok(window_name)
                        }
                    }
                    Err(_) => {return Ok(String::new());} 
                }
            }
            Err(_) => {return Ok(String::new());} 
        }        
    }
}

fn get_executable_name_with_process_id(process_id:u32) -> Result<String, WindowsError>{
    let process_handle = get_process_handle(process_id)?;
    let mut executable_name = vec![0u16; 260];
    match get_module_file_name_ex_w(process_handle, &mut executable_name) {
        Ok(module_file_name) => {
            executable_name.truncate(module_file_name as usize);
            let window_executable = String::from_utf16_lossy(&executable_name)
                .split('\\')
                .last()
                .map(|s| s.to_string());
            log::info!("Executable: {}", window_executable.clone().unwrap());
            match window_executable {
                Some(window_executable_name) => {return  Ok(window_executable_name);}
                None => {return Ok(String::new());}
            } 
        }
        Err(_) => {return Ok(String::new());}
    }
}

fn get_executable_name() -> Result<String, WindowsError> {
    match get_foreground_window_handle() {
        Ok(window_handle) => {
            match get_foreground_process_id(window_handle) {
                Ok(process_id) => {
                    match get_executable_name_with_process_id(process_id) {
                        Ok(window_executable_name) => {return Ok(window_executable_name);}
                        Err(_) => {return Ok(String::new());}
                    }
                }
                Err(_) => {return Ok(String::new());}
            }
        }
        Err(_) => {return Ok(String::new());}
    }
}

// Write better comments alreadu for got what all this does lol
pub async fn start_tacker(pool: SqlitePool, user_name: String) {
    let mut interval = time::interval(Duration::from_secs(MONITOR_INTERVAL));
    loop {
        interval.tick().await;
        // let mut active_applications = Vec::new();
        let mut application_id:Option<i64> = None;
        let mut window_id:Option<i64> = None;
        let mut window_name:Option<String> = None;

        // Get application id associated with executable name
        match get_executable_name() {
            Ok(executable_string) => {
                match create_application(&pool, &executable_string).await {
                    Ok(id) => {application_id = Some(id);}
                    Err(err) => {
                        if err.as_database_error().unwrap().is_unique_violation() {
                            if let Ok(application) = select_application_by_executable_name(&pool, &executable_string).await {
                                application_id = Some(application.application_id);
                            }
                        } else {log::error!("{}", err);}
                    }
                }
                
            }
            Err(err) => {log::error!("{}", err)}
        }

        // Get window id associated with window name
        match get_foreground_window() {
            Ok(window_string) => {
                window_name = Some(window_string.clone());
                match create_application_window(&pool, application_id, &window_string).await {
                    Ok(id) => {window_id = Some(id);}
                    Err(err) => {
                        if err.as_database_error().unwrap().is_unique_violation() {
                            if let Ok(application_window) = select_application_window_by_window_name(&pool, &window_string).await {
                                window_id = Some(application_window.window_id);
                            }
                        } else {log::error!("{}", err);}
                    }
                }
                
            }
            Err(err) => {log::error!("{}", err);}
        } 

        // Updates usage logs using application id and window id
        match select_user_by_name(&pool, &user_name).await {
            Ok(user) => {
                if let Some(id) = window_id {
                    if let Ok(exists) = usage_logs_exists(&pool, id).await {
                        if exists {
                            if let Ok(usage_log) = select_usage_log_by_window_id(&pool, id).await {
                                match update_usage_logs_time(&pool, usage_log.log_id, MONITOR_INTERVAL as i64).await {
                                    Ok(_rows) => {}
                                    Err(err) => {log::error!("{}", err);}
                                }
                            }
                        } else {
                            match create_usage_logs(&pool, user.user_id, id).await {
                                Ok(_id) => {}
                                Err(err) => {log::error!("{}", err);}
                            }
                        }
                    }
                }
            }
            Err(err) => {log::error!("{}", err);}
        }
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows")
        .build()
}

// TODO: Write test for each functions
#[cfg(test)]
mod test {
    use crate::setup_logging;

    use super::*;
    use tokio;

    fn setup_test() {
        let _ = setup_logging();
    }

    #[tokio::test]
    async fn test_get_current_media_session() {
        setup_test();
        match get_current_media_session().await {
            Ok(_) => {}
            Err(_) => {}
        }
    }
 }