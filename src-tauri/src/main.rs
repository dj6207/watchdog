// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  Manager,
};

mod services;
mod database;

use crate::database::sqlite_connector::{initialize_sqlite_database, create_user, user_name_exist};
use crate::services::windows::start_tacker;
use crate::services::user::get_user_name;


fn setup_logging() -> Result<(), fern::InitError> {
  fern::Dispatch::new()
    .format(move |out, message, record| {
      out.finish(format_args!(
        "{}[{}][{}] - {}",
        chrono::Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
        record.target(),
        record.level(),
        message
      ))
    })
    .chain(std::io::stdout())
    .chain(fern::log_file("output.log")?)
    .level(log::LevelFilter::Info)
    .apply()?;
  Ok(())
}

fn main() {
  if let Err(err) = setup_logging() {
    eprintln!("Error initializing logger: {}", err);
  }
  log::info!("Logging");
  tauri::Builder::default()
    .plugin(services::user::init())
    .plugin(database::sqlite_connector::init())
    .plugin(services::windows::init())
    .setup(|app_handler| {
      let app_handle = app_handler.app_handle();
      tauri::async_runtime::spawn(async move {
          match initialize_sqlite_database().await {
              Ok(pool) => {
                  log::info!("Database initalized");
                  match get_user_name() {
                      Ok(user) => {
                        match user_name_exist(&pool, user.clone().unwrap()).await {
                          Ok(user_exist) => {
                            if !user_exist {
                              if let Err(err) = create_user(&pool, user.unwrap()).await {
                                log::error!("Error creating user. Error code: {}", err);
                              }
                            }
                            start_tacker().await;
                          }
                          Err(err) => {
                            log::error!("Database error. Error code: {}", err)
                          }
                        }
                      }  
                      Err(err) => {
                          log::error!("Unable to get user. Error: {}", err.unwrap_or_else(|| 1))
                      }
                  }
              }
              Err(err) => {
                  log::error!("Failed to initalize database. Error: {}", err);
                  app_handle.exit(1);
              }
          }
      });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
