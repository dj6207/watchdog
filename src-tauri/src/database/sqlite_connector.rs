use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Manager, Runtime, State
};

use sqlx::sqlite::{SqliteConnectOptions, SqlitePool};
use sqlx::{Pool, Sqlite, Row, Error as SqlxError};

use std::str::FromStr;
use std::sync::Arc;

use chrono::Local;

const DATABASE_URL:&str = "sqlite:watchdog.db";

struct UsageLogData {
    log_id: i64,
    window_name: String,
    executable_name: String,
    time_spent: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct UsageLog {
    pub log_id: i64,
    pub user_id: i64,
    pub window_id: i64,
    pub date: String,
    pub time_spent: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct ApplicationWindow {
    pub window_id: i64,
    pub application_id: i64,
    pub window_name: String,
}

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

// SELECT u.LogID, us.UserName, aw.WindowName, u.Date, u.TimeSpent
// FROM UsageLogs u
// INNER JOIN Users us ON u.UserID = us.UserID
// INNER JOIN ApplicationWindows aw ON u.WindowID = aw.WindowID
// WHERE u.Date = "2023-12-07"

// async fn get_usage_log_data(pool_state: State<'_, Arc<SqlitePool>>, date: String) {
//     let query = sqlx::query(
//         "
//         "
//     )
// }

// Application Window SQL Operations

pub async fn select_application_window_by_window_name(pool: &SqlitePool, window_name: &str) -> Result<ApplicationWindow, SqlxError> {
    let application_window = sqlx::query_as::<_, ApplicationWindow>(
        "
        SELECT WindowID as window_id, ApplicationID as application_id, WindowName as window_name FROM ApplicationWindows WHERE WindowName = ?
        "
    )
        .bind(window_name)
        .fetch_one(pool)
        .await?;
    Ok(application_window)
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
        .try_get::<i32, _>(0)? != 0;
    return Ok(query);
}

// Application SQL Opertaions

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
        .try_get::<i32, _>(0)? != 0;
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

// UsageLogs SQL Operations

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

pub async fn update_usage_logs_time(pool: &SqlitePool, usage_logs_id: i64, time: i64) -> Result<u64, SqlxError> {
    let query = sqlx::query(
        "
        UPDATE UsageLogs SET TimeSpent = TimeSpent + ? WHERE LogID = ?
        "
    )
        .bind(time)
        .bind(usage_logs_id);
    let result = query.execute(pool).await?;
    return Ok(result.rows_affected());
}

pub async fn usage_logs_exists(pool: &SqlitePool, window_id: i64) -> Result<bool, SqlxError>{
    let query = sqlx::query(
        "
        SELECT EXISTS(SELECT 1 FROM UsageLogs WHERE WindowID = ? AND Date = ?)
        "
    )
        .bind(window_id)
        .bind(Local::now().format("%Y-%m-%d").to_string())
        .fetch_one(pool)
        .await?
        .try_get::<i32, _>(0)? != 0;
    return Ok(query);
}

pub async fn select_usage_log_by_window_id(pool: &SqlitePool, window_id: i64) -> Result<UsageLog, SqlxError> {
    let usage_log = sqlx::query_as::<_, UsageLog>(
        "
        SELECT LogID as log_id, UserID as user_id, WindowID as window_id, Date as date, TimeSpent as time_spent FROM UsageLogs WHERE WindowID = ? AND Date = ?
        "
    )
        .bind(window_id)
        .bind(Local::now().format("%Y-%m-%d").to_string())
        .fetch_one(pool)
        .await?;
    Ok(usage_log)
}

// User SQL Operations

pub async fn user_name_exists(pool: &SqlitePool, user_name: &str) -> Result<bool, SqlxError>{
    let query = sqlx::query(
        "
        SELECT EXISTS(SELECT 1 FROM Users WHERE UserName = ?)
        "
    )
        .bind(user_name)
        .fetch_one(pool)
        .await?
        .try_get::<i32, _>(0)? != 0;
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

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("sqlite_connector")
        .build()
}