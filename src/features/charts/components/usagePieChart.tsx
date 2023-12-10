import React from "react";
import { useCheckDataBaseConnected, useUpdateUsageLogData } from '../../../hooks';
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';
import { formatDate, filterUsageLogData } from "../../../utils";
import { COLORS } from "../../../constants";
import '../assets/UsagePieChart.css'
import { UsageLogData } from "../../../types";

export const UsagePieChart: React.FC = () => {
    const today:Date = new Date();
    const date:string = formatDate(today);

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

    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const usageLogData:UsageLogData[] = filterUsageLogData(useUpdateUsageLogData(date));

    // TODO: Create most used list
    // TODO: Create average time spent
    // TODO: Create calender selector to pull up usage dates

    // Label key error bruh
    return (
        <>
            {dataBaseConnection && 
                <>
                    <h3>Application Usage {date}</h3>
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip/>} />
                        <Legend formatter={(label) => truncateString(label, 20)}/>
                    </PieChart>
                </>
            }
        </>
    )
}