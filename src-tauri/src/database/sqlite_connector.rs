use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::Error as SqlxError;
use std::str::FromStr;

#[derive(sqlx::FromRow)]
struct User {
    user_id: i32,
    user_name: String,
}

pub async fn create_user(pool: &SqlitePool, user_name: &str) -> Result<i64, SqlxError> {
    let query = sqlx::query(
        "
        INSERT INTO Users (UserName) VALUES (?)
        "
    )
        .bind(user_name);
    let result = query.execute(pool).await?;
    return Ok(result.last_insert_rowid());
}

pub async fn update_user(pool: &SqlitePool, user_id: i32, new_user_name: &str) -> Result<u64, SqlxError> {
    let query = sqlx::query(
        "
        UPDATE Users SET UserName = ? WHERE UserID = ?
        "
    )
        .bind(new_user_name)
        .bind(user_id);
    let result = query.execute(pool).await?;
    return Ok(result.rows_affected());
}

pub async fn delete_user(pool: &SqlitePool, user_id: i32) -> Result<u64, SqlxError> {
    let query = sqlx::query(
        "
        DELETE FROM Users WHERE UserID = ?
        "
    )
        .bind(user_id);
    let result = query.execute(pool).await?;
    return Ok(result.rows_affected());
}

async fn select_user(pool: &SqlitePool, user_id: i32) -> Result<User, SqlxError> {
    let user = sqlx::query_as::<_, User>(
        "
        SELECT UserID, UserName FROM Users WHERE UserID = ?
        "
    )
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(user)
}

async fn initialize_sqlite_database() -> Result<(), SqlxError>{
    let database_url = "sqlite:watchdog.db";
    let connect_options = SqliteConnectOptions::from_str(database_url)?
        .create_if_missing(true);
    let pool = SqlitePool::connect_with(connect_options).await?;
    sqlx::query(
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
    ).execute(&pool).await?;
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