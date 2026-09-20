import type { DeploymentStage } from './deployment-event'

export type DeploymentRuntimeStatus =
  | {
      status: 'running' | 'success' | 'failed'
      checkedAt: string
      commitSha: string
      stages: {
        argoCd: DeploymentStage
        k3sPodReady: DeploymentStage
      }
    }
  | {
      status: 'unavailable'
      checkedAt: string
    }
