export type HomelabSourceStatus<T> =
  | {
      status: 'available'
      checkedAt: string
      observedAt: string
      data: T
    }
  | {
      status: 'unavailable'
      checkedAt: string
    }
