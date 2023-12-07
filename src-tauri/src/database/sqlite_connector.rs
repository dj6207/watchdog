use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State
};

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::{Pool, Sqlite, Row, Error as SqlxError};

use std::str::FromStr;

use chrono::Local;

const DATABASE_URL:&str = "sqlite:watchdog.db";

#[derive(Debug, sqlx::FromRow)]
pub struct Application {
    pub application_id: i64,
    pub executable_name: String,
}

#[derive(Debug, sqlx::FromRow)]
pub struct User {
    pub user_id: i64,
    pub user_name: String,
}

pub async fn create_usage_logs(pool: &SqlitePool, user_id: i64, window_id: i64) -> Result<i64, SqlxError> {
    let query = sqlx::query(
        "
        INSERT INTO UsageLogs (UserID, WindowID, Date, TimeSpent) VALUES (?, ?, ?, ?)
        "
    )
        .bind(user_id)
        .bind(window_id)
        .bind(Local::now().format("%Y-%m-%d").to_string())
        .bind(0)
        .execute(pool)
        .await?;
    return Ok(query.last_insert_rowid());
}

pub async fn application_window_exists(pool: &SqlitePool, application_window_name: &str) -> Result<bool, SqlxError> {
    let query = sqlx::query(
        "
        SELECT EXISTS(SELECT 1 FROM ApplicationWindows WHERE WindowName = ?)
        "
    )
        .bind(application_window_name)
        .fetch_one(pool)
        .await?
        .get::<i32, _>(0) != 0;
    return Ok(query);
}

pub async fn create_application_window(pool: &SqlitePool, application_id: Option<i64>, window_name: &str) -> Result<i64, SqlxError> {
    if let Some(id) = application_id {  
        let query = sqlx::query(
            "
            INSERT INTO ApplicationWindows (ApplicationID, WindowName) VALUES (?, ?)
            "
        )
            .bind(id)
            .bind(window_name)
            .execute(pool)
            .await?;
        return Ok(query.last_insert_rowid());
    } else {
        let query = sqlx::query(
            "
            INSERT INTO ApplicationWindows (ApplicationID, WindowName) VALUES (NULL, ?)
            "
        )
            .bind(window_name)
            .execute(pool)
            .await?;
        return Ok(query.last_insert_rowid());
    }
}

pub async fn application_exists(pool: &SqlitePool, executable_name: &str) -> Result<bool, SqlxError> {
    let query = sqlx::query(
        "
        SELECT EXISTS(SELECT 1 FROM Applications WHERE ExecutableName = ?)
        "
    )
        .bind(executable_name)
        .fetch_one(pool)
        .await?
        .get::<i32, _>(0) != 0;
    return Ok(query);
}

pub async fn create_application(pool: &SqlitePool, executable_name: &str) -> Result<i64, SqlxError> {
    let query = sqlx::query(
        "
        INSERT INTO Applications (ExecutableName) VALUES (?)
        "
    )
        .bind(executable_name);
    let result = query.execute(pool).await?;
    return Ok(result.last_insert_rowid());
}

pub async fn select_application_by_executable_name(pool: &SqlitePool, executable_name: &str) -> Result<Application, SqlxError> {
    let application = sqlx::query_as::<_, Application>(
        "
        SELECT ApplicationID as application_id, ExecutableName as executable_name FROM Applications WHERE ExecutableName = ?
        "
    )
        .bind(executable_name)
        .fetch_one(pool)
        .await?;
    Ok(application)
}

pub async fn user_name_exists(pool: &SqlitePool, user_name: &str) -> Result<bool, SqlxError>{
    let query = sqlx::query(
        "
        SELECT EXISTS(SELECT 1 FROM Users WHERE UserName = ?)
        "
    )
        .bind(user_name)
        .fetch_one(pool)
        .await?
        .get::<i32, _>(0) != 0;
    return Ok(query);
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

pub async fn update_user(pool: &SqlitePool, user_id: i64, new_user_name: &str) -> Result<u64, SqlxError> {
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

pub async fn delete_user(pool: &SqlitePool, user_id: i64) -> Result<u64, SqlxError> {
    let query = sqlx::query(
        "
        DELETE FROM Users WHERE UserID = ?
        "
    )
        .bind(user_id);
    let result = query.execute(pool).await?;
    return Ok(result.rows_affected());
}

pub async fn select_user_by_user_name(pool: &SqlitePool, user_name: &str) -> Result<User, SqlxError> {
    let user = sqlx::query_as::<_, User>(
        "
        SELECT UserID as user_id, UserName as user_name FROM Users WHERE UserName = ?
        "
    )
        .bind(user_name)
        .fetch_one(pool)
        .await?;
    Ok(user)
}

pub async fn select_user_by_user_id(pool: &SqlitePool, user_id: i64) -> Result<User, SqlxError> {
    let user = sqlx::query_as::<_, User>(
        "
        SELECT UserID as user_id, UserName as user_name FROM Users WHERE UserID = ?
        "
    )
        .bind(user_id)
        .fetch_one(pool)
        .await?;
    Ok(user)
}

pub async fn initialize_sqlite_database() -> Result<Pool<Sqlite>, SqlxError>{
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
            WindowName TEXT UNIQUE,
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

// TODO Check if new day, if new day make new UsageLog
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sqlite_connector")
        .build()
}