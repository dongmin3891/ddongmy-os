export type DeploymentStatus = 'running' | 'success' | 'failed'

export type DeploymentStageStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'unavailable'

export type DeploymentStage = {
  status: DeploymentStageStatus
  startedAt: string | null
  completedAt: string | null
}

export type DeploymentEvent = {
  deployedAt: string
  serviceName: string
  commitSha: string
  status: DeploymentStatus
  stages: {
    githubPush: DeploymentStage
    githubActions: DeploymentStage
    ghcr: DeploymentStage
    argoCd: DeploymentStage
    k3sPodReady: DeploymentStage
  }
}
