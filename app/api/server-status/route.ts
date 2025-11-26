import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const runtime = 'nodejs'; // Node 환경에서 실행 명시

const PROC_PATH = process.env.PROC_PATH || '/proc';
const STAT_PATH = `${PROC_PATH}/stat`;
const MEMINFO_PATH = `${PROC_PATH}/meminfo`;
const UPTIME_PATH = `${PROC_PATH}/uptime`;

function fileExists(path: string): boolean {
    try {
        readFileSync(path, 'utf-8');
        return true;
    } catch {
        return false;
    }
}

const ACTUAL_PROC_PATH = fileExists(`${PROC_PATH}/stat`) ? PROC_PATH : '/proc';
const ACTUAL_STAT_PATH = `${ACTUAL_PROC_PATH}/stat`;
const ACTUAL_MEMINFO_PATH = `${ACTUAL_PROC_PATH}/meminfo`;
const ACTUAL_UPTIME_PATH = `${ACTUAL_PROC_PATH}/uptime`;

async function getCpuUsage(): Promise<number> {
    const stat1 = readFileSync(ACTUAL_STAT_PATH, 'utf-8');
    const cpu1 = stat1.split('\n')[0].split(/\s+/);
    const idle1 = parseInt(cpu1[4]) + parseInt(cpu1[5]);
    const total1 = cpu1.slice(1).reduce((sum, val) => sum + parseInt(val), 0);

    await new Promise((r) => setTimeout(r, 100)); // busy wait 제거

    const stat2 = readFileSync(ACTUAL_STAT_PATH, 'utf-8');
    const cpu2 = stat2.split('\n')[0].split(/\s+/);
    const idle2 = parseInt(cpu2[4]) + parseInt(cpu2[5]);
    const total2 = cpu2.slice(1).reduce((sum, val) => sum + parseInt(val), 0);

    const idle = idle2 - idle1;
    const total = total2 - total1;
    return Math.round(((total - idle) / total) * 100 * 100) / 100;
}

function getRamUsage(): number {
    const meminfo = readFileSync(ACTUAL_MEMINFO_PATH, 'utf-8');
    const lines = meminfo.split('\n');

    let memTotal = 0;
    let memAvailable = 0;

    for (const line of lines) {
        if (line.startsWith('MemTotal:')) memTotal = parseInt(line.split(/\s+/)[1]) * 1024;
        if (line.startsWith('MemAvailable:')) memAvailable = parseInt(line.split(/\s+/)[1]) * 1024;
    }

    const memUsed = memTotal - memAvailable;
    return Math.round((memUsed / memTotal) * 100 * 100) / 100;
}

function formatUptime(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];
    if (days) parts.push(`${days}일`);
    if (hours) parts.push(`${hours}시간`);
    if (minutes) parts.push(`${minutes}분`);
    return parts.join(' ') || '0분';
}

function getUptime(): string {
    const uptimeContent = readFileSync(ACTUAL_UPTIME_PATH, 'utf-8');
    const totalSeconds = parseFloat(uptimeContent.split(' ')[0]);
    return formatUptime(totalSeconds);
}

export async function GET() {
    try {
        const cpu = await getCpuUsage();
        const ram = getRamUsage();
        const uptime = getUptime();
        return NextResponse.json({ cpu, ram, uptime });
    } catch (err) {
        console.log('Server status API fallback (dev environment)');
        return NextResponse.json({
            cpu: 0,
            ram: 0,
            uptime: 'development',
        });
    }
}
