import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createEmptyShortcutSlots,
  isShortcutPosition,
  positionsForRows,
  type SkillShortcut,
  type ShortcutEntry,
  type ShortcutPosition,
  type ShortcutSlot,
  type VisibleShortcutRowCount,
} from '@/views/game/types/shortcuts'
import { readShortcutPreferences, writeShortcutPreferences } from './gameShortcutPreferences'
import { validateSkillTooltipModel } from '@/views/game/utilities/skillTooltipModel'
import { useGameSkillsStore } from './gameSkills'
import type { GameSkillRecord } from '@/views/game/types/gameSkills'
import { gameText } from '@/localization/gameText'

export const useGameShortcutsStore = defineStore('game-shortcuts', () => {
  const preferences = readShortcutPreferences()
  const slots = ref<ShortcutSlot[]>(createEmptyShortcutSlots())
  const canonical = useGameSkillsStore()
  const visibleRowCount = ref<VisibleShortcutRowCount>(preferences.visibleRowCount)
  const showDebugMetadata = ref(preferences.showDebugMetadata)
  const lockedPositions = ref(new Set<ShortcutPosition>(preferences.lockedPositions))
  const revision = ref(0)
  const lastError = ref<'invalid-position' | 'wrong-kind' | 'invalid-value' | null>(null)
  const visibleSlots = computed(() =>
    slots.value.filter((slot) => positionsForRows(visibleRowCount.value).includes(slot.position)),
  )
  const hasActiveCooldowns = computed(
    () =>
      slots.value.some((slot) => slot.entry?.kind === 'skill' && slot.entry.cooldown !== null) ||
      canonical.hasActiveCooldowns,
  )
  function persist() {
    writeShortcutPreferences({
      visibleRowCount: visibleRowCount.value,
      showDebugMetadata: showDebugMetadata.value,
      lockedPositions: [...lockedPositions.value],
    })
  }
  function slot(position: number): ShortcutSlot | undefined {
    return isShortcutPosition(position) ? slots.value[position - 1] : undefined
  }
  function setVisibleRowCount(count: VisibleShortcutRowCount) {
    visibleRowCount.value = count
    persist()
  }
  function assign(position: number, entry: ShortcutEntry | null): boolean {
    const target = slot(position)
    if (!target) {
      lastError.value = 'invalid-position'
      return false
    }
    target.entry = entry
    return true
  }
  function assignSkill(position: number, skill: SkillShortcut) {
    if (!validateSkillTooltipModel(skill).ok) {
      lastError.value = 'invalid-value'
      return false
    }
    if (!canonical.subcategories.General)
      canonical.upsertSubcategory({
        id: 'General',
        group: skill.flags.passive ? 'passive' : 'active',
        label: gameText('#SKILL_GENERAL'),
        order: 0,
      })
    const record: GameSkillRecord = {
      definition: { ...cloneSkill(skill), subcategoryId: 'General' },
      runtime: {
        skillId: skill.skillId,
        usable: skill.flags.usable,
        active: skill.flags.active,
        cooldown: skill.cooldown ? { ...skill.cooldown } : null,
      },
    }
    canonical.upsertSkill(record)
    canonical.bind(position, skill.skillId)
    return assign(position, cloneSkill(skill))
  }
  function assignUnsupportedItem(position: number, itemId: string) {
    return assign(position, { kind: 'item', itemId, unsupported: true })
  }
  function assignUnsupportedMacro(position: number, macroId: string) {
    return assign(position, { kind: 'macro', macroId, unsupported: true })
  }
  function clearSlot(position: number) {
    const current = slot(position)?.entry
    if (current?.kind === 'skill') canonical.unbind(position)
    return assign(position, null)
  }
  function patchSkill(position: number, patch: Partial<SkillShortcut>) {
    const target = slot(position)
    if (!target) return false
    if (target.entry?.kind !== 'skill') {
      lastError.value = 'wrong-kind'
      return false
    }
    if (patch.level !== undefined && (!Number.isInteger(patch.level) || patch.level <= 0)) {
      lastError.value = 'invalid-value'
      return false
    }
    const nextSkill = {
      ...target.entry,
      ...patch,
      flags: { ...target.entry.flags, ...patch.flags },
      cooldown: patch.cooldown === undefined ? target.entry.cooldown : patch.cooldown,
    }
    if (!validateSkillTooltipModel(nextSkill).ok) {
      lastError.value = 'invalid-value'
      return false
    }
    const next = cloneSkill(nextSkill)
    canonical.patchDefinition(next.skillId, {
      name: next.name,
      icon: next.icon,
      level: next.level,
      description: next.description,
      type: next.type,
      facts: next.facts,
      upgrades: next.upgrades,
    })
    canonical.patchRuntime(next.skillId, {
      usable: next.flags.usable,
      active: next.flags.active,
      cooldown: next.cooldown,
    })
    slots.value.forEach((candidate) => {
      if (candidate.entry?.kind === 'skill' && candidate.entry.skillId === next.skillId)
        candidate.entry = cloneSkill(next)
    })
    return true
  }
  function moveOrSwap(source: number, destination: number, origin: 'ui' | 'runtime' = 'ui') {
    const from = slot(source)
    const to = slot(destination)
    if (!from || !to) return false
    if (
      origin === 'ui' &&
      (lockedPositions.value.has(source) || lockedPositions.value.has(destination))
    )
      return false
    const sourceEntry = from.entry
    from.entry = to.entry
    to.entry = sourceEntry
    const sourceSkillId = sourceEntry?.kind === 'skill' ? sourceEntry.skillId : undefined
    const destinationSkillId = to.entry?.kind === 'skill' ? to.entry.skillId : undefined
    if (destinationSkillId) canonical.bind(source, destinationSkillId)
    else canonical.unbind(source)
    if (sourceSkillId) canonical.bind(destination, sourceSkillId)
    else canonical.unbind(destination)
    return true
  }
  function startCooldown(position: number, durationMs: number, nowMs = Date.now()) {
    if (!Number.isFinite(durationMs) || durationMs < 0) return false
    return patchSkill(position, { cooldown: { startedAtMs: nowMs, endsAtMs: nowMs + durationMs } })
  }
  function stopCooldown(position: number) {
    return patchSkill(position, { cooldown: null })
  }
  function setCooldownWindow(position: number, startedAtMs: number, endsAtMs: number) {
    if (!Number.isFinite(startedAtMs) || !Number.isFinite(endsAtMs) || endsAtMs < startedAtMs)
      return false
    return patchSkill(position, { cooldown: { startedAtMs, endsAtMs } })
  }
  function changeCooldownEnd(position: number, endsAtMs: number) {
    const current = slot(position)?.entry
    if (
      current?.kind !== 'skill' ||
      !current.cooldown ||
      !Number.isFinite(endsAtMs) ||
      endsAtMs < current.cooldown.startedAtMs
    )
      return false
    return patchSkill(position, { cooldown: { ...current.cooldown, endsAtMs } })
  }
  function setSkillFlags(position: number, flags: Partial<SkillShortcut['flags']>) {
    const target = slot(position)
    if (!target || target.entry?.kind !== 'skill') {
      return false
    }
    return patchSkill(position, {
      flags: {
        ...target.entry.flags,
        ...flags,
        active: flags.toggleable === false ? false : (flags.active ?? target.entry.flags.active),
      },
    })
  }
  function expireCooldowns(nowMs = Date.now()) {
    slots.value.forEach((item) => {
      if (
        item.entry?.kind === 'skill' &&
        item.entry.cooldown &&
        item.entry.cooldown.endsAtMs <= nowMs
      )
        item.entry.cooldown = null
    })
    canonical.expireCooldowns(nowMs)
  }
  function replaceSnapshot(snapshot: ShortcutSlot[], nextRevision = revision.value + 1) {
    if (nextRevision < revision.value) return false
    slots.value = createEmptyShortcutSlots()
    snapshot.forEach((item) => {
      if (isShortcutPosition(item.position)) {
        slots.value[item.position - 1] = item
        if (item.entry?.kind === 'skill') assignSkill(item.position, item.entry)
      }
    })
    revision.value = nextRevision
    return true
  }
  function resetRuntimeState() {
    slots.value = createEmptyShortcutSlots()
    revision.value = 0
    canonical.resetRuntimeState()
  }
  return {
    slots,
    visibleRowCount,
    showDebugMetadata,
    lockedPositions,
    revision,
    lastError,
    visibleSlots,
    hasActiveCooldowns,
    slot,
    setVisibleRowCount,
    expandRows: () =>
      setVisibleRowCount(Math.min(3, visibleRowCount.value + 1) as VisibleShortcutRowCount),
    collapseRows: () =>
      setVisibleRowCount(Math.max(1, visibleRowCount.value - 1) as VisibleShortcutRowCount),
    toggleDebugMetadata: () => {
      showDebugMetadata.value = !showDebugMetadata.value
      persist()
    },
    setDebugMetadataVisible: (value: boolean) => {
      showDebugMetadata.value = value
      persist()
    },
    toggleSlotLocked: (position: number) => {
      if (!isShortcutPosition(position)) return false
      if (lockedPositions.value.has(position)) {
        lockedPositions.value.delete(position)
      } else {
        lockedPositions.value.add(position)
      }
      persist()
      return true
    },
    assignSkill,
    assignUnsupportedItem,
    assignUnsupportedMacro,
    clearSlot,
    patchSkill,
    setSkillFlags,
    moveOrSwap,
    startCooldown,
    setCooldownWindow,
    changeCooldownEnd,
    stopCooldown,
    expireCooldowns,
    replaceSnapshot,
    resetRuntimeState,
  }
})

function cloneSkill(skill: SkillShortcut): SkillShortcut {
  return {
    ...skill,
    facts: skill.facts?.map((fact) => ({ ...fact })),
    upgrades: skill.upgrades?.map((upgrade) => ({ ...upgrade })),
    flags: { ...skill.flags },
    cooldown: skill.cooldown ? { ...skill.cooldown } : null,
  }
}
