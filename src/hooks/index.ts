import { useState, useEffect } from "react";
import { UsageLogData } from "../types";
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
            const usageLogDataObject = data.map(log => ({
              logId: log.log_id,
              windowName: log.window_name,
              executableName: log.executable_name,
              timeSpent: log.time_spent,
            }));
            setUsageLogData(usageLogDataObject);
        });
    }, [date]);
    return usageLogData;
}

export const useUpdateUsageLogData = (date:string) => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        const getUsageLogData = () => {
            invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((data) => {
                const usageLogDataObject = data.map(log => ({
                  logId: log.log_id,
                  windowName: log.window_name,
                  executableName: log.executable_name,
                  timeSpent: log.time_spent,
                }));
                setUsageLogData(usageLogDataObject);
            });
        }
        getUsageLogData();
        const interval = setInterval(getUsageLogData, 1000);
        return () => clearInterval(interval);
    }, [date]);
    return usageLogData;
}