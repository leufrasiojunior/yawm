import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // Altere se o backend estiver em outra URL/porta

export function SteamForm() {
    const [form, setForm] = useState({
        username: '',
        password: '',
        appId: '',
        workshopId: '',
    });

    const [logs, setLogs] = useState<string[]>([]);
    const [need2FA, setNeed2FA] = useState(false);
    const [code2FA, setCode2FA] = useState('');

    useEffect(() => {
        socket.on('steam-output', (data) => {
            setLogs((prev) => [...prev, data]);
        });

        socket.on('2fa-request', () => {
            setNeed2FA(true);
        });

        socket.on('steam-error', (err) => {
            setLogs((prev) => [...prev, `❌ ${err}`]);
        });

        socket.on('steam-complete', (code) => {
            setLogs((prev) => [...prev, `✅ Finalizado com código ${code}`]);
        });

        return () => {
            socket.off();
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        socket.emit('start-download', form);
        setLogs([]); // limpa log anterior
    };

    const handle2FASubmit = () => {
        socket.emit('send-2fa', code2FA);
        setNeed2FA(false);
        setCode2FA('');
    };

    return (
        <div className="max-w-xl mx-auto p-4 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-2">
                <input type="text" placeholder="Usuário Steam" value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full p-2 border rounded" />

                <input type="password" placeholder="Senha" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2 border rounded" />

                <input type="text" placeholder="App ID" value={form.appId}
                    onChange={(e) => setForm({ ...form, appId: e.target.value })}
                    className="w-full p-2 border rounded" />

                <input type="text" placeholder="Workshop ID" value={form.workshopId}
                    onChange={(e) => setForm({ ...form, workshopId: e.target.value })}
                    className="w-full p-2 border rounded" />

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    Iniciar Download
                </button>
            </form>

            {need2FA && (
                <div className="flex space-x-2 items-center">
                    <input type="text" placeholder="Código 2FA" value={code2FA}
                        onChange={(e) => setCode2FA(e.target.value)}
                        className="flex-1 p-2 border rounded" />
                    <button onClick={handle2FASubmit} className="bg-green-600 text-white px-4 py-2 rounded">
                        Enviar 2FA
                    </button>
                </div>
            )}

            <div className="bg-black text-green-400 p-2 mt-4 h-64 overflow-y-auto text-sm rounded">
                {logs.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
}
