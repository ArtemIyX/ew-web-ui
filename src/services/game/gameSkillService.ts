import type { ShortcutPosition } from '@/views/game/types/shortcuts'
import type {
  GameSkillRecord,
  GameSkillSnapshot,
  SkillGroup,
  SkillSubcategory,
} from '@/views/game/types/gameSkills'
import { useGameSkillsStore } from '@/stores/gameSkills'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { createSkillActivationController } from './skillActivationController'
import type { SkillActivationGateway, SkillActivationOrigin } from './skillActivationGateway'
import { getCurrentInstance } from 'vue'
export type SkillCommandResult =
  { ok: true; revision: number } | { ok: false; error: string; path?: string }
export interface GameSkillApi {
  replaceCatalog(snapshot: GameSkillSnapshot): SkillCommandResult
  clearCatalog(revision?: number): SkillCommandResult
  upsertSubcategory(category: SkillSubcategory): SkillCommandResult
  upsertSubcategories(categories: readonly SkillSubcategory[]): SkillCommandResult
  upsertSkill(record: GameSkillRecord): SkillCommandResult
  upsertSkills(records: readonly GameSkillRecord[]): SkillCommandResult
  patchSubcategory(id: string, patch: Partial<Omit<SkillSubcategory, 'id'>>): SkillCommandResult
  moveSubcategory(id: string, group: SkillGroup, order: number): SkillCommandResult
  patchSkillDefinition(
    id: string,
    patch: Partial<GameSkillRecord['definition']>,
  ): SkillCommandResult
  patchSkillRuntime(id: string, patch: Partial<GameSkillRecord['runtime']>): SkillCommandResult
  setSkillFlags(
    id: string,
    patch: Partial<GameSkillRecord['definition']['flags']>,
  ): SkillCommandResult
  moveSkill(id: string, subcategoryId: string): SkillCommandResult
  startCooldown(id: string, durationMs: number, nowMs?: number): SkillCommandResult
  setCooldownWindow(id: string, startedAtMs: number, endsAtMs: number): SkillCommandResult
  changeCooldownEnd(id: string, endsAtMs: number): SkillCommandResult
  stopCooldown(id: string): SkillCommandResult
  activateSkill(id: string, origin?: SkillActivationOrigin): Promise<SkillCommandResult>
  removeSkill(id: string, options?: { unbind?: boolean }): SkillCommandResult
  removeSubcategory(id: string, options?: { cascade?: boolean }): SkillCommandResult
  bindSkill(position: ShortcutPosition, skillId: string): SkillCommandResult
  unbindSkill(position: ShortcutPosition): SkillCommandResult
  getSnapshot(): GameSkillSnapshot
  getSkill(id: string): Readonly<GameSkillRecord> | null
  getSubcategory(id: string): Readonly<SkillSubcategory> | null
  listSubcategories(group: SkillGroup): readonly SkillSubcategory[]
  listSkills(subcategoryId: string): readonly GameSkillRecord[]
  openWindow(): SkillCommandResult
  closeWindow(): boolean
  toggleWindow(): SkillCommandResult
  isWindowOpen(): boolean
}
export type SkillListDeveloperApi = GameSkillApi
export function createGameSkillApi(
  store = useGameSkillsStore(),
  activationGateway?: SkillActivationGateway,
): GameSkillApi {
  const windows = getCurrentInstance() ? useWindows() : undefined
  const gateway = activationGateway ?? { activateSkill: () => undefined }
  const activation = createSkillActivationController((id) => store.record(id), gateway)
  const result = (ok: boolean, error = 'invalid-value'): SkillCommandResult =>
    ok ? { ok: true, revision: store.revision } : { ok: false, error }
  return {
    replaceCatalog: (snapshot) => result(store.replaceSnapshot(snapshot), 'stale-revision'),
    clearCatalog: (revision) => result(store.clearCatalog(revision), 'stale-revision'),
    upsertSubcategory: (category) =>
      result(store.upsertSubcategory(category), 'invalid-subcategory'),
    upsertSubcategories: (categories) => {
      const ids = new Set<string>()
      for (const category of categories) {
        if (!category.id || ids.has(category.id)) return { ok: false, error: 'duplicate-id' }
        ids.add(category.id)
      }
      if (categories.some((category) => !['active', 'passive', 'other'].includes(category.group)))
        return { ok: false, error: 'invalid-value' }
      const merged = new Map(
        Object.values(store.subcategories).map((category) => [category.id, category]),
      )
      categories.forEach((category) => merged.set(category.id, category))
      return result(
        store.replaceSnapshot({
          revision: store.revision,
          subcategories: [...merged.values()],
          skills: Object.values(store.records),
        }),
        'invalid-subcategory',
      )
    },
    upsertSkill: (record) => result(store.upsertSkill(record), 'invalid-skill'),
    upsertSkills: (records) => {
      const ids = new Set<string>()
      for (const record of records) {
        const skillId = record.definition.skillId
        if (!skillId || ids.has(skillId)) return { ok: false, error: 'duplicate-id' }
        ids.add(skillId)
      }
      if (records.some((record) => !store.subcategories[record.definition.subcategoryId]))
        return { ok: false, error: 'unknown-subcategory' }
      const merged = new Map(
        Object.values(store.records).map((record) => [record.definition.skillId, record]),
      )
      records.forEach((record) => merged.set(record.definition.skillId, record))
      return result(
        store.replaceSnapshot({
          revision: store.revision,
          subcategories: Object.values(store.subcategories),
          skills: [...merged.values()],
        }),
        'invalid-skill',
      )
    },
    patchSubcategory: (id, patch) =>
      result(store.patchSubcategory(id, patch), 'unknown-subcategory'),
    moveSubcategory: (id, group, order) =>
      result(store.patchSubcategory(id, { group, order }), 'unknown-subcategory'),
    patchSkillDefinition: (id, patch) => result(store.patchDefinition(id, patch), 'unknown-skill'),
    moveSkill: (id, subcategoryId) =>
      result(store.patchDefinition(id, { subcategoryId }), 'unknown-skill'),
    patchSkillRuntime: (id, patch) => result(store.patchRuntime(id, patch), 'unknown-skill'),
    setSkillFlags: (id, patch) => {
      const current = store.record(id)
      if (!current) return { ok: false, error: 'unknown-skill' }
      const flags = { ...current.definition.flags, ...patch }
      if (flags.toggleable === false) flags.active = false
      const definitionResult = store.patchDefinition(id, { flags })
      const runtimeResult = store.patchRuntime(id, { usable: flags.usable, active: flags.active })
      return result(definitionResult && runtimeResult, 'unknown-skill')
    },
    startCooldown: (id, durationMs, nowMs) =>
      result(store.startCooldown(id, durationMs, nowMs), 'invalid-value'),
    setCooldownWindow: (id, startedAtMs, endsAtMs) =>
      result(store.setCooldownWindow(id, startedAtMs, endsAtMs), 'invalid-value'),
    changeCooldownEnd: (id, endsAtMs) =>
      result(store.changeCooldownEnd(id, endsAtMs), 'invalid-value'),
    stopCooldown: (id) => result(store.patchRuntime(id, { cooldown: null }), 'unknown-skill'),
    activateSkill: async (id, origin = 'skill-list') => {
      const activationResult = activation.activate(id, origin)
      return activationResult.ok
        ? { ok: true, revision: store.revision }
        : { ok: false, error: activationResult.error ?? 'invalid-value' }
    },
    removeSkill: (id, options) => result(store.removeSkill(id, options?.unbind), 'skill-is-bound'),
    removeSubcategory: (id, options) =>
      result(store.removeSubcategory(id, options?.cascade), 'subcategory-not-empty'),
    bindSkill: (position, id) => result(store.bind(position, id), 'unknown-skill'),
    unbindSkill: (position) => result(store.unbind(position), 'invalid-value'),
    getSnapshot: () => ({
      revision: store.revision,
      subcategories: Object.values(store.subcategories),
      skills: Object.values(store.records).map(
        (record) => JSON.parse(JSON.stringify(record)) as GameSkillRecord,
      ),
    }),
    getSkill: (id) => {
      const record = store.record(id)
      return record ? JSON.parse(JSON.stringify(record)) : null
    },
    getSubcategory: (id) =>
      store.subcategories[id] ? JSON.parse(JSON.stringify(store.subcategories[id])) : null,
    listSubcategories: (group) =>
      Object.values(store.subcategories)
        .filter((item) => item.group === group)
        .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
        .map((item) => JSON.parse(JSON.stringify(item)) as SkillSubcategory),
    listSkills: (id) =>
      store.allSkills
        .filter((item) => item.definition.subcategoryId === id)
        .map((item) => JSON.parse(JSON.stringify(item)) as GameSkillRecord),
    openWindow: () => result(windows?.openWindow('skill-list').ok ?? false),
    closeWindow: () => windows?.closeWindow('skill-list') ?? false,
    toggleWindow: () => result(windows?.toggleWindow('skill-list').ok ?? false),
    isWindowOpen: () => windows?.isWindowOpen('skill-list').value ?? false,
  }
}
export const getGameSkillDeveloperApi = createGameSkillApi
