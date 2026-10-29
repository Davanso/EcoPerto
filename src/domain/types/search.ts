import type { Ecopoint } from './ecopoint.ts'

export type EcopointSearchResult = {
  points: Ecopoint[]
  fetchedAt: string
  freshness: 'live' | 'cache' | 'stale' | 'official'
  warning?: string
}
