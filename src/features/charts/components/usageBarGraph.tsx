import React from "react";
import { useCheckDataBaseConnected } from "../../../hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getDaysOfCurrentWeek } from "../../../utils";
import { UsageLogData } from "../../../types";

export const UsageBarGraph: React.FC = () => {
    const dataBaseConnection:boolean = useCheckDataBaseConnected();
    const daysOfWeek = getDaysOfCurrentWeek();
    console.log(daysOfWeek);

    const fakeData = [
        {
            date: "2023-12-11",
            data: [
                {
                    logId: 1,
                    windowName: "k",
                    executableName: "k.exe",
                    timeSpent: 1,
                    date: "2023-12-11"
                },
                {
                    logId: 2,
                    windowName: "gg",
                    executableName: "gg.exe",
                    timeSpent: 5,
                    date: "2023-12-11"
                },
                {
                    logId: 3,
                    windowName: "p",
                    executableName: "p.exe",
                    timeSpent: 3,
                    date: "2023-12-11"
                },
            ]
        },
        {
            date: "2023-12-12",
            data: [
                {
                    logId: 4,
                    windowName: "l",
                    executableName: "l.exe",
                    timeSpent: 60,
                    date: "2023-12-12"
                },
            ]
        }
    ]

    return (
        <>
            {dataBaseConnection &&
                <>
                    <BarChart
                        width={600}
                        height={400}
                        data={fakeData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                    >
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Bar dataKey="data" stackId="a" fill="#8884d8" />
                        <CartesianGrid strokeDasharray="3 3" />
                    </BarChart>
                </>
            }
        </>
    )
}