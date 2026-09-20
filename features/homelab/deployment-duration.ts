export function formatDeploymentDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return null

  const durationSeconds = Math.max(
    0,
    Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1_000),
  )
  if (durationSeconds < 60) return `${durationSeconds}초`

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60
  if (minutes < 60) return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes === 0 ? `${hours}시간` : `${hours}시간 ${remainingMinutes}분`
}
