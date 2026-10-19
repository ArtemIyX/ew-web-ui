import type { IconSource } from '@/shared/types/components'

export function createIconResourceService(resolver: (source: IconSource) => Promise<string | undefined>) {
  const pending = new Map<string, Promise<string | undefined>>()
  const resolve = (source: IconSource) => {
    const key = source.kind === 'local' ? source.src : source.resourceId
    const existing = pending.get(key)
    if (existing) return existing
    const request = resolver(source)
    pending.set(key, request.catch((error) => { pending.delete(key); throw error }))
    return request
  }
  return { resolve }
}
