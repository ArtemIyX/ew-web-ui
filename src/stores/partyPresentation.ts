import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PARTY_MEMBER_WINDOW_IDS, type PartyMemberWindowSlot } from '@/views/game/types/partyWindows'
import type { PartyMemberId } from '@/views/game/types/gameParty'
import type { PartyWindowMode, PartyWindowPreferences, PartyWindowSlotAssignment } from '@/views/game/types/partyPresentation'

const STORAGE_KEY = 'ew.party-window.preferences.v1'
const DEFAULT_PREFERENCES: PartyWindowPreferences = { mode: 'pinned', visible: true }

function readPreferences(): PartyWindowPreferences {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PREFERENCES }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PREFERENCES }
    const value = parsed as Record<string, unknown>
    return {
      mode: value.mode === 'unpinned' ? 'unpinned' : 'pinned',
      visible: typeof value.visible === 'boolean' ? value.visible : true,
    }
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

function writePreferences(preferences: PartyWindowPreferences): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    return
  }
}

export const usePartyPresentationStore = defineStore('party-presentation', () => {
  const preferences = ref<PartyWindowPreferences>(readPreferences())
  const slotAssignments = ref<PartyWindowSlotAssignment[]>
    (PARTY_MEMBER_WINDOW_IDS.map((_, windowSlot) => ({
      windowSlot: windowSlot as PartyMemberWindowSlot,
      memberId: null,
    })))

  const mode = computed(() => preferences.value.mode)
  const visible = computed(() => preferences.value.visible)

  function persist(): void {
    writePreferences(preferences.value)
  }

  function setMode(value: PartyWindowMode): void {
    preferences.value = { ...preferences.value, mode: value }
    persist()
  }

  function toggleMode(): void {
    setMode(mode.value === 'pinned' ? 'unpinned' : 'pinned')
  }

  function setVisible(value: boolean): void {
    preferences.value = { ...preferences.value, visible: value }
    persist()
  }

  function toggleVisible(): void {
    setVisible(!visible.value)
  }

  function reconcileSlots(memberIds: readonly PartyMemberId[]): readonly PartyWindowSlotAssignment[] {
    const wanted = new Set(memberIds)
    const assignments = slotAssignments.value.map((assignment) => ({
      ...assignment,
      memberId: assignment.memberId && wanted.has(assignment.memberId) ? assignment.memberId : null,
    }))
    const assigned = new Set(assignments.flatMap((assignment) => assignment.memberId ?? []))
    for (const memberId of memberIds) {
      if (assigned.has(memberId)) continue
      const free = assignments.find((assignment) => assignment.memberId === null)
      if (!free) break
      free.memberId = memberId
      assigned.add(memberId)
    }
    slotAssignments.value = assignments
    return assignments.map((assignment) => ({ ...assignment }))
  }

  return {
    preferences,
    mode,
    visible,
    slotAssignments,
    setMode,
    toggleMode,
    setVisible,
    toggleVisible,
    reconcileSlots,
  }
})
