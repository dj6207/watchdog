import React, {useState} from "react";
import { useCheckDataBaseConnected, useUpdateUsageLogData, useUpdateApplicationUsageData } from '../../../hooks';
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';
import { formatDate, filterUsageLogData, formatTime, truncateString, filterApplicationUsageData } from "../../../utils";
import { COLORS } from "../../../constants";
import '../assets/UsagePieChart.css'
import { UsageLogData, ApplicationUsageData } from "../../../types";

export const UsagePieChart: React.FC = () => {
    const [useUsageLogData, setUseUsageLogData] = useState(true);
    const toggleNameKey = () => setUseUsageLogData(!useUsageLogData);

    const today:Date = new Date();
    const date:string = formatDate(today);

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip">
                    <p>{useUsageLogData ? data.windowName : data.executableName}</p>
                    <p>{formatTime(useUsageLogData ? data.timeSpent : data.totalTimeSpent)}</p>
                </div>
            );
        }
    };

    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const usageLogData:UsageLogData[] = filterUsageLogData(useUpdateUsageLogData(date));
    const applicationUsageData:ApplicationUsageData[] = filterApplicationUsageData(useUpdateApplicationUsageData(date));

    // TODO: Create most used list
    // TODO: Create average time spent

    // Label key error bruh
    return (
        <>
            <h3>Application Usage {date}</h3>
            {dataBaseConnection && 
                <>
                    <button onClick={toggleNameKey}>Toggle Graph</button>
                    {useUsageLogData ? (
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
                    ) : (
                        <PieChart width={600} height={400}>
                            <Pie
                                dataKey="totalTimeSpent"
                                nameKey="executableName"
                                isAnimationActive={false}
                                data={applicationUsageData}
                                fill="#8884d8"
                                // label={({ name, percent }) => percent > 0.05 ? truncateString(name, 10) : truncateString(name, 0)}
                                labelLine={false}
                            >
                                {applicationUsageData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip/>} />
                            <Legend formatter={(label) => truncateString(label, 20)}/>
                        </PieChart>
                    )}
                </>
            }
        </>
    )
}