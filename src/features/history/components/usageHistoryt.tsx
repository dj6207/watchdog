import React, {useState} from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { formatDate, filterUsageLogData, formatTime, truncateString, filterApplicationUsageData } from "../../../utils";
import { useGetUsageLogData, useCheckDataBaseConnected, useGetApplicationUsageData } from "../../../hooks";
import { UsageLogData, ApplicationUsageData } from "../../../types";
import { COLORS } from "../../../constants";
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';


export const UsageHistory:React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [useUsageLogData, setUseUsageLogData] = useState(true);
    const toggleNameKey = () => setUseUsageLogData(!useUsageLogData);
    const formatedDate:string = formatDate(selectedDate);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

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
    const usageLogData:UsageLogData[] = filterUsageLogData(useGetUsageLogData(formatedDate));
    const applicationUsageData:ApplicationUsageData[] = filterApplicationUsageData(useGetApplicationUsageData(formatedDate));

    return (
        <>
            <h3>Application Usage {formatDate(selectedDate)}</h3>
            <DatePicker selected={selectedDate} onChange={handleDateChange} />
            {dataBaseConnection && 
                <div>
                    <button onClick={toggleNameKey}>Toggle Graph</button>
                    {useUsageLogData ? (
                        <PieChart width={600} height={400}>
                            <Pie
                                dataKey="timeSpent"
                                nameKey="windowName"
                                isAnimationActive={false}
                                data={usageLogData}
                                fill="#8884d8"
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
                </div>
            }
        </>
    )
}