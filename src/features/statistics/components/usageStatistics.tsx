import React from "react";
import { useGetTotalUsageLogTime, useUpdateTotalUsageLogTime } from "../../../hooks";
import { formatDate, formatTime } from "../../../utils";
import { UsageStatisticsProps } from "../../../types";
import "../assets/usageStatistics.css";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setSelectedDate } from "../../../slices/graphSlice";

export const UsageStatistics: React.FC<UsageStatisticsProps> = ({ className }:UsageStatisticsProps) => {
    const dispatch = useAppDispatch();

    const today:Date = new Date();
    const selectedDate:Date = useAppSelector((state) => state.graph.selectedDate);

    const totalUsageTime:number = selectedDate == today ? useUpdateTotalUsageLogTime(formatDate(today)) : useGetTotalUsageLogTime(formatDate(selectedDate));

    const handleDateChange = (date: Date) => {
        dispatch(setSelectedDate(date));
    };

    // TODO: Add more statistics
    return (
        <div className={`usage-statistic-container ${className}`}>
            <DatePicker className="calender" selected={selectedDate} onChange={handleDateChange} />
            <div className="usage-time">{formatTime(totalUsageTime)}</div>
        </div>
    )
}