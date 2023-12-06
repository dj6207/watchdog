use tauri::{
    command,
    async_runtime,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::{Pool, Sqlite};
use std::str::FromStr;

// async fn setup_sqlite_database() {
//     let database_url = "sqlite:watchdog.db";
//     let connect_options = SqliteConnectOptions::from_str(database_url)?
//         .create_if_missing(true);
// }

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sqlite_connector")
        .setup(|app_handler| {
            Ok(())
        })
        .build()
}