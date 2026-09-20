import { createServer } from 'node:http'
import { getDeploymentRuntimeResponse } from './deployment-timeline.js'
import { getStatusExporterResponse } from './kubernetes-status.js'
import { workloadTargets } from './targets.js'

const port = Number(process.env.PORT ?? 8080)

function writeJson(response: import('node:http').ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET') {
    writeJson(response, 405, { error: 'method_not_allowed' })
    return
  }

  const path = new URL(request.url ?? '/', 'http://status-exporter').pathname

  if (path === '/healthz') {
    writeJson(response, 200, { status: 'ok' })
    return
  }

  if (path === '/status') {
    writeJson(response, 200, await getStatusExporterResponse(workloadTargets))
    return
  }

  if (path === '/deployment-timeline') {
    writeJson(response, 200, await getDeploymentRuntimeResponse())
    return
  }

  writeJson(response, 404, { error: 'not_found' })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`[status-exporter] listening on ${port}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
