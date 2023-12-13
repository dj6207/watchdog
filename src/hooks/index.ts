import { useState, useEffect } from "react";
import { ApplicationUsageData, UsageLogData, RustTotalUsageLogTime, RustUsageLogData, RustApplicationUsageData } from "../types";
import { invoke } from '@tauri-apps/api/tauri'

// TODO: Untested
export const useGetUser = ():string => {
    const [userName, setUserName] = useState<string>("Unknown");  
    useEffect(() => {
        invoke<string>("plugin:user|get_current_user")
            .then((res) => {
                setUserName(res);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);
    return userName; 
}

export const useCheckDataBaseConnected = ():boolean => {
    const [datebaseConnected, setDatebaseConnected] = useState<boolean>(false);
    useEffect(() => {
        invoke<boolean>("plugin:sqlite_connector|is_sqlite_connected")
            .then((res) => {
                setDatebaseConnected(res);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);
    return datebaseConnected;
}

export const useGetTotalUsageLogTime = (date:string):number => {
    const [totalUsageTime, setTotalUsageTime] = useState<number>(0);
    useEffect(() => {
        invoke<RustTotalUsageLogTime>("plugin:sqlite_connector|get_total_usage_log_time", { date: date })
            .then((res) => {
                setTotalUsageTime(res.total_usage_time);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [date]);
    return totalUsageTime;
}

// TODO: Rewrite error catching
export const useGetUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        invoke<RustUsageLogData[]>("plugin:sqlite_connector|get_usage_log_data", { date: date })
            .then((res) => {
                const usageLogDataObject = res.map(obj => ({
                    logId: obj.log_id,
                    windowName: obj.window_name,
                    executableName: obj.executable_name,
                    timeSpent: obj.time_spent,
                    date: obj.date,
                }));
                setUsageLogData(usageLogDataObject);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [date]);
    return usageLogData;
}

export const useGetApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    useEffect(() => {
        invoke<RustApplicationUsageData[]>("plugin:sqlite_connector|get_application_usage_data", { date: date })
            .then((res) => {
                const applicationUsageDataObject = res.map(obj => ({
                    applicationId: obj.application_id,
                    executableName: obj.executable_name,
                    totalTimeSpent: obj.total_time_spent,
                }));
                setApplicationUsageData(applicationUsageDataObject);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [date]);
    return applicationUsageData
}

export const useUpdateUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        const getUsageLogData = () => {
            invoke<RustUsageLogData[]>("plugin:sqlite_connector|get_usage_log_data", { date: date })
                .then((res) => {
                    const usageLogDataObject = res.map(obj => ({
                        logId: obj.log_id,
                        windowName: obj.window_name,
                        executableName: obj.executable_name,
                        timeSpent: obj.time_spent,
                        date: obj.date,
                    }));
                    setUsageLogData(usageLogDataObject);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        getUsageLogData();
        const interval = setInterval(getUsageLogData, 1000);
        return () => clearInterval(interval);
    }, []);
    return usageLogData;
}

export const useUpdateApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    useEffect(() => {
        const getApplicationUsageData = () => {
            invoke<RustApplicationUsageData[]>("plugin:sqlite_connector|get_application_usage_data", { date: date })
                .then((res) => {
                    const applicationUsageDataObject = res.map(obj => ({
                        applicationId: obj.application_id,
                        executableName: obj.executable_name,
                        totalTimeSpent: obj.total_time_spent,
                    }));
                    setApplicationUsageData(applicationUsageDataObject);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        getApplicationUsageData();
        const interval = setInterval(getApplicationUsageData, 1000);
        return () => clearInterval(interval);
    }, []);
    return applicationUsageData
}

export const useUpdateTotalUsageLogTime = (date:string):number => {
    const [totalUsageTime, setTotalUsageTime] = useState<number>(0);
    useEffect(() => {
        const getTotalUsageLogTime = () => {
            invoke<RustTotalUsageLogTime>("plugin:sqlite_connector|get_total_usage_log_time", { date: date })
                .then((res) => {
                    setTotalUsageTime(res.total_usage_time);
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        getTotalUsageLogTime();
        const interval = setInterval(getTotalUsageLogTime, 1000);
        return () => clearInterval(interval);
    }, [date]);
    return totalUsageTime;
}