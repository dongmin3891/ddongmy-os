export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

interface DockerStatusResponse {
    name: string;
    image: string;
    status: string;
}

export async function GET() {
    try {
        const output = execSync('docker ps --format "{{json .}}"', {
            encoding: 'utf-8',
        });

        const containers: DockerStatusResponse[] = output
            .trim()
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => {
                try {
                    const container = JSON.parse(line);
                    return {
                        name: container.Names || '',
                        image: container.Image || '',
                        status: container.Status || '',
                    };
                } catch (error) {
                    console.error('Failed to parse container:', line, error);
                    return null;
                }
            })
            .filter((container): container is DockerStatusResponse => container !== null);

        return NextResponse.json(containers);
    } catch (error) {
        // 개발 환경에서 docker 명령이 없을 수 있으므로 빈 배열 반환
        console.log('Docker status API: Using fallback (empty array - development environment)');
        return NextResponse.json([]);
    }
}
