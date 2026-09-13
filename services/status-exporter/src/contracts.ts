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
