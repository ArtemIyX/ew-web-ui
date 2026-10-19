import type { SkillShortcut, ShortcutPosition, ShortcutSlot } from '@/views/game/types/shortcuts'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
export interface ShortcutCommandResult {
  ok: boolean
  error?: 'invalid-position' | 'wrong-kind' | 'invalid-value'
}
export interface ShortcutDeveloperApi {
  replaceSnapshot(slots: readonly ShortcutSlot[], revision?: number): ShortcutCommandResult
  assignSkill(position: number, skill: SkillShortcut): ShortcutCommandResult
  patchSkill(position: number, patch: Partial<SkillShortcut>): ShortcutCommandResult
  setSkillLevel(position: number, level: number): ShortcutCommandResult
  setSkillIcon(position: number, icon: SkillShortcut['icon']): ShortcutCommandResult
  setSkillFlags(position: number, flags: Partial<SkillShortcut['flags']>): ShortcutCommandResult
  startCooldown(position: number, durationMs: number): ShortcutCommandResult
  restartCooldown(position: number, durationMs: number): ShortcutCommandResult
  changeCooldownEnd(position: number, endsAtMs: number): ShortcutCommandResult
  stopCooldown(position: number): ShortcutCommandResult
  move(source: number, destination: number): ShortcutCommandResult
  clear(position: number): ShortcutCommandResult
}
export function createShortcutDeveloperApi(store = useGameShortcutsStore()): ShortcutDeveloperApi {
  const result = (ok: boolean, error?: ShortcutCommandResult['error']): ShortcutCommandResult =>
    ok ? { ok } : { ok, error: error ?? store.lastError ?? 'invalid-value' }
  return {
    replaceSnapshot: (slots, revision) =>
      result(store.replaceSnapshot([...slots], revision), 'invalid-value'),
    assignSkill: (position, skill) => result(store.assignSkill(position, skill)),
    patchSkill: (position, patch) => result(store.patchSkill(position, patch)),
    setSkillLevel: (position, level) => result(store.patchSkill(position, { level })),
    setSkillIcon: (position, icon) => result(store.patchSkill(position, { icon })),
    setSkillFlags: (position, flags) => result(store.setSkillFlags(position, flags)),
    startCooldown: (position, durationMs) =>
      result(store.startCooldown(position, durationMs), 'invalid-value'),
    restartCooldown: (position, durationMs) =>
      result(store.startCooldown(position, durationMs), 'invalid-value'),
    changeCooldownEnd: (position, endsAtMs) =>
      result(store.changeCooldownEnd(position, endsAtMs), 'invalid-value'),
    stopCooldown: (position) => result(store.stopCooldown(position)),
    move: (source, destination) => result(store.moveOrSwap(source, destination, 'runtime')),
    clear: (position) => result(store.clearSlot(position)),
  }
}
export const getShortcutDeveloperApi = createShortcutDeveloperApi
export type { ShortcutPosition }
