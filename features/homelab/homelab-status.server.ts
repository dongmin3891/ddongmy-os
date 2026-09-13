import 'server-only'
import { cache } from 'react'
import { getKubernetesHomelabStatus } from './kubernetes-homelab-status.server'
import { getStatusExporterHomelabStatus } from './status-exporter-homelab-status.server'

async function readHomelabStatus() {
  const exporterStatus = await getStatusExporterHomelabStatus()
  if (exporterStatus.status !== 'unavailable') return exporterStatus

  return getKubernetesHomelabStatus()
}

export const getHomelabStatus = cache(readHomelabStatus)
