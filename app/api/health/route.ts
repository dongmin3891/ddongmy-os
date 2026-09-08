import { getHeapStatistics } from 'node:v8';

let lastMemoryLogAt = 0;

const toMiB = (bytes: number) => Math.round(bytes / 1024 / 1024);

export async function GET() {
  const now = Date.now();

  if (now - lastMemoryLogAt >= 30_000) {
    lastMemoryLogAt = now;

    const memory = process.memoryUsage();
    const heapLimit = getHeapStatistics().heap_size_limit;

    console.log(
      `[memory] rss=${toMiB(memory.rss)}MiB heapUsed=${toMiB(memory.heapUsed)}MiB heapTotal=${toMiB(memory.heapTotal)}MiB external=${toMiB(memory.external)}MiB arrayBuffers=${toMiB(memory.arrayBuffers)}MiB heapLimit=${toMiB(heapLimit)}MiB`,
    );
  }

  return Response.json({ status: 'ok' });
}
