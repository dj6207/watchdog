import React from "react";
import { invoke } from '@tauri-apps/api/tauri'
import { PieChart, Pie, Tooltip, Legend } from 'recharts';

export const Home: React.FC = () => {

    const data = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
    ];

    const isDbConnected = async () => {
      const connected = await invoke("plugin:sqlite_connector|is_sqlite_connected");
      console.log(connected)
    }

    // Add date parameter
    const getUsageLogData =async () => {
      const data = await invoke("plugin:sqlite_connector|get_usage_log_data");
      console.log(data)
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