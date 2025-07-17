import React from 'react';
import { socket } from '../services/socket';


export default function SteamLauncher() {
    const handleStart = () => {
        socket.emit('start-steamcmd');
    };

    return (
        <div className="p-4">
            <button
                onClick={handleStart}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Iniciar SteamCMD
            </button>
        </div>
    );
}
