'use client';

import { useEffect, useState } from 'react';

interface DockerStatusResponse {
    name: string;
    image: string;
    status: string;
}

export default function DockerStatusWidget() {
    const [containers, setContainers] = useState<DockerStatusResponse[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/docker-status');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setContainers(Array.isArray(data) ? data : []);
                setError(false);
            } catch (err) {
                console.error('Docker status fetch error:', err);
                setError(true);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Docker 상태</h3>
                <div className="text-xs text-slate-500">데이터를 불러올 수 없습니다</div>
            </div>
        );
    }

    const runningContainers = containers.filter(
        (c) => c.status.toLowerCase().includes('up') || c.status.toLowerCase().includes('running')
    );

    return (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-accent-400 mb-4">Docker 상태</h3>
            {runningContainers.length === 0 ? (
                <div className="text-xs text-slate-500">실행 중인 컨테이너가 없습니다</div>
            ) : (
                <div className="space-y-2">
                    {runningContainers.map((container, index) => (
                        <div
                            key={`${container.name}-${index}`}
                            className="flex items-center justify-between text-xs"
                        >
                            <span className="text-slate-300 font-medium truncate mr-2">
                                {container.name}
                            </span>
                            <span className="text-green-400 font-mono text-[10px] shrink-0">
                                RUNNING
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

