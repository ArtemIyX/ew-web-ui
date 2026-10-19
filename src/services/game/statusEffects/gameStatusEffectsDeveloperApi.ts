import type { GameBuffDeveloperApi } from '@/services/game/buffs/gameBuffDeveloperApi'
import type { GameDebuffDeveloperApi } from '@/services/game/debuffs/gameDebuffDeveloperApi'
import type { GameToggleDeveloperApi } from '@/services/game/toggles/gameToggleDeveloperApi'
type AggregateCommandResult =
  | ReturnType<GameBuffDeveloperApi['clearBuffs']>
  | ReturnType<GameDebuffDeveloperApi['clearDebuffs']>
  | ReturnType<GameToggleDeveloperApi['clearToggles']>

export interface StatusEffectsDeveloperApi {
  buffs: GameBuffDeveloperApi
  debuffs: GameDebuffDeveloperApi
  toggles: GameToggleDeveloperApi
  listAllSnapshots: () => {
    buffs: ReturnType<GameBuffDeveloperApi['getSnapshot']>
    debuffs: ReturnType<GameDebuffDeveloperApi['getSnapshot']>
    toggles: ReturnType<GameToggleDeveloperApi['getSnapshot']>
  }
  clearAll: () => AggregateCommandResult
  setDebugMetadataVisible: (visible: boolean) => AggregateCommandResult
  resetAllWindowLayouts: () => void
  resetAllEffectWindowLayouts: () => void
}

export function createStatusEffectsDeveloperApi(
  buffs: GameBuffDeveloperApi,
  debuffs: GameDebuffDeveloperApi,
  toggles: GameToggleDeveloperApi,
): StatusEffectsDeveloperApi {
  const resetAllWindowLayouts = (): void => {
    buffs.resetWindowLayout()
    debuffs.resetWindowLayout()
    toggles.resetWindowLayout()
  }
  return {
    buffs,
    debuffs,
    toggles,
    listAllSnapshots: () => ({
      buffs: buffs.getSnapshot(),
      debuffs: debuffs.getSnapshot(),
      toggles: toggles.getSnapshot(),
    }),
    clearAll: () => {
      const results = [buffs.clearBuffs(), debuffs.clearDebuffs(), toggles.clearToggles()]
      const failure = results.find((value) => !value.ok)
      return failure ?? { ok: true as const, revision: toggles.getRevision(), value: undefined }
    },
    setDebugMetadataVisible: (visible) => {
      const results = [
        buffs.setDebugMetadataVisible(visible),
        debuffs.setDebugMetadataVisible(visible),
        toggles.setDebugMetadataVisible(visible),
      ]
      const failure = results.find((value) => !value.ok)
      return failure ?? { ok: true as const, revision: toggles.getRevision(), value: undefined }
    },
    resetAllWindowLayouts,
    resetAllEffectWindowLayouts: resetAllWindowLayouts,
  }
}

export function installStatusEffectsDeveloperApi(
  api: StatusEffectsDeveloperApi,
  target: Window = window,
): () => void {
  const existing = (target.ew ?? {}) as EwDeveloperApi
  target.ew = existing
  existing.buffList = api.buffs
  existing.debuffList = api.debuffs
  existing.toggleList = api.toggles
  existing.statusEffects = api
  return () => {
    if (target.ew?.buffList === api.buffs) Reflect.deleteProperty(target.ew, 'buffList')
    if (target.ew?.debuffList === api.debuffs) Reflect.deleteProperty(target.ew, 'debuffList')
    if (target.ew?.toggleList === api.toggles) Reflect.deleteProperty(target.ew, 'toggleList')
    if (target.ew?.statusEffects === api) Reflect.deleteProperty(target.ew, 'statusEffects')
  }
}
