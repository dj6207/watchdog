import React, {useState, useEffect} from "react";
import { invoke } from '@tauri-apps/api/tauri'
import { UsageLogData } from "../../../types";
import { PieChart, Pie, Tooltip, TooltipProps , Cell } from 'recharts';
import '../assets/UsagePieChart.css'

export const UsagePieChart: React.FC = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0')
    const date = `${year}-${month}-${day}`;

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const dataBaseConnection = useCheckDataBaseConnected();
    const usageLogData = useUpdateUsageLogData(date);

    const truncateString = (string: string, length: number): string => {
        return string.length > length ? `${string.slice(0, length)}...` : string;
    };

    const formatTime = (seconds: number): string => {
        const secondsInMinute = 60;
        const secondsInHour = 3600;
        const secondsInDay = 86400;
        const secondsInWeek = 604800;
    
        if (seconds >= secondsInWeek) {
            const weeks = Math.floor(seconds / secondsInWeek);
            const days = Math.floor((seconds % secondsInWeek) / secondsInDay);
            return `${weeks}w ${days}d`;
        } else if (seconds >= secondsInDay) {
            const days = Math.floor(seconds / secondsInDay);
            const hours = Math.floor((seconds % secondsInDay) / secondsInHour);
            return `${days}d ${hours}h`;
        } else if (seconds >= secondsInHour) {
            const hours = Math.floor(seconds / secondsInHour);
            const minutes = Math.floor((seconds % secondsInHour) / secondsInMinute);
            return `${hours}h ${minutes}m`;
        } else if (seconds >= secondsInMinute) {
            const minutes = Math.floor(seconds / secondsInMinute);
            const remainingSeconds = seconds % secondsInMinute;
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p>{data.windowName}</p>
                    <p>{formatTime(data.timeSpent)}</p>
                </div>
            );
        }
    };

    const renderLabel = (string:string, percent:number) => {
        if (percent < 0.05) {
            return null;
        }
        return truncateString(string, 15)
    }

    // Label key error bruh
    return (
        <>
            {dataBaseConnection && 
            <>
                <h3>Graph</h3>
                <PieChart width={600} height={400}>
                    <Pie
                        dataKey="timeSpent"
                        nameKey="windowName"
                        isAnimationActive={false}
                        data={usageLogData}
                        fill="#8884d8"
                        // label={({ name, percent }) => percent > 0.05 ? truncateString(name, 10) : truncateString(name, 0)}
                        labelLine={false}
                    >
                        {usageLogData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    {/* <Tooltip /> */}
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </>
            }
        </>
    )
}

const useCheckDataBaseConnected = ():boolean => {
    const [datebaseConnected, setDatebaseConnected] = useState<boolean>(false);
    useEffect(() => {
        invoke<boolean>("plugin:sqlite_connector|is_sqlite_connected").then((status) => {
            console.log(`Connection Status ${status}`);
            setDatebaseConnected(status);
        });
    }, [])
    return datebaseConnected;
}

const useGetUsageLogData = (date:string):UsageLogData[] => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
        invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date }).then((data) => {
            const usageDataLogs = data.map(log => ({
              logId: log.log_id,
              windowName: log.window_name,
              executableName: log.executable_name,
              timeSpent: log.time_spent,
            }));
            setUsageLogData(usageDataLogs);
        });
    }, []);
    return usageLogData;
}

const useUpdateUsageLogData = (date:string) => {
    const [usageLogData, setUsageLogData] = useState<UsageLogData[]>([]);
    useEffect(() => {
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
        getUsageLogData();
        const interval = setInterval(getUsageLogData, 1000);
        return () => clearInterval(interval);
    }, [date]);
    return usageLogData;
}