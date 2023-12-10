export type UsageLogData = {
    logId: number;
    windowName: string;
    executableName: string;
    timeSpent: number;
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

export type NavBarProps = {
    userRoutes: RouteItem[];
}

export interface UserState {
    userName: string;
}
