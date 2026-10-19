import { onBeforeUnmount, watch } from 'vue'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { TARGET_STATUS_WINDOW_ID } from '@/views/game/types/gameTargetStatus'

export function useTargetStatusWindowCoordinator(): void {
  const store = useGameTargetStatusStore()
  const { openWindow, closeWindow, isWindowOpen } = useWindows()
  watch(
    () => store.hasTarget,
    (hasTarget, previous) => {
      if (hasTarget && previous === false && !isWindowOpen(TARGET_STATUS_WINDOW_ID).value) openWindow(TARGET_STATUS_WINDOW_ID)
      if (!hasTarget) closeWindow(TARGET_STATUS_WINDOW_ID, { force: true })
    },
    { immediate: true, flush: 'post' },
  )
  void store.initialize()
  onBeforeUnmount(() => { store.dispose(); closeWindow(TARGET_STATUS_WINDOW_ID, { force: true }) })
}
