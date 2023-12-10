import { useState, useEffect } from "react";
import { ApplicationUsageData, UsageLogData } from "../types";
import { invoke } from '@tauri-apps/api/tauri'

export const useCheckDataBaseConnected = ():boolean => {
    const [datebaseConnected, setDatebaseConnected] = useState<boolean>(false);
    useEffect(() => {
        invoke<boolean>("plugin:sqlite_connector|is_sqlite_connected").then((status) => {
            console.log(`Connection Status ${status}`);
            setDatebaseConnected(status);
        });
    }, [])
    return datebaseConnected;
}

export const useGetUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((data) => {
            const usageLogDataObject = data.map(obj => ({
              logId: obj.log_id,
              windowName: obj.window_name,
              executableName: obj.executable_name,
              timeSpent: obj.time_spent,
            }));
            setUsageLogData(usageLogDataObject);
        });
    }, [date]);
    return usageLogData;
}

export const useGetApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    useEffect(() => {
        invoke<any[]>("plugin:sqlite_connector|get_application_usage_data", { date: date }).then((data) => {
            const applicationUsageDataObject = data.map(obj => ({
                applicationId: obj.application_id,
                executableName: obj.executable_name,
                totalTimeSpent: obj.total_time_spent,
            }));
            setApplicationUsageData(applicationUsageDataObject);
        });
    }, [date]);
    return applicationUsageData
}

export const useUpdateUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        const getUsageLogData = () => {
            invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((data) => {
                const usageLogDataObject = data.map(obj => ({
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
    return usageLogData;
}

export const useUpdateApplicationUsageData = (date:string):ApplicationUsageData[] => {
    const [applicationUsageData, setApplicationUsageData] = useState<ApplicationUsageData[]>([]);
    useEffect(() => {
        const getApplicationUsageData = () => {
            invoke<any[]>("plugin:sqlite_connector|get_application_usage_data", { date: date }).then((data) => {
                const applicationUsageDataObject = data.map(obj => ({
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
    return applicationUsageData
}