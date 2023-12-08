import React from "react";
import { invoke } from '@tauri-apps/api/tauri'
import { PieChart, Pie, Tooltip, Legend } from 'recharts';
import { UsageLogData } from "../types";

export const Home: React.FC = () => {

    const data = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
    ];

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0')
    const date = `${year}-${month}-${day}`;

    const isDbConnected = async () => {
      const connected = await invoke("plugin:sqlite_connector|is_sqlite_connected");
      console.log(connected)
    }

    // Add date parameter
    const getUsageLogData = async ():Promise<UsageLogData[]> => {
      const data = await invoke<any[]>("plugin:sqlite_connector|get_usage_log_data", { date: date });
      const mappedData:UsageLogData[] = data.map(log => ({
        logId: log.log_id,
        windowName: log.window_name,
        executableName: log.executable_name,
        timeSpent: log.time_spent,
      }));
      return mappedData;
    }

    return (
      <>
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={data}
            cx={200}
            cy={200}
            outerRadius={80}
            fill="#8884d8"
            label
          />
          <Tooltip />
          <Legend />
        </PieChart>
        <button onClick={isDbConnected}>DB</button>
        <button onClick={getUsageLogData}>Test</button>
      </>
    );
}