use tauri::{
    command,
    plugin::{
        Builder, 
        TauriPlugin
    },
    Runtime
};

use std::ptr::null_mut;
use SerializedError::SerializedWindowsError;
use crate::types::enums::SerializedError;

use windows::{
    core::{PWSTR, Error as WindowsError, HSTRING},
    Win32::{
        Foundation::{GetLastError,E_FAIL},
        System::WindowsProgramming::GetUserNameW,
    },
};

pub fn get_user_name() -> Result<String, WindowsError>{
    unsafe {
        let mut size = 0;
        let _ = GetUserNameW(PWSTR(null_mut()), &mut size);
        if size == 0 {
            match GetLastError() {
                Ok(_) => {return Err(WindowsError::new(E_FAIL, HSTRING::from("GetUserNameW failed without last error")));}
                Err(err) => {return Err(err)}
            }
        }
        let mut buffer = vec![0u16; size as usize];
        match GetUserNameW(PWSTR(buffer.as_mut_ptr()), &mut size) {
            Ok(_) => {
                if buffer.last() == Some(&0) {
                    buffer.pop();
                }
                let user_name = String::from_utf16_lossy(&buffer);
                return Ok(user_name)
            }
            Err(err) => {return Err(err);}
        } 
    }
}

#[command]
async fn get_current_user() -> Result<String, SerializedError> {
    match get_user_name() {
        Ok(user) => {
            let user_name = user;
            return Ok(user_name);
        }
        Err(err) => {return Err(SerializedWindowsError(err));}
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("user")
        .invoke_handler(tauri::generate_handler![get_current_user])
        .build()
}