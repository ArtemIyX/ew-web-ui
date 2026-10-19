import type { VisibleShortcutRowCount } from '@/views/game/types/shortcuts'

const KEY = 'ew.game.shortcuts.preferences.v1'
interface StoredPreferences {
  visibleRowCount: VisibleShortcutRowCount
  showDebugMetadata: boolean
  lockedPositions: number[]
}
function validRows(value: unknown): VisibleShortcutRowCount {
  return value === 2 || value === 3 ? value : 1
}
export function readShortcutPreferences(scope = ''): StoredPreferences {
  try {
    const raw = window.localStorage.getItem(`${KEY}.${scope}`)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid')
    const value = parsed as Partial<StoredPreferences>
    const locks = Array.isArray(value.lockedPositions)
      ? value.lockedPositions.filter(
          (position, index, all) =>
            Number.isInteger(position) &&
            position >= 1 &&
            position <= 24 &&
            all.indexOf(position) === index,
        )
      : []
    return {
      visibleRowCount: validRows(value.visibleRowCount),
      showDebugMetadata: value.showDebugMetadata === true,
      lockedPositions: locks,
    }
  } catch {
    return { visibleRowCount: 1, showDebugMetadata: false, lockedPositions: [] }
  }
}
export function writeShortcutPreferences(preferences: StoredPreferences, scope = ''): void {
  try {
    window.localStorage.setItem(`${KEY}.${scope}`, JSON.stringify(preferences))
  } catch {
    /* storage is optional */
  }
}
