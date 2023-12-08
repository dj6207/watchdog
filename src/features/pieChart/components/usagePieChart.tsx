import React, {useState} from "react";
import { invoke } from '@tauri-apps/api/tauri'
import { UsageLogData } from "../../../types";
import { PieChart, Pie, Tooltip, Legend } from 'recharts';

export const UsagePieChart: React.FC = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0')
    const date = `${year}-${month}-${day}`;


    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    const [datebaseConnected, setDatebaseConnected] = useState<boolean>(false);


    const isDataBaseConnected = ():boolean => {
        invoke<boolean>("plugin:sqlite_connector|is_sqlite_connected").then((status) => {
            setDatebaseConnected(status);
        });
        return datebaseConnected;
    }

    const getUsageLogData = () => {
        invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((data) => {
            const usageDataLogs = data.map(log => ({
              logId: log.log_id,
              windowName: log.window_name,
              executableName: log.executable_name,
              timeSpent: log.time_spent,
            }));
            setUsageLogData(usageDataLogs);
        });
    }

    const truncateString = (string: string, length: number): string => {
        return string.length > length ? `${string.slice(0, length)}...` : string;
    };

    const renderLabel = (string:string, percent:number) => {
        if (percent < 0.05) {
            return null;
        }
        return truncateString(string, 15)
    }

    getUsageLogData();

    return (
        <>
            {isDataBaseConnected() && 
                <PieChart width={400} height={400}>
                <Pie
                    dataKey="timeSpent"
                    nameKey="windowName"
                    isAnimationActive={false}
                    data={usageLogData}
                    fill="#8884d8"
                    label={({ name, percent }) => percent > 0.05 ? truncateString(name, 15) : ''}
                    labelLine={false}
                />
                <Tooltip />
                <Legend formatter={(label) => renderLabel(label, 15)}/>
            </PieChart>
            }
        </>
    )
}