import React, {useState} from "react";
import { useCheckDataBaseConnected, useUpdateUsageLogData, useUpdateApplicationUsageData, useGetUsageLogData, useGetApplicationUsageData } from '../../../hooks';
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';
import { formatDate, filterUsageLogData, formatTime, truncateString, filterApplicationUsageData } from "../../../utils";
import { COLORS } from "../../../constants";
import { UsageLogData, ApplicationUsageData, PieChartProps } from "../../../types";
import { UsageStatistics } from "../..";
import { useAppSelector } from "../../../app/hooks";
import '../assets/UsagePieChart.css'

export const UsagePieChart: React.FC<PieChartProps> = ({ }: PieChartProps) => {
    const [useUsageLogData, setUseUsageLogData] = useState(true);
    const today:Date = new Date();
    const selectedDate:Date = useAppSelector((state) => state.graph.selectedDate);

    const formatedToday:string = formatDate(today);
    const formatedSelectDate:string = formatDate(selectedDate);
    const realTime:boolean = formatedToday == formatedSelectDate;
    
    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const usageLogData:UsageLogData[] = realTime ? filterUsageLogData(useUpdateUsageLogData(formatedToday)) : filterUsageLogData(useGetUsageLogData(formatedSelectDate));
    const applicationUsageData:ApplicationUsageData[] = realTime ? filterApplicationUsageData(useUpdateApplicationUsageData(formatedToday)) : filterApplicationUsageData(useGetApplicationUsageData(formatedSelectDate));
    
    const toggleNameKey = () => setUseUsageLogData(!useUsageLogData);

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

    // Label key error bruh
    return (
        <div className="usage-pie-chart-container">
            {dataBaseConnection && 
                <>
                    <button onClick={toggleNameKey}>Toggle Graph</button>
                    <div className="chart">
                        <UsageStatistics className="usage-statistics"/>
                        <hr className="separator"/>
                        <PieChart className="pie-chart" width={600} height={400} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                dataKey={useUsageLogData ? "timeSpent" : "totalTimeSpent"}
                                nameKey={useUsageLogData ? "windowName" : "executableName"}
                                isAnimationActive={false}
                                data={useUsageLogData ? usageLogData : applicationUsageData}
                                fill="#8884d8"
                                labelLine={false}
                            >
                                {(useUsageLogData ? usageLogData : applicationUsageData).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip content={<CustomTooltip/>} />
                            <Legend 
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                formatter={(label) => truncateString(label, 20)}
                            />
                        </PieChart>
                    </div>
                </>
            }
        </div>
    )
}