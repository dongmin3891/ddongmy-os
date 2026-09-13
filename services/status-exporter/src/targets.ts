import type { WorkloadTarget } from './contracts.js'

export const workloadTargets: readonly WorkloadTarget[] = [
  {
    publicKey: 'webApp',
    namespace: 'default',
    kind: 'Deployment',
    name: 'web-app',
    containerName: 'web',
  },
]
