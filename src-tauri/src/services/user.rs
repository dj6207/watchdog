use tauri::{
    command,
    plugin::{
        Builder, 
        TauriPlugin
    },
    Runtime
};

use std::{ptr::null_mut, os::windows::ffi::OsStringExt};
use std::ffi::OsString;
use winapi::um::errhandlingapi::GetLastError;
use winapi::um::winbase::GetUserNameW;
use UnsafeErrors::WindowsError;
use SerializedError::SerializedUnsafeError;
use crate::types::enums::{SerializedError, UnsafeErrors};

pub fn get_user_name() -> Result<Option<String>, UnsafeErrors>{
    unsafe {
        let mut size = 0;
        GetUserNameW(null_mut(), &mut size);
        if size == 0 {
            return Err(WindowsError(Some(GetLastError())));
        }
        let mut buffer = vec![0u16; size as usize];
        if GetUserNameW(buffer.as_mut_ptr(), &mut size) != 0 {
            // Remove trailing null character if present
            if buffer.last() == Some(&0) {
                buffer.pop();
            }
            let user_name = OsString::from_wide(&buffer).to_string_lossy().into_owned();
            log::info!("User: {}", user_name);
            return Ok(Some(user_name));
        } else {
            return Err(WindowsError(None));
        }
    }
}

#[command]
async fn get_current_user() -> Result<String, SerializedError> {
    match get_user_name() {
        Ok(user) => {
            let user_name = user.unwrap_or_else(||"Unknown".to_string());
            return Ok(user_name);
        }
        Err(err) => {return Err(SerializedUnsafeError(err));}
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("user")
        .invoke_handler(tauri::generate_handler![get_current_user])
        .build()
}