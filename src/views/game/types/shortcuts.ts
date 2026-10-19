import type { IconSource, TextContent } from '@/shared/types/components'
import type { SkillTooltipModel } from './skills'

export const SHORTCUT_COLUMNS = 8
export const SHORTCUT_ROWS = 3
export const SHORTCUT_POSITION_COUNT = SHORTCUT_COLUMNS * SHORTCUT_ROWS
export type ShortcutPosition = number
export type VisibleShortcutRowCount = 1 | 2 | 3
export interface SkillCooldown {
  startedAtMs: number
  endsAtMs: number
}
export interface SkillShortcut extends Omit<
  SkillTooltipModel,
  'skillId' | 'name' | 'level' | 'description' | 'icon' | 'type'
> {
  kind: 'skill'
  skillId: string
  level: number
  name: TextContent
  description?: TextContent
  icon: IconSource
  type?: TextContent
  flags: { toggleable: boolean; active: boolean; usable: boolean; passive: boolean }
  cooldown: SkillCooldown | null
}
export interface UnsupportedItemShortcut {
  kind: 'item'
  itemId: string
  unsupported: true
}
export interface UnsupportedMacroShortcut {
  kind: 'macro'
  macroId: string
  unsupported: true
}
export type ShortcutEntry = SkillShortcut | UnsupportedItemShortcut | UnsupportedMacroShortcut
export interface ShortcutSlot {
  position: ShortcutPosition
  entry: ShortcutEntry | null
}
export function isShortcutPosition(position: number): position is ShortcutPosition {
  return Number.isInteger(position) && position >= 1 && position <= SHORTCUT_POSITION_COUNT
}
export function positionRow(position: ShortcutPosition): number {
  return Math.ceil(position / SHORTCUT_COLUMNS)
}
export function positionsForRows(count: VisibleShortcutRowCount): ShortcutPosition[] {
  return Array.from(
    { length: count * SHORTCUT_COLUMNS },
    (_, index) => (count - 1) * SHORTCUT_COLUMNS + index + 1,
  )
}
export function visibleRows(count: VisibleShortcutRowCount): ShortcutPosition[][] {
  return Array.from({ length: count }, (_, index) =>
    positionsForRows((count - index) as VisibleShortcutRowCount).slice(0, SHORTCUT_COLUMNS),
  )
}
export function createEmptyShortcutSlots(): ShortcutSlot[] {
  return Array.from({ length: SHORTCUT_POSITION_COUNT }, (_, index) => ({
    position: index + 1,
    entry: null,
  }))
}
