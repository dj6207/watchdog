use tauri::{
    command,
    async_runtime,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State,
};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::{Pool, Sqlite};
use std::str::FromStr;

const INITAL_QUERY:&str = 
    "
    CREATE TABLE IF NOT EXISTS Users (
        UserID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS Applications (
        ApplicationID INTEGER PRIMARY KEY AUTOINCREMENT,
        ExecutableName TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS ApplicationWindows (
        WindowID INTEGER PRIMARY KEY AUTOINCREMENT,
        ApplicationID INTEGER,
        WindowName TEXT,
        FOREIGN KEY (ApplicationID) REFERENCES Applications(ApplicationID)
    );

    CREATE TABLE IF NOT EXISTS UsageLogs (
        LogID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserID INTEGER,
        WindowID INTEGER,
        Date DATE,
        TimeSpent INTEGER,
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (WindowID) REFERENCES ApplicationWindows(WindowID)
    );
    "
;

async fn initialize_sqlite_database() -> Result<(), sqlx::Error>{
    let database_url = "sqlite:watchdog.db";
    let connect_options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true);
    let pool = SqlitePool::connect_with(connect_options).await?;
    sqlx::query(INITAL_QUERY).execute(&pool).await?;
    return Ok(());
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sqlite_connector")
        .setup(|app_handler| {
            let app_handle = app_handler.app_handle();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = initialize_sqlite_database().await {
                    eprintln!("Failed to initalize database: {}", e);
                    app_handle.exit(1);
                }
            });
            Ok(())
        })
        .build()
}