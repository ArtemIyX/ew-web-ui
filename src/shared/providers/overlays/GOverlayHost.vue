<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, provide, ref, type PropType } from 'vue'
import { getActivePinia } from 'pinia'
import { overlayKey } from './overlayContext'
import { WINDOW_DEFINITIONS, validateWindowDefinitions } from './windowRegistry'
import type { WindowDefinition } from '@/shared/windows/types'
import { useWindowManagerStore } from '@/stores/windowManager'
import GWindow from '@/shared/components/overlays/GWindow/GWindow.vue'
const props = defineProps({
  windowDefinitions: { type: Array as PropType<readonly WindowDefinition[]>, default: () => [] },
})
const definitions = validateWindowDefinitions(props.windowDefinitions)
const windowStore = getActivePinia()
  ? useWindowManagerStore()
  : {
      managedWindows: ref<Record<string, { id: string; open: boolean }>>({}),
      activeWindowId: null,
      hydrateLayouts: () => undefined,
      closeManagedWindow: () => false,
      focusWindow: () => false,
    }
windowStore.hydrateLayouts()
const count = ref(0)
const register = () => ++count.value
const unregister = () => {
  count.value = Math.max(0, count.value - 1)
}
provide(overlayKey, { count, register, unregister })
provide(WINDOW_DEFINITIONS, definitions)
const getDefinition = (id: string): WindowDefinition | undefined =>
  definitions.find((definition) => {
    if (definition.id === id) markRaw(definition.component)
    return definition.id === id
  })
function reclamp(): void {
  if ('reclampOpenWindows' in windowStore)
    windowStore.reclampOpenWindows({ width: window.innerWidth, height: window.innerHeight })
}
onMounted(() => window.addEventListener('resize', reclamp))
onBeforeUnmount(() => window.removeEventListener('resize', reclamp))
</script>
<template>
  <div class="ew-overlay-host">
    <slot /><GWindow
      v-for="item in Object.values(windowStore.managedWindows).filter((entry) => entry.open)"
      :key="item.id"
      :window-id="item.id"
      :open="item.open"
      :title="getDefinition(item.id)?.title"
      :aria-label="getDefinition(item.id)?.ariaLabel"
      :close-label="getDefinition(item.id)?.closeLabel"
      :resize-label="getDefinition(item.id)?.resizeLabel"
      :header-placement="getDefinition(item.id)?.headerPlacement"
      :title-size="getDefinition(item.id)?.titleSize"
      :header-size="getDefinition(item.id)?.headerSize"
      :header-visible="getDefinition(item.id)?.headerVisible"
      :movable="getDefinition(item.id)?.movable"
      :drag-region="getDefinition(item.id)?.dragRegion"
      :chrome="getDefinition(item.id)?.chrome"
      :surface="getDefinition(item.id)?.surface"
      :header-surface="getDefinition(item.id)?.headerSurface"
      :opacity="getDefinition(item.id)?.opacity"
      :closable="getDefinition(item.id)?.closable"
      :resizable="getDefinition(item.id)?.resizable"
      :resize-mode="getDefinition(item.id)?.resizeMode"
      :active="windowStore.activeWindowId === item.id"
      :close-on-escape="getDefinition(item.id)?.closeOnEscape"
      :persistent="getDefinition(item.id)?.persistent"
      :reset-size-on-open="getDefinition(item.id)?.resetSizeOnOpen"
      :body-flush="getDefinition(item.id)?.bodyFlush"
      :fit-content-height="getDefinition(item.id)?.fitContentHeight"
      :fit-content-width="getDefinition(item.id)?.fitContentWidth"
      :auto-focus="getDefinition(item.id)?.autoFocus"
      :default-position="getDefinition(item.id)?.defaultPosition"
      @focus="windowStore.focusWindow(item.id)"
      :default-width="getDefinition(item.id)?.defaultSize?.width"
      :default-height="getDefinition(item.id)?.defaultSize?.height"
      :min-width="getDefinition(item.id)?.constraints?.minWidth"
      :min-height="getDefinition(item.id)?.constraints?.minHeight"
      :max-width="getDefinition(item.id)?.constraints?.maxWidth"
      :max-height="getDefinition(item.id)?.constraints?.maxHeight"
      @update:open="windowStore.closeManagedWindow(item.id)"
      ><component
        :is="getDefinition(item.id)?.component"
        v-bind="{ ...item.props, title: getDefinition(item.id)?.title }"
    /></GWindow>
  </div>
</template>
