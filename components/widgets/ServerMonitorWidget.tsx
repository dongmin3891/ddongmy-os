import ServerStatusWidget from './ServerStatusWidget'
import DockerStatusWidget from './DockerStatusWidget'

export default function ServerMonitorWidget() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4 text-slate-200">Server Monitor</h2>
        <div className="space-y-4">
          <ServerStatusWidget />
          <DockerStatusWidget />
        </div>
      </div>
    </div>
  )
}

