extern crate winapi;

use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;

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

fn get_window_name(window_handle: *mut HWND__, window_name_length: i32, mut buffer: Vec<u16>) -> Result<usize, Option<u32>>{
     unsafe {
        let window_name = GetWindowTextW(window_handle, buffer.as_mut_ptr(), buffer.len() as i32) as usize;
        if window_name == 0 || window_name < window_name_length as usize {
            // Error occurred, or buffer was still too small
            return Err(None);
        }
        return Ok(window_name);
     }
}

fn get_foreground_window() -> Result<Option<String>, Option<u32>> {
    let window_handle = get_foreground_window_handle()?;
    if window_handle.is_null() {
        return Ok(None);
    }
    let window_name_length = get_window_name_length(window_handle)?;
    let buffer = vec![0u16; (window_name_length + 1) as usize];
    let window_name = get_window_name(window_handle, window_name_length, buffer.clone())?;
    return Ok(Some(OsString::from_wide(&buffer[..window_name]).to_string_lossy().into_owned()))
}

// fn _get_foreground_window() -> Result<Option<String>, u32> {
//     match get_foreground_window_handle() {
//         Ok(window_handle) => {
//             if window_handle.is_null() {
//                 return Ok(None);
//             }
//             match get_window_name_length(window_handle) {
//                 Ok(window_name_length) => {
//                     let buffer = vec![0u16; (window_name_length + 1) as usize];
//                     match get_window_name(window_handle, window_name_length, &buffer) {
//                         Ok(window_name) => {
//                             return Ok(Some(OsString::from_wide(&buffer[..window_name]).to_string_lossy().into_owned()));
//                         }
//                         Err(error) => {
//                             return Err(error);
//                         }
//                     }
//                 }
//                 Err(error) => {
//                     return Err(error);
//                 }
//             }
//         }
//         Err(error) => {
//             return Err(error);
//         }
//     }
// }

// fn _get_foreground_window() -> Option<String> {
//     let hwnd = unsafe { GetForegroundWindow() };
//     if hwnd.is_null() {
//         return None;
//     }
//     let len = unsafe {GetWindowTextLengthW(hwnd)};
//     if len == 0 {
//         return None;
//     }
//     let mut buffer = vec![0u16; (len + 1) as usize]; // +1 for null terminator
//     let len_copied = unsafe {
//         GetWindowTextW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) as usize
//     };
//     if len_copied == 0 || len_copied < len as usize {
//         return None; // Error occurred, or buffer was still too small
//     }
//     return Some(OsString::from_wide(&buffer[..len_copied]).to_string_lossy().into_owned())
// }

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("windows").build()
}