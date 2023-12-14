import React from "react";
import { useCheckDataBaseConnected } from "../../../hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getDaysOfCurrentWeek } from "../../../utils";
import { UsageLogData } from "../../../types";

export const UsageBarGraph: React.FC = () => {
    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const daysOfWeek = getDaysOfCurrentWeek();

    return (
        <>
            {dataBaseConnection &&
                <>
                </>
            }
        </>
    )
}