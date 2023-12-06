extern crate winapi;

use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;

use tokio::time::{self, Duration};

use winapi::um::errhandlingapi::GetLastError;
use winapi::shared::windef::HWND__;
use winapi::um::winuser::{
    GetForegroundWindow, 
    GetWindowTextLengthW,
    GetWindowTextW,
};

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
            // Error occurred, or buffer was still too small
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
    println!("Window: {}", window);
    return Ok(Some(window))
}

async fn start_tacker() {
    let mut interval = time::interval(Duration::from_secs(5));
    loop {
        interval.tick().await;
        match get_foreground_window() {
            Ok(window_name) => {
                if let Some(name) = window_name {
                    // println!("Window Name: {}", name);
                    continue;
                }
            }
            Err(err) => {
                if let Some(e) = err {
                    println!("Error code: {:?}", e);
                }
            }
        }
    }
}

// TODO 
fn get_executable_name() {

}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows")
        .setup(|app_handler| {
            tauri::async_runtime::spawn( async move {
                start_tacker().await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_foreground_window])
        .build()
}