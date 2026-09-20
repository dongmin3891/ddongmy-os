import 'server-only'
import { z } from 'zod'
import deploymentHistory from '../../k8s/deployment-history.json'
import type { DeploymentEvent } from './deployment-event'

const deploymentEventSchema = z.object({
  deployedAt: z.iso.datetime(),
  serviceName: z.string().min(1).max(100),
  commitSha: z.string().regex(/^[a-f0-9]{7,40}$/),
})

const deploymentHistorySchema = z.array(deploymentEventSchema).max(500)

export function getDeploymentEvents(): DeploymentEvent[] {
  return deploymentHistorySchema.parse(deploymentHistory)
}
