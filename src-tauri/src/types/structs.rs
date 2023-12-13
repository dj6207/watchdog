use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize)]
pub struct ApplicationUsageData {
    pub application_id: i64,
    pub executable_name: String,
    pub total_time_spent: i64,
}

#[derive(Debug, Serialize)]
pub struct UsageLogData {
    pub log_id: i64,
    pub window_name: String,
    pub executable_name: String,
    pub time_spent: i64,
    pub date: String,
}

#[derive(Debug, FromRow, Serialize)]
pub struct TotalUsageTime {
    pub total_usage_time: i64,
}

#[derive(Debug, FromRow)]
pub struct UsageLog {
    pub log_id: i64,
    pub user_id: i64,
    pub window_id: i64,
    pub date: String,
    pub time_spent: i64,
}

#[derive(Debug, FromRow)]
pub struct ApplicationWindow {
    pub window_id: i64,
    pub application_id: i64,
    pub window_name: String,
}

#[derive(Debug, FromRow)]
pub struct Application {
    pub application_id: i64,
    pub executable_name: String,
}

#[derive(Debug, FromRow, Serialize)]
pub struct User {
    pub user_id: i64,
    pub user_name: String,
}