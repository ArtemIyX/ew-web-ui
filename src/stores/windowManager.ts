import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { clampRect, cascadePosition, resolveInitialRect } from '@/shared/windows/geometry'
import {
  readWindowLayouts,
  writeWindowLayouts,
  type WindowLayoutRecord,
} from '@/shared/windows/persistence'
import type { WindowDefaultPosition, WindowRect, WindowSize } from '@/shared/windows/types'
export const useWindowManagerStore = defineStore('window-manager', () => {
  const layouts = ref<Record<string, WindowLayoutRecord>>({})
  const managedWindows = ref<
    Record<string, { id: string; open: boolean; zOrder: number; props: Record<string, unknown> }>
  >({})
  const activeWindowId = ref<string | null>(null)
  const focusSequence = ref(0)
  const hydrated = ref(false)
  const cascadeIndex = ref(0)
  function persist(): void {
    writeWindowLayouts(layouts.value)
  }
  function hydrateLayouts(): void {
    if (!hydrated.value) {
      layouts.value = readWindowLayouts()
      hydrated.value = true
    }
  }
  function commitGeometry(id: string, rect: WindowRect): void {
    layouts.value[id] = { ...rect, updatedAt: Date.now() }
    const item = managedWindows.value[id]
    if (item) item.props = { ...item.props, geometry: { ...rect } }
    persist()
  }
  function previewGeometry(id: string, rect: WindowRect): void {
    const item = managedWindows.value[id]
    if (item) item.props = { ...item.props, geometry: { ...rect } }
  }
  function updateManagedWindowProps(id: string, props: Record<string, unknown>): boolean {
    const item = managedWindows.value[id]
    if (!item) return false
    item.props = { ...item.props, ...props }
    return true
  }
  function focusWindow(id: string): boolean {
    const item = managedWindows.value[id]
    if (!item?.open) return false
    item.zOrder = ++focusSequence.value
    activeWindowId.value = id
    return true
  }
  function openManagedWindow(id: string, props: Record<string, unknown> = {}): boolean {
    const current = managedWindows.value[id]
    if (current) {
      current.open = true
      current.props = { ...current.props, ...props }
      focusWindow(id)
      return false
    }
    managedWindows.value[id] = {
      id,
      open: true,
      zOrder: ++focusSequence.value,
      props: { ...props, closable: props.closable ?? false },
    }
    activeWindowId.value = id
    return true
  }
  function closeManagedWindow(id: string, force = false): boolean {
    const item = managedWindows.value[id]
    if (!item || (!force && item.props.closable === false)) return false
    item.open = false
    if (activeWindowId.value === id) activeWindowId.value = null
    persist()
    return true
  }
  function ensureLayout(
    id: string,
    defaults: WindowSize,
    viewport: WindowSize,
    constraints = {},
    position: WindowDefaultPosition = 'center',
  ): WindowRect {
    const cascade =
      position === 'center' && !layouts.value[id]
        ? cascadePosition(viewport, defaults, cascadeIndex.value++)
        : position
    const rect = resolveInitialRect(layouts.value[id], viewport, defaults, cascade, constraints)
    if (!layouts.value[id]) commitGeometry(id, rect)
    return rect
  }
  function resetWindowLayout(id: string): void {
    delete layouts.value[id]
    persist()
  }
  function resetAllWindowLayouts(): void {
    layouts.value = {}
    persist()
  }
  function reclampOpenWindows(viewport: WindowSize): void {
    for (const item of Object.values(managedWindows.value)) {
      const rect = item.props.geometry as WindowRect | undefined
      if (item.open && rect) commitGeometry(item.id, clampRect(rect, viewport))
    }
  }
  function compactZOrder(): void {
    const ordered = Object.values(managedWindows.value)
      .filter((item) => item.open)
      .sort((first, second) => first.zOrder - second.zOrder)
    ordered.forEach((item, index) => {
      item.zOrder = index + 1
    })
    focusSequence.value = ordered.length
  }
  return {
    layouts,
    managedWindows,
    activeWindowId,
    hydrateLayouts,
    ensureLayout,
    previewGeometry,
    updateManagedWindowProps,
    commitGeometry,
    openManagedWindow,
    closeManagedWindow,
    focusWindow,
    reclampOpenWindows,
    compactZOrder,
    resetWindowLayout,
    resetAllWindowLayouts,
    isWindowOpen: (id: string) => computed(() => managedWindows.value[id]?.open ?? false),
  }
})
