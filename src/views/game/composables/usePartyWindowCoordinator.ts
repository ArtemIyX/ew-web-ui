import { onBeforeUnmount, watch } from 'vue'
import { useGamePartyStore } from '@/stores/gameParty'
import { usePartyPresentationStore } from '@/stores/partyPresentation'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { useWindowManagerStore } from '@/stores/windowManager'
import {
  PARTY_GROUP_WINDOW_ID,
  PARTY_MEMBER_WINDOW_IDS,
  partyMemberWindowId,
} from '@/views/game/types/partyWindows'
import type { WindowRect } from '@/shared/windows/types'

const PARTY_GROUP_CONTENT_INSET = 0.5 * 16

export function usePartyWindowCoordinator(): void {
  const party = useGamePartyStore()
  const presentation = usePartyPresentationStore()
  const windowStore = useWindowManagerStore()
  const { openWindow, closeWindow, isWindowOpen } = useWindows()
  let previousMode = presentation.mode

  function closePartyWindows(): void {
    closeWindow(PARTY_GROUP_WINDOW_ID, { force: true })
    PARTY_MEMBER_WINDOW_IDS.forEach((id) => closeWindow(id, { force: true }))
  }

  function seedMemberPositions(
    assignments: ReturnType<typeof presentation.reconcileSlots>,
    groupGeometry: WindowRect,
  ): void {
    const memberCount = assignments.filter((assignment) => assignment.memberId !== null).length
    const contentHeight = Math.max(0, groupGeometry.height - PARTY_GROUP_CONTENT_INSET * 2)
    const verticalStep = contentHeight / Math.max(1, memberCount)
    let memberIndex = 0
    assignments.forEach((assignment) => {
      if (assignment.memberId === null) return
      windowStore.commitGeometry(partyMemberWindowId(assignment.windowSlot), {
        ...groupGeometry,
        x: groupGeometry.x,
        y: groupGeometry.y + verticalStep * memberIndex,
      })
      memberIndex += 1
    })
  }

  function reconcile(): void {
    const modeChanged = previousMode !== presentation.mode
    const groupGeometry =
      modeChanged && previousMode === 'pinned' && presentation.mode === 'unpinned'
        ? windowStore.layouts[PARTY_GROUP_WINDOW_ID]
        : undefined
    if (!presentation.visible || !party.hasDisplayableParty) {
      closePartyWindows()
      previousMode = presentation.mode
      return
    }
    if (presentation.mode === 'pinned') {
      PARTY_MEMBER_WINDOW_IDS.forEach((id) => closeWindow(id, { force: true }))
      if (!isWindowOpen(PARTY_GROUP_WINDOW_ID).value) openWindow(PARTY_GROUP_WINDOW_ID)
      previousMode = presentation.mode
      return
    }
    closeWindow(PARTY_GROUP_WINDOW_ID, { force: true })
    const assignments = presentation.reconcileSlots(party.members.map((member) => member.memberId))
    if (groupGeometry) seedMemberPositions(assignments, groupGeometry)
    assignments.forEach((assignment) => {
      const id = partyMemberWindowId(assignment.windowSlot)
      if (assignment.memberId === null) {
        closeWindow(id, { force: true })
      } else if (!isWindowOpen(id).value) {
        openWindow(id, { memberId: assignment.memberId, windowSlot: assignment.windowSlot })
      }
    })
    previousMode = presentation.mode
  }

  watch(
    [
      () => party.status,
      () => party.memberCount,
      () => party.members.map((member) => member.memberId).join('|'),
      () => presentation.mode,
      () => presentation.visible,
    ],
    reconcile,
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(() => {
    closePartyWindows()
    party.dispose()
  })
}
