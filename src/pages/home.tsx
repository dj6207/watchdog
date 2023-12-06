import React from "react";
import { invoke } from '@tauri-apps/api/tauri'

export const Home: React.FC = () => {
    const getUserName = async () => {
        const userName = await invoke("plugin:user|get_user_name");
        console.log(userName)
    }

    return (
        <div>
            <button onClick={getUserName}>Get User Name</button>
        </div>
    )
}