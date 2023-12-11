import React from "react";
import { useGetTotalUsageLogTime, useUpdateTotalUsageLogTime } from "../../../hooks";
import { formatDate, formatTime } from "../../../utils";
import { UsageStatisticsProps } from "../../../types";

export const UsageStatistics: React.FC<UsageStatisticsProps> = ({ realTime }:UsageStatisticsProps) => {
    const today:Date = new Date();
    const date:string = formatDate(today);

    const totalUsageTime = realTime ? useUpdateTotalUsageLogTime(date) : useGetTotalUsageLogTime(date);
    const formattedTime = formatTime(totalUsageTime);

    // TODO: Add more statistics
    return (
        <div>
            <h3>Application Usage Statisitcs {date}</h3>
            <div> Total time tracked: {formattedTime}</div>
        </div>
    )
}