import React from "react";
import { useCheckDataBaseConnected, useUpdateUsageLogData } from '../../../hooks';
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';
import { formatDate, filterUsageLogData, formatTime, truncateString } from "../../../utils";
import { COLORS } from "../../../constants";
import '../assets/UsagePieChart.css'
import { UsageLogData } from "../../../types";

export const UsagePieChart: React.FC = () => {
    const today:Date = new Date();
    const date:string = formatDate(today);

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