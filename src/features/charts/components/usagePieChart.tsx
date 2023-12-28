import React, {useState} from "react";
import { useCheckDataBaseConnected, useUpdateUsageLogData, useUpdateApplicationUsageData, useGetUsageLogData, useGetApplicationUsageData } from '../../../hooks';
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';
import { formatDate, filterUsageLogData, formatTime, truncateString, filterApplicationUsageData } from "../../../utils";
import { COLORS } from "../../../constants";
import { UsageLogData, ApplicationUsageData, PieChartProps, ChartDataType } from "../../../types";
import { UsageStatistics } from "../..";
import { useAppSelector } from "../../../app/hooks";
import '../assets/UsagePieChart.css'

export const UsagePieChart: React.FC<PieChartProps> = ({ }: PieChartProps) => {
    const [useUsageData, setUseUsageData] = useState<ChartDataType>(ChartDataType.WindowUsageData);
    const today:Date = new Date();
    const selectedDate:Date = useAppSelector((state) => state.graph.selectedDate);

    const formatedToday:string = formatDate(today);
    const formatedSelectDate:string = formatDate(selectedDate);
    const realTime:boolean = formatedToday == formatedSelectDate;
    
    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const usageLogData:UsageLogData[] = realTime ? filterUsageLogData(useUpdateUsageLogData(formatedToday)) : filterUsageLogData(useGetUsageLogData(formatedSelectDate));
    const applicationUsageData:ApplicationUsageData[] = realTime ? filterApplicationUsageData(useUpdateApplicationUsageData(formatedToday)) : filterApplicationUsageData(useGetApplicationUsageData(formatedSelectDate));
    
    // const toggleUsageData = () => setUseUsageData(!useUsageData);

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            const getToolTipName = (chartData:ChartDataType) => {
                switch (chartData) {
                    case ChartDataType.ExecutableUsageData:
                        return data.executableName;
                    default:
                        return data.windowName;
                }
            }

            const getToolTipValue = (chartData:ChartDataType) => {
                switch (chartData) {
                    case ChartDataType.ExecutableUsageData:
                        return data.totalTimeSpent;
                    default:
                        return data.timeSpent;
                }
            }

            return (
                <div className="custom-tooltip">
                    <p>{getToolTipName(useUsageData)}</p>
                    <p>{formatTime(getToolTipValue(useUsageData))}</p>
                </div>
            );
        }
    };

    const getDataKey = (chartData:ChartDataType):string => {
        switch (chartData) {
            case ChartDataType.ExecutableUsageData:
                return "totalTimeSpent";
            default:
                return "timeSpent";
        }
    }

    const getNameKey = (chartData:ChartDataType):string => {
        switch (chartData) {
            case ChartDataType.ExecutableUsageData:
                return "executableName";
            default:
                return "windowName";
        }
    }

    const getUsageData = (chartData:ChartDataType):UsageLogData[] | ApplicationUsageData[] => {
        switch (chartData) {
            case ChartDataType.ExecutableUsageData:
                return applicationUsageData;
            default:
                return usageLogData;
        }
    }

    // Label key error bruh
    return (
        <div className="usage-pie-chart-container">
            {dataBaseConnection && 
                <>
                    {/* <button onClick={toggleUsageData}>Toggle Graph</button> */}
                    <div className="chart">
                        <UsageStatistics className="usage-statistics"/>
                        <hr className="separator"/>
                        <div className="chart-data-selector">
                            <button onClick={() => setUseUsageData(ChartDataType.WindowUsageData)}>Usage Data</button>
                            <button onClick={() => setUseUsageData(ChartDataType.ExecutableUsageData)}>Executable Data</button>
                        </div>
                        <PieChart className="pie-chart" width={600} height={400} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                dataKey={getDataKey(useUsageData)}
                                nameKey={getNameKey(useUsageData)}
                                isAnimationActive={false}
                                data={getUsageData(useUsageData)}
                                fill="#8884d8"
                                labelLine={false}
                            >
                                {(getUsageData(useUsageData)).map((_, index) => (
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