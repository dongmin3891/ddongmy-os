export type WorkloadTarget = {
  publicKey: string
  namespace: string
  kind: 'Deployment' | 'StatefulSet'
  name: string
  containerName: string
}

export type PublicWorkloadStatus =
  | {
      status: 'healthy' | 'degraded'
      readyReplicas: number
      desiredReplicas: number
      releaseSha: string | null
      deployedAt: string | null
    }
  | {
      status: 'unavailable'
    }

export type StatusExporterResponse =
  | {
      status: 'available'
      checkedAt: string
      observedAt: string
      data: {
        workloads: Record<string, PublicWorkloadStatus>
      }
    }
  | {
      status: 'unavailable'
      checkedAt: string
    }

export type DeploymentStageStatus =
  | 'running'
  | 'success'
  | 'failed'
  | 'unavailable'

export type DeploymentRuntimeStage = {
  status: DeploymentStageStatus
  startedAt: string | null
  completedAt: string | null
}

export type DeploymentRuntimeResponse =
  | {
      status: 'running' | 'success' | 'failed'
      checkedAt: string
      commitSha: string
      stages: {
        argoCd: DeploymentRuntimeStage
        k3sPodReady: DeploymentRuntimeStage
      }
    }
  | {
      status: 'unavailable'
      checkedAt: string
    }
