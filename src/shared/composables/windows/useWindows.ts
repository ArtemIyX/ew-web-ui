import { computed, inject, readonly } from 'vue'
import { useWindowManagerStore } from '@/stores/windowManager'
import { WINDOW_DEFINITIONS } from '@/shared/providers/overlays/windowRegistry'
import type { WindowDefinition } from '@/shared/windows/types'
export function useWindows() {
  const store = useWindowManagerStore()
  const definitions = inject<readonly WindowDefinition[]>(WINDOW_DEFINITIONS, [])
  const find = (id: string) => definitions.find((item) => item.id === id)
  const openWindow = (id: string, props: Record<string, unknown> = {}) => {
    const definition = find(id)
    if (!definition) {
      console.warn(`[GWindow] Unknown window ID: ${id}`)
      return { ok: false as const, reason: 'unknown-id' as const }
    }
    const opened = store.openManagedWindow(id, { ...props, closable: definition.closable ?? false })
    return {
      ok: true as const,
      id,
      status: opened ? ('opened' as const) : ('focused-existing' as const),
    }
  }
  const closeWindow = (id: string, options: { force?: boolean } = {}) =>
    find(id) ? store.closeManagedWindow(id, options.force ?? false) : unknown(id)
  const focusWindow = (id: string) => (find(id) ? store.focusWindow(id) : unknown(id))
  function unknown(id: string): false {
    if (import.meta.env.DEV) console.warn(`[GWindow] Unknown window ID: ${id}`)
    return false
  }
  const toggleWindow = (id: string) => {
    if (!store.isWindowOpen(id).value) return openWindow(id)
    const definition = find(id)
    if (definition?.closable !== true) {
      return { ok: focusWindow(id), id, status: 'focused-existing' as const }
    }
    return { ok: closeWindow(id), id, status: 'closed' as const }
  }
  const getWindowState = (id: string) =>
    readonly(
      computed(() => {
        const item = store.managedWindows[id]
        return {
          open: item?.open ?? false,
          active: store.activeWindowId === id,
          geometry: item?.props.geometry,
          zOrder: item?.zOrder ?? 0,
        }
      }),
    )
  return {
    openWindow,
    closeWindow,
    focusWindow,
    toggleWindow,
    getWindowState,
    closeAllWindows: (options: { force?: boolean } = {}) =>
      definitions.forEach((item) => closeWindow(item.id, options)),
    isWindowOpen: (id: string) => computed(() => store.isWindowOpen(id).value),
    resetWindowLayout: store.resetWindowLayout,
  }
}
