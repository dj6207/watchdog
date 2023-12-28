// Types

export type UsageLogData = {
    logId: number;
    windowName: string;
    executableName: string;
    timeSpent: number;
    date: string;
}

export type ApplicationUsageData = {
    applicationId: number;
    executableName: string;
    totalTimeSpent: number;
}

export type RouteItem = {
    path: string;
    label: string;
}

// Rust Types

export type RustTotalUsageLogTime = {
    total_usage_time: number;
}

export type RustUsageLogData = {
    log_id: number,
    window_name: string,
    executable_name: string,
    time_spent: number,
    date: string,
}

export type RustApplicationUsageData = {
    application_id: number,
    executable_name: string,
    total_time_spent: number,
}

export type RustUser = {
    user_id: number,
    user_name: string,
}

// Props

export type NavBarProps = {
    userRoutes: RouteItem[];
}

export type UsageStatisticsProps = {
    className?: string | undefined;
}

export type PieChartProps = {
}

// Redux States

export interface UserState {
    userName: string | undefined;
}

export interface GraphState {
    selectedDate: Date;
}

// Enums

export enum ChartDataType {
    WindowUsageData,
    ExecutableUsageData,
}
