// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod services;
mod database;

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
    .plugin(services::windows::init())
    .plugin(services::user::init())
    .plugin(database::sqlite_connector::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
