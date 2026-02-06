import { useState, useEffect } from 'react';

interface Process {
    pid: number;
    user: string;
    pri: number;
    ni: number;
    virt: string;
    res: string;
    shr: string;
    s: string;
    cpu: number;
    mem: number;
    time: string;
    command: string;
}

const generateRandomProcess = (id: number): Process => {
    const commands = [
        '/usr/bin/gnome-shell',
        '/usr/lib/Xorg',
        'kadir-os-renderer',
        'chrome --type=renderer',
        'node server.js',
        'bash',
        'htop',
        'systemd --user',
        'pulseaudio',
        'dbus-daemon',
        'kworker/u16:0'
    ];

    return {
        pid: 1000 + id,
        user: id < 5 ? 'root' : 'kadir',
        pri: 20,
        ni: 0,
        virt: `${Math.floor(Math.random() * 500 + 100)}M`,
        res: `${Math.floor(Math.random() * 100 + 10)}M`,
        shr: `${Math.floor(Math.random() * 50 + 5)}M`,
        s: 'S',
        cpu: Math.random() * (id === 0 ? 15 : 5),
        mem: Math.random() * 2,
        time: `0:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}.${Math.floor(Math.random() * 99)}`,
        command: commands[id % commands.length]
    };
};

const ProgressBar = ({ label, percent, colorClass }: { label: string, percent: number, colorClass: string }) => (
    <div className="flex items-center gap-2 font-mono text-xs mb-1">
        <span className="w-8 text-cyan-400">{label}</span>
        <div className="flex-1 bg-gray-700 h-3 relative">
            <div
                className={`h-full ${colorClass}`}
                style={{ width: `${percent}%` }}
            />
        </div>
        <span className="w-12 text-right">{percent.toFixed(1)}%</span>
    </div>
);

export const HtopApp = () => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [cpuUsage, setCpuUsage] = useState([0, 0, 0, 0]);
    const [memUsage, setMemUsage] = useState(0);
    const [swapUsage, setSwapUsage] = useState(0);

    useEffect(() => {
        // Initial population
        setProcesses(Array.from({ length: 20 }, (_, i) => generateRandomProcess(i)));

        const interval = setInterval(() => {
            // Update CPU/Mem/Swap
            setCpuUsage(prev => prev.map(() => Math.random() * 60 + 10)); // 10-70% random
            setMemUsage(Math.random() * 40 + 20); // 20-60%
            setSwapUsage(Math.random() * 5); // 0-5%

            // Update Processes
            setProcesses(prev => {
                return prev.map(p => ({
                    ...p,
                    cpu: p.command === 'htop' ? Math.random() * 2 : Math.random() * 5,
                    time: `0:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}.${Math.floor(Math.random() * 99)}` // Simply randomize time for effect
                })).sort((a, b) => b.cpu - a.cpu);
            });

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-black text-white font-mono text-xs p-2 overflow-hidden flex flex-col cursor-default select-none">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-x-4 mb-2">
                <div>
                    {cpuUsage.map((usage, i) => (
                        <ProgressBar key={i} label={String(i + 1)} percent={usage} colorClass="bg-green-500" />
                    ))}
                    <ProgressBar label="Mem" percent={memUsage} colorClass="bg-green-600" />
                    <ProgressBar label="Swp" percent={swapUsage} colorClass="bg-red-600" />
                </div>
                <div className="flex flex-col gap-1 text-gray-400">
                    <div className="flex justify-between"><span>Tasks:</span> <span className="text-white">48, 142 thr; 1 running</span></div>
                    <div className="flex justify-between"><span>Load average:</span> <span className="text-white">0.42 0.58 0.65</span></div>
                    <div className="flex justify-between"><span>Uptime:</span> <span className="text-white">14 days, 04:20:12</span></div>
                </div>
            </div>

            {/* Process List Header */}
            <div className="bg-cyan-900 text-black flex px-1 py-0.5 font-bold mt-2">
                <span className="w-12">PID</span>
                <span className="w-12">USER</span>
                <span className="w-8">PRI</span>
                <span className="w-8">NI</span>
                <span className="w-12">VIRT</span>
                <span className="w-12">RES</span>
                <span className="w-12">SHR</span>
                <span className="w-4">S</span>
                <span className="w-12">CPU%</span>
                <span className="w-12">MEM%</span>
                <span className="w-16">TIME+</span>
                <span className="flex-1">Command</span>
            </div>

            {/* Process List */}
            <div className="flex-1 overflow-y-auto">
                {processes.map((p) => (
                    <div key={p.pid} className="flex px-1 hover:bg-gray-800">
                        <span className="w-12 text-cyan-400">{p.pid}</span>
                        <span className="w-12">{p.user}</span>
                        <span className="w-8">{p.pri}</span>
                        <span className="w-8">{p.ni}</span>
                        <span className="w-12">{p.virt}</span>
                        <span className="w-12">{p.res}</span>
                        <span className="w-12">{p.shr}</span>
                        <span className="w-4">{p.s}</span>
                        <span className={`w-12 ${p.cpu > 10 ? 'text-green-500 font-bold' : ''}`}>{p.cpu.toFixed(1)}</span>
                        <span className="w-12">{p.mem.toFixed(1)}</span>
                        <span className="w-16 text-xs flex items-center">{p.time}</span>
                        <span className="flex-1 text-white truncate">{p.command}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-2 text-black bg-gray-300 flex justify-between px-2 py-0.5 font-bold">
                <span>F1Help  F2Setup  F3Search  F4Filter  F5Tree  F6SortBy  F7Nice -  F8Nice +  F9Kill  F10Quit</span>
            </div>
        </div>
    );
};
