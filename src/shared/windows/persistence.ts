import type { WindowRect } from './types'
export const WINDOW_LAYOUT_KEY = 'ew.windows.layout.v1'
export const MAX_LAYOUT_RECORDS = 256
export interface WindowLayoutRecord extends WindowRect {
  updatedAt: number
}
interface PersistedLayouts {
  version: 1
  windows: Record<string, WindowLayoutRecord>
}
const validId = (id: string) => /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i.test(id)
const validRecord = (value: unknown): value is WindowLayoutRecord => {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    ['x', 'y', 'width', 'height', 'updatedAt'].every(
      (key) => typeof record[key] === 'number' && Number.isFinite(record[key]),
    ) &&
    (record.width as number) > 0 &&
    (record.height as number) > 0
  )
}
export function readWindowLayouts(
  storage: Storage | undefined = typeof window === 'undefined' ? undefined : window.localStorage,
): Record<string, WindowLayoutRecord> {
  if (!storage) return {}
  try {
    const raw = JSON.parse(
      storage.getItem(WINDOW_LAYOUT_KEY) ?? 'null',
    ) as Partial<PersistedLayouts> | null
    if (raw?.version !== 1 || !raw.windows || typeof raw.windows !== 'object') return {}
    return Object.fromEntries(
      Object.entries(raw.windows).filter(([id, value]) => validId(id) && validRecord(value)),
    )
  } catch {
    return {}
  }
}
export function writeWindowLayouts(
  windows: Record<string, WindowLayoutRecord>,
  storage: Storage | undefined = typeof window === 'undefined' ? undefined : window.localStorage,
): void {
  if (!storage) return
  try {
    const entries = Object.entries(windows)
      .sort(([, first], [, second]) => second.updatedAt - first.updatedAt)
      .slice(0, MAX_LAYOUT_RECORDS)
    storage.setItem(
      WINDOW_LAYOUT_KEY,
      JSON.stringify({ version: 1, windows: Object.fromEntries(entries) }),
    )
  } catch {
    /* Storage can be unavailable in embedded clients. */
  }
}
