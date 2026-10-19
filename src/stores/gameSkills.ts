import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  GameSkillRecord,
  GameSkillSnapshot,
  SkillGroup,
  SkillSubcategory,
} from '@/views/game/types/gameSkills'

const groups: SkillGroup[] = ['active', 'passive', 'other']
function cloneRecord(record: GameSkillRecord): GameSkillRecord {
  return JSON.parse(JSON.stringify(record)) as GameSkillRecord
}
function cloneCategory(category: SkillSubcategory): SkillSubcategory {
  return JSON.parse(JSON.stringify(category)) as SkillSubcategory
}
export const useGameSkillsStore = defineStore('game-skills', () => {
  const revision = ref(0)
  const records = ref<Record<string, GameSkillRecord>>({})
  const subcategories = ref<Record<string, SkillSubcategory>>({})
  const bindings = ref<Record<number, string>>({})
  const lastError = ref<string | null>(null)
  const allSkills = computed(() => Object.values(records.value))
  const hasActiveCooldowns = computed(() =>
    allSkills.value.some((item) => item.runtime.cooldown !== null),
  )
  const skillsByGroup = computed(() =>
    Object.fromEntries(
      groups.map((group) => [
        group,
        allSkills.value
          .filter((record) => subcategories.value[record.definition.subcategoryId]?.group === group)
          .sort((a, b) => a.definition.skillId.localeCompare(b.definition.skillId)),
      ]),
    ),
  )
  function replaceSnapshot(snapshot: GameSkillSnapshot): boolean {
    if (!Number.isInteger(snapshot.revision) || snapshot.revision < revision.value) return false
    const nextSubcategories: Record<string, SkillSubcategory> = {}
    const nextRecords: Record<string, GameSkillRecord> = {}
    for (const category of snapshot.subcategories) {
      if (!category.id || nextSubcategories[category.id] || !Number.isFinite(category.order)) {
        lastError.value = 'invalid-subcategory'
        return false
      }
      nextSubcategories[category.id] = cloneCategory(category)
    }
    for (const record of snapshot.skills) {
      const id = record.definition.skillId
      const cooldown = record.runtime.cooldown
      if (
        !id ||
        nextRecords[id] ||
        record.runtime.skillId !== id ||
        !nextSubcategories[record.definition.subcategoryId] ||
        !Number.isInteger(record.definition.level) ||
        record.definition.level <= 0 ||
        (cooldown !== null &&
          (!Number.isFinite(cooldown.startedAtMs) ||
            !Number.isFinite(cooldown.endsAtMs) ||
            cooldown.endsAtMs < cooldown.startedAtMs))
      ) {
        lastError.value = 'invalid-skill'
        return false
      }
      nextRecords[id] = cloneRecord(record)
    }
    subcategories.value = nextSubcategories
    records.value = nextRecords
    bindings.value = Object.fromEntries(
      Object.entries(bindings.value).filter(([, skillId]) => Boolean(nextRecords[skillId])),
    )
    revision.value = snapshot.revision
    lastError.value = null
    return true
  }
  function record(skillId: string) {
    return records.value[skillId]
  }
  function upsertSubcategory(category: SkillSubcategory): boolean {
    if (!category.id || !groups.includes(category.group)) return false
    subcategories.value[category.id] = cloneCategory(category)
    return true
  }
  function patchSubcategory(id: string, patch: Partial<Omit<SkillSubcategory, 'id'>>): boolean {
    const current = subcategories.value[id]
    if (!current) return false
    subcategories.value[id] = cloneCategory({ ...current, ...patch })
    return true
  }
  function clearCatalog(nextRevision = revision.value + 1): boolean {
    if (nextRevision < revision.value) return false
    records.value = {}
    subcategories.value = {}
    bindings.value = {}
    revision.value = nextRevision
    return true
  }
  function resetRuntimeState(): void {
    records.value = {}
    subcategories.value = {}
    bindings.value = {}
    revision.value = 0
    lastError.value = null
  }
  function upsertSkill(recordValue: GameSkillRecord): boolean {
    const skillId = recordValue.definition.skillId
    const cooldown = recordValue.runtime.cooldown
    if (
      !skillId ||
      recordValue.runtime.skillId !== skillId ||
      !subcategories.value[recordValue.definition.subcategoryId] ||
      !Number.isInteger(recordValue.definition.level) ||
      recordValue.definition.level <= 0 ||
      (cooldown !== null &&
        (!Number.isFinite(cooldown.startedAtMs) ||
          !Number.isFinite(cooldown.endsAtMs) ||
          cooldown.endsAtMs < cooldown.startedAtMs))
    )
      return false
    records.value[skillId] = cloneRecord(recordValue)
    return true
  }
  function removeSkill(skillId: string, unbind = false): boolean {
    if (!records.value[skillId]) return false
    const positions = Object.entries(bindings.value)
      .filter(([, id]) => id === skillId)
      .map(([position]) => Number(position))
    if (positions.length > 0 && !unbind) {
      lastError.value = 'bound-skill'
      return false
    }
    positions.forEach((position) => delete bindings.value[position])
    delete records.value[skillId]
    return true
  }
  function bind(position: number, skillId: string): boolean {
    if (!Number.isInteger(position) || !records.value[skillId]) return false
    bindings.value[position] = skillId
    return true
  }
  function unbind(position: number): boolean {
    if (!Object.prototype.hasOwnProperty.call(bindings.value, position)) return false
    delete bindings.value[position]
    return true
  }
  function removeSubcategory(id: string, cascade = false): boolean {
    const hasSkills = allSkills.value.some((item) => item.definition.subcategoryId === id)
    if (hasSkills && !cascade) {
      lastError.value = 'non-empty-subcategory'
      return false
    }
    if (!subcategories.value[id]) {
      lastError.value = 'missing-subcategory'
      return false
    }
    if (cascade) {
      for (const item of allSkills.value) {
        if (item.definition.subcategoryId === id) {
          delete records.value[item.definition.skillId]
          for (const [position, skillId] of Object.entries(bindings.value)) {
            if (skillId === item.definition.skillId) delete bindings.value[Number(position)]
          }
        }
      }
    }
    delete subcategories.value[id]
    return true
  }
  function patchRuntime(skillId: string, patch: Partial<GameSkillRecord['runtime']>): boolean {
    const current = records.value[skillId]
    if (!current) return false
    if (patch.skillId !== undefined && patch.skillId !== skillId) return false
    if (patch.cooldown) {
      if (
        !Number.isFinite(patch.cooldown.startedAtMs) ||
        !Number.isFinite(patch.cooldown.endsAtMs) ||
        patch.cooldown.endsAtMs < patch.cooldown.startedAtMs
      )
        return false
    }
    if (patch.active === true && current.definition.flags.toggleable === false) return false
    current.runtime = {
      ...current.runtime,
      ...patch,
      cooldown: patch.cooldown === undefined ? current.runtime.cooldown : patch.cooldown,
    }
    return true
  }
  function patchDefinition(
    skillId: string,
    patch: Partial<GameSkillRecord['definition']>,
  ): boolean {
    const current = records.value[skillId]
    if (!current) return false
    current.definition = JSON.parse(
      JSON.stringify({ ...current.definition, ...patch }),
    ) as GameSkillRecord['definition']
    return true
  }
  function startCooldown(skillId: string, durationMs: number, nowMs = Date.now()): boolean {
    if (!Number.isFinite(durationMs) || durationMs < 0) return false
    return patchRuntime(skillId, { cooldown: { startedAtMs: nowMs, endsAtMs: nowMs + durationMs } })
  }
  function setCooldownWindow(skillId: string, startedAtMs: number, endsAtMs: number): boolean {
    if (!Number.isFinite(startedAtMs) || !Number.isFinite(endsAtMs) || endsAtMs < startedAtMs)
      return false
    return patchRuntime(skillId, { cooldown: { startedAtMs, endsAtMs } })
  }
  function changeCooldownEnd(skillId: string, endsAtMs: number): boolean {
    const current = records.value[skillId]?.runtime.cooldown
    if (!current || !Number.isFinite(endsAtMs) || endsAtMs < current.startedAtMs) return false
    return patchRuntime(skillId, { cooldown: { ...current, endsAtMs } })
  }
  function expireCooldowns(nowMs = Date.now()): void {
    for (const item of allSkills.value) {
      if (item.runtime.cooldown && item.runtime.cooldown.endsAtMs <= nowMs)
        item.runtime.cooldown = null
    }
  }
  return {
    revision,
    records,
    subcategories,
    bindings,
    lastError,
    allSkills,
    hasActiveCooldowns,
    skillsByGroup,
    replaceSnapshot,
    record,
    upsertSubcategory,
    upsertSkill,
    removeSkill,
    removeSubcategory,
    bind,
    unbind,
    patchRuntime,
    patchDefinition,
    clearCatalog,
    resetRuntimeState,
    patchSubcategory,
    startCooldown,
    setCooldownWindow,
    changeCooldownEnd,
    expireCooldowns,
  }
})
