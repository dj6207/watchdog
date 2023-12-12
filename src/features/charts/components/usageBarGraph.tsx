import React from "react";
import { useCheckDataBaseConnected } from "../../../hooks";
import { BarChart, Bar, CartesianGrid } from "recharts";
import { getDaysOfCurrentWeek } from "../../../utils";

export const UsageBarGraph: React.FC = () => {
    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const daysOfWeek = getDaysOfCurrentWeek();
    console.log(daysOfWeek);


    return (
        <>
            {dataBaseConnection &&
                <>
                    <BarChart
                        width={600}
                        height={400}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                    </BarChart>
                </>
            }
        </>
    )
}