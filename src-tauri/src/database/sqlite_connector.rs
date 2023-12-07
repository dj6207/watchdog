use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::{Pool, Sqlite, Error as SqlxError};
use std::str::FromStr;

use crate::services::user::get_user_name;

const DATABASE_URL:&str = "sqlite:watchdog.db";

#[derive(sqlx::FromRow)]
struct User {
    user_id: i32,
    user_name: String,
}

pub async fn create_user(pool: &SqlitePool, user_name: String) -> Result<i64, SqlxError> {
    let query = sqlx::query(
        "
        INSERT INTO Users (UserName) VALUES (?)
        "
    )
        .bind(user_name);
    let result = query.execute(pool).await?;
    return Ok(result.last_insert_rowid());
}

pub async fn update_user(pool: &SqlitePool, user_id: i32, new_user_name: String) -> Result<u64, SqlxError> {
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

async fn initialize_sqlite_database() -> Result<Pool<Sqlite>, SqlxError>{
    let connect_options = SqliteConnectOptions::from_str(DATABASE_URL)?
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
    return Ok(pool);
}

// TODO When application launch save current user and date
// Check if user exist, if not make new user in database

// TODO Check if new day, if new day make new UsageLog
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sqlite_connector")
        .setup(|app_handler| {
            let app_handle = app_handler.app_handle();
            tauri::async_runtime::spawn(async move {
                match initialize_sqlite_database().await {
                    Ok(pool) => {
                        log::info!("Database initalized");
                        match get_user_name() {
                            Ok(user) => {
                                if let Err(err) = create_user(&pool, user.unwrap()).await {
                                    log::error!("Error creating user. Error code: {}", err)
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
        .build()
}