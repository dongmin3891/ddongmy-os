'use client';

import { useEffect, useState } from 'react';

interface ServerStatusResponse {
    cpu: number;
    ram: number;
    uptime: string;
}

export default function ServerStatusWidget() {
    const [status, setStatus] = useState<ServerStatusResponse | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/server-status');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setStatus(data);
                setError(false);
            } catch (err) {
                console.error('Server status fetch error:', err);
                setError(true);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    if (error || !status) {
        return (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">서버 상태</h3>
                <div className="text-xs text-slate-500">데이터를 불러올 수 없습니다</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-accent-400 mb-4">서버 상태</h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">CPU</span>
                        <span className="text-xs font-mono text-primary-400">
                            {status.cpu.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(status.cpu, 100)}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">RAM</span>
                        <span className="text-xs font-mono text-accent-400">
                            {status.ram.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(status.ram, 100)}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Uptime</span>
                        <span className="text-xs font-mono text-slate-300">{status.uptime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

