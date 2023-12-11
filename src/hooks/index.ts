import { useState, useEffect } from "react";
import { ApplicationUsageData, UsageLogData, RustTotalUsageLogTime, RustUsageLogData, RustApplicationUsageData } from "../types";
import { invoke } from '@tauri-apps/api/tauri'

export const useCheckDataBaseConnected = ():boolean => {
    const [datebaseConnected, setDatebaseConnected] = useState<boolean>(false);
    try {
        useEffect(() => {
            invoke<boolean>("plugin:sqlite_connector|is_sqlite_connected").then((status) => {
                console.log(`Connection Status ${status}`);
                setDatebaseConnected(status);
            });
        }, [])
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return datebaseConnected;
}

export const useGetTotalUsageLogTime = (date:string):number => {
    const [totalUsageTime, setTotalUsageTime] = useState<number>(0);
    try {
        useEffect(() => {
            invoke<RustTotalUsageLogTime>("plugin:sqlite_connector|get_total_usage_log_time", { date: date }).then((res) => {
                setTotalUsageTime(res.total_usage_time);
            });
        }, [date]);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return totalUsageTime;
}

export const useGetUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    try {
        useEffect(() => {
            invoke<RustUsageLogData[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((res) => {
                const usageLogDataObject = res.map(obj => ({
                  logId: obj.log_id,
                  windowName: obj.window_name,
                  executableName: obj.executable_name,
                  timeSpent: obj.time_spent,
                }));
                setUsageLogData(usageLogDataObject);
            });
        }, [date]);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return usageLogData;
}

export const useGetApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    try {
        useEffect(() => {
            invoke<RustApplicationUsageData[]>("plugin:sqlite_connector|get_application_usage_data", { date: date }).then((res) => {
                const applicationUsageDataObject = res.map(obj => ({
                    applicationId: obj.application_id,
                    executableName: obj.executable_name,
                    totalTimeSpent: obj.total_time_spent,
                }));
                setApplicationUsageData(applicationUsageDataObject);
            });
        }, [date]);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return applicationUsageData
}

export const useUpdateUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    try {
        useEffect(() => {
            const getUsageLogData = () => {
                invoke<RustUsageLogData[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((res) => {
                    const usageLogDataObject = res.map(obj => ({
                      logId: obj.log_id,
                      windowName: obj.window_name,
                      executableName: obj.executable_name,
                      timeSpent: obj.time_spent,
                    }));
                    setUsageLogData(usageLogDataObject);
                });
            }
            getUsageLogData();
            const interval = setInterval(getUsageLogData, 1000);
            return () => clearInterval(interval);
        }, []);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return usageLogData;
}

export const useUpdateApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    try {
        useEffect(() => {
            const getApplicationUsageData = () => {
                invoke<RustApplicationUsageData[]>("plugin:sqlite_connector|get_application_usage_data", { date: date }).then((res) => {
                    const applicationUsageDataObject = res.map(obj => ({
                        applicationId: obj.application_id,
                        executableName: obj.executable_name,
                        totalTimeSpent: obj.total_time_spent,
                    }));
                    setApplicationUsageData(applicationUsageDataObject);
                });
            }
            getApplicationUsageData();
            const interval = setInterval(getApplicationUsageData, 1000);
            return () => clearInterval(interval);
        }, []);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return applicationUsageData
}

export const useUpdateTotalUsageLogTime = (date:string):number => {
    const [totalUsageTime, setTotalUsageTime] = useState<number>(0);
    try {
        useEffect(() => {
            const getTotalUsageLogTime = () => {
                invoke<RustTotalUsageLogTime>("plugin:sqlite_connector|get_total_usage_log_time", { date: date }).then((res) => {
                    setTotalUsageTime(res.total_usage_time);
                });
            }
            getTotalUsageLogTime();
            const interval = setInterval(getTotalUsageLogTime, 1000);
            return () => clearInterval(interval);
        }, [date]);
    } catch (error) {
        console.log(`Error retrieving data ${error}`);
    }
    return totalUsageTime;
}