import React from "react";
import { invoke } from '@tauri-apps/api/tauri'

export const Home: React.FC = () => {
    const getUserName = async () => {
        const userName = await invoke("plugin:user|get_user_name");
        console.log(userName)
    }

    const getWindowName = async () => {
        const window_name = await invoke("plugin:windows|get_foreground_window");
        console.log(window_name)
    }

    return (
        <div>
            <button onClick={getUserName}>Get User Name</button>
            <button onClick={getWindowName}>Window</button>
        </div>
    )
}