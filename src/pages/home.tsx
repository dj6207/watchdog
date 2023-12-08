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
      

    // const getUserName = async () => {
    //     const userName = await invoke("plugin:user|get_user_name");
    //     console.log(userName)
    // }

    // const getWindowName = async () => {
    //     const window_name = await invoke("plugin:windows|get_foreground_window");
    //     console.log(window_name)
    // }

    return (
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
    );
}