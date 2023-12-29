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
    const selectedDateISO:string = useAppSelector((state) => state.graph.selectedDate);
    const selectedDate:Date = new Date(selectedDateISO);

    const formatedToday:string = formatDate(today);
    const formatedSelectDate:string = formatDate(selectedDate);
    const realTime:boolean = formatedToday == formatedSelectDate;


    const totalUsageTime:number = realTime ? useUpdateTotalUsageLogTime(formatedToday) : useGetTotalUsageLogTime(formatedSelectDate);

    const handleDateChange = (date: Date) => {
        dispatch(setSelectedDate(date.toISOString()));
    };

    // TODO: Add more statistics
    return (
        <div className={`usage-statistic-container ${className}`}>
            <DatePicker className="calender" selected={selectedDate} onChange={handleDateChange} />
            <div className="usage-time">{formatTime(totalUsageTime)}</div>
        </div>
    )
}