extern crate winapi;

use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use std::ptr::null_mut;

use tokio::time::{self, Duration};

use winapi::um::psapi::GetModuleFileNameExW;
use winapi::um::handleapi::CloseHandle;
use winapi::{um::processthreadsapi::OpenProcess, ctypes::c_void};
use winapi::um::errhandlingapi::GetLastError;
use winapi::shared::windef::HWND__;
use winapi::um::winuser::{
    GetForegroundWindow, 
    GetWindowTextLengthW,
    GetWindowTextW,
    GetWindowThreadProcessId,
};
use winapi::um::winnt::{
    PROCESS_QUERY_INFORMATION, 
    PROCESS_VM_READ
};

use sqlx::sqlite::SqlitePool;
use crate::database::sqlite_connector::{
    create_application, 
    create_application_window,
    create_usage_logs,
    select_application_by_executable_name,
    select_application_window_by_window_name,
    select_user_by_user_name,
};

fn get_process_handle(process_id: u32) -> Result<*mut c_void, Option<u32>> {
    unsafe {
        let process_handle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, 0, process_id);
        if process_handle.is_null() {
            return Err(Some(GetLastError()));
        }
        return Ok(process_handle);
    }
}

fn get_foreground_process_id(window_handle: *mut HWND__) -> Result<u32, Option<u32>>{
    unsafe {
        let mut process_id = 0;
        GetWindowThreadProcessId(window_handle, &mut process_id);
        if process_id == 0 {
            return Err(Some(GetLastError()));
        }
        return Ok(process_id);
    }
}

fn get_foreground_window_handle() -> Result<*mut HWND__, Option<u32>> {
    unsafe {
        let window_handle = GetForegroundWindow();
        if window_handle.is_null() {
            return Err(Some(GetLastError()));
        }
        return Ok(window_handle);
    }
}

fn get_window_name_length(window_handle: *mut HWND__) -> Result<i32, Option<u32>> {
    unsafe {
        let window_name_length = GetWindowTextLengthW(window_handle);
        if window_name_length == 0 {
            return Err(Some(GetLastError()));
        }
        return Ok(window_name_length);
    }
}

fn get_window_name(window_handle: *mut HWND__, window_name_length: i32, buffer: &mut Vec<u16>) -> Result<usize, Option<u32>>{
     unsafe {
        let window_name = GetWindowTextW(window_handle, buffer.as_mut_ptr(), buffer.len() as i32) as usize;
        if window_name == 0 || window_name < window_name_length as usize {
            return Err(None);
        }
        return Ok(window_name);
     }
}

#[command]
fn get_foreground_window() -> Result<Option<String>, Option<u32>> {
    let window_handle = get_foreground_window_handle()?;
    if window_handle.is_null() {
        return Ok(None);
    }
    let window_name_length = get_window_name_length(window_handle)?;
    let mut buffer = vec![0u16; (window_name_length + 1) as usize];
    let window_name = get_window_name(window_handle, window_name_length, &mut buffer)?;
    let window = OsString::from_wide(&buffer[..window_name]).to_string_lossy().into_owned();
    log::info!("Window: {}", window);
    return Ok(Some(window))
}

fn get_executable_name() -> Result<Option<String>, Option<u32>> {
    let window_handle = get_foreground_window_handle()?;
    if window_handle.is_null() {
        return Ok(None);
    }
    let process_id = get_foreground_process_id(window_handle)?;
    let process_handle = get_process_handle(process_id)?;
    let mut executable_name = vec![0u16; 260];
    unsafe {
        let module_file_name = GetModuleFileNameExW(process_handle, null_mut(), executable_name.as_mut_ptr(), executable_name.len() as u32);
        CloseHandle(process_handle);
        if module_file_name == 0 {
            return Err(Some(GetLastError()));
        }
        executable_name.truncate(module_file_name as usize);
        let window_executable = OsString::from_wide(&executable_name).to_string_lossy().into_owned().split('\\').last().map(|s| s.to_string());
        log::info!("Executable: {}", window_executable.clone().unwrap());
        return Ok(window_executable)
    }
}

pub async fn start_tacker(pool: SqlitePool, user_name: String) {
    let mut interval = time::interval(Duration::from_secs(3));
    loop {
        interval.tick().await;
        let mut application_id:Option<i64> = None;
        let mut window_id:Option<i64> = None;

        match get_executable_name() {
            Ok(executable_name) => {
                if let Some(executable_string) = executable_name {
                    // let mut application_id:Option<i64> = None;
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
            }
            Err(err) => {log::error!("Error code {}", err.unwrap_or_else(|| 1));}
        }
        match get_foreground_window() {
            Ok(window_name) => {
                if let Some(window_string) = window_name {
                    match create_application_window(&pool, application_id, &window_string).await {
                        Ok(id) => {
                            window_id = Some(id);
                            // if let Ok(user) = select_user_by_user_name(&pool, &user_name).await {
                            //     match create_usage_logs(&pool, user.user_id, window_id).await {
                            //         Ok(_) => {}
                            //         Err(err) => {log::error!("{}", err);}
                            //     }
                            // }
                        }
                        Err(err) => {
                            if err.as_database_error().unwrap().is_unique_violation() {
                                if let Ok(application_window) = select_application_window_by_window_name(&pool, &window_string).await {
                                    window_id = Some(application_window.window_id);
                                }
                            } else {log::error!("{}", err);}
                        }
                    }
                }
            }
            Err(err) => {log::error!("Error code: {}", err.unwrap_or_else(||1));}
        }
         
        // TODO If window id is the same and the date is the same as today's date update usage logs instead of create a new one
        match select_user_by_user_name(&pool, &user_name).await {
            Ok(user) => {
                if let Some(id) = window_id {
                    match create_usage_logs(&pool, user.user_id, id).await {
                        Ok(_id) => {}
                        Err(err) => {log::error!("{}", err);}
                    }
                } else {
                    
                }
            }
            Err(err) => {log::error!("{}", err);}
        }


    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows")
        .invoke_handler(tauri::generate_handler![get_foreground_window])
        .build()
}