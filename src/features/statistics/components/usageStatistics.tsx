import React from "react";
import { useGetTotalUsageLogTime, useUpdateTotalUsageLogTime } from "../../../hooks";
import { formatDate, formatDateMonthDayYear, formatTime } from "../../../utils";
import { UsageStatisticsProps } from "../../../types";
import "../assets/usageStatistics.css";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export const UsageStatistics: React.FC<UsageStatisticsProps> = ({ realTime, className, selectedDate, setSelectedDate }:UsageStatisticsProps) => {
    const today:Date = new Date();
    const date:string = formatDate(today);

    const totalUsageTime = realTime ? useUpdateTotalUsageLogTime(date) : useGetTotalUsageLogTime(formatDate(selectedDate));
    const formattedTime = formatTime(totalUsageTime);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    // TODO: Add more statistics
    return (
        <div className={`usage-statistic-container ${className}`}>
            {!realTime ? (
                <DatePicker className="calender" selected={selectedDate} onChange={handleDateChange} />
            ) : (
                <div className="date">{formatDateMonthDayYear(today)}</div>
            )}
            <div className="usage-time">{formattedTime}</div>
        </div>
    )
}