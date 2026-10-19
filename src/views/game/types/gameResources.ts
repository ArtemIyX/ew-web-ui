export type ResourceKind = 'hp' | 'mp' | 'energy'
export type ResourceDisplayMode = 'percentage' | 'exact'

export interface ResourceValue {
  current: number
  maximum: number
}
