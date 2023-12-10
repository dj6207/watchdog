import React, {useState} from "react";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { formatDate, filterUsageLogData } from "../../../utils";
import { useGetUsageLogData, useCheckDataBaseConnected } from "../../../hooks";
import { UsageLogData } from "../../../types";
import { COLORS } from "../../../constants";
import { PieChart, Pie, Tooltip, TooltipProps , Cell, Legend } from 'recharts';


export const UsageHistory:React.FC = () => {
    // TODO: Incorporate legend and tool tips

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const formatedDate:string = formatDate(selectedDate);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const usageLogData:UsageLogData[] = filterUsageLogData(useGetUsageLogData(formatedDate));
    
    return (
        <>
            <h3>History</h3>
            <DatePicker selected={selectedDate} onChange={handleDateChange} />
            {dataBaseConnection && 
                <>
                    <h3>Application Usage {formatDate(selectedDate)}</h3>
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
                        {/* <Tooltip content={<CustomTooltip/>} />
                        <Legend formatter={(label) => truncateString(label, 20)}/> */}
                    </PieChart>
                </>
            }
        </>
    )
}