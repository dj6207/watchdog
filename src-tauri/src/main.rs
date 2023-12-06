// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod services;
mod database;

fn main() {
  tauri::Builder::default()
    .plugin(services::windows::init())
    .plugin(services::user::init())
    .plugin(database::sqlite_connector::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
