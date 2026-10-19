import type { LocalizedText } from '@/shared/types/components'

export type LocalizationTable = Readonly<Record<string, string>>
export type LocalizationLoader = (culture: string, table: string) => Promise<LocalizationTable>
export interface LocalizationService { load: (culture: string, table: string) => Promise<LocalizationTable>; resolve: (culture: string, text: LocalizedText) => Promise<string>; invalidate: (culture?: string, table?: string) => void }

export function createLocalizationService(loader: LocalizationLoader): LocalizationService {
  const cache = new Map<string, Promise<LocalizationTable>>()
  const load = (culture: string, table: string) => {
    const cacheKey = `${culture}:${table}`
    const existing = cache.get(cacheKey)
    if (existing) return existing
    const request = Promise.resolve().then(() => loader(culture, table)).catch((error) => {
      cache.delete(cacheKey)
      throw error
    })
    cache.set(cacheKey, request)
    return request
  }
  const resolve = async (culture: string, text: LocalizedText) => {
    const table = await load(culture, text.table)
    let result = table[text.textKey] ?? text.textKey
    for (const [key, value] of Object.entries(text.params ?? {})) result = result.split(`{${key}}`).join(String(value))
    return result
  }
  const invalidate = (culture?: string, table?: string) => {
    if (!culture && !table) { cache.clear(); return }
    for (const key of cache.keys()) {
      const [cachedCulture, cachedTable] = key.split(':')
      if ((!culture || cachedCulture === culture) && (!table || cachedTable === table)) cache.delete(key)
    }
  }
  return { load, resolve, invalidate }
}
