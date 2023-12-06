use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};

use std::{ptr::null_mut, os::windows::ffi::OsStringExt};
use std::ffi::OsString;

use winapi::um::errhandlingapi::GetLastError;
use winapi::um::winbase::GetUserNameW;

#[command]
fn get_user_name() -> Result<Option<String>, Option<u32>>{
    unsafe {
        let mut size = 0;
        GetUserNameW(null_mut(), &mut size);
        if size == 0 {
            return Err(Some(GetLastError()));
        }
        let mut buffer = vec![0u16; (size + 1) as usize];
        if GetUserNameW(buffer.as_mut_ptr(), &mut size) != 0 {
            let user_name = OsString::from_wide(&buffer).to_string_lossy().into_owned();
            println!("User: {}", user_name);
            return Ok(Some(user_name));
        } else {
            return Err(None);
        }
    }
}

#[command]
fn test() {
    println!("Test");
}

// TODO When application launch save current user and date
// Check if user exist, if not make new user in database

// TODO Check if new day, if new day make new UsageLog
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("user")
        .invoke_handler(tauri::generate_handler![get_user_name, test])
        .build()
}