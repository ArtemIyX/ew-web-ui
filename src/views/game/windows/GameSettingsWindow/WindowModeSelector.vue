<script setup lang="ts">
import {
  useLocalizedText,
  useLocalizedTexts,
} from '@/shared/composables/localization/useLocalizedText'
import { gameSettingsText as gameText } from '@/localization/gameSettingsText'
import type { WindowMode } from '@/views/game/types/gameSettings'
const props = defineProps<{
  modelValue: WindowMode
  options: readonly WindowMode[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: WindowMode] }>()
const icons: Record<WindowMode, string> = {
  fullscreen: '/src/assets/game/settings/window-mode-fullscreen.svg',
  borderless: '/src/assets/game/settings/window-mode-borderless.svg',
  windowed: '/src/assets/game/settings/window-mode-windowed.svg',
}
const modeKeys = {
  fullscreen: '#GAME_SETTINGS_WINDOW_MODE_FULLSCREEN',
  borderless: '#GAME_SETTINGS_WINDOW_MODE_BORDERLESS',
  windowed: '#GAME_SETTINGS_WINDOW_MODE_WINDOWED',
} as const
const modeLabels = useLocalizedTexts(() => props.options.map((mode) => gameText(modeKeys[mode])))
const groupLabel = useLocalizedText(() => gameText('#GAME_SETTINGS_WINDOW_MODE'))
</script>
<template>
  <div class="ew-settings-mode" role="group" :aria-label="groupLabel">
    <button
      v-for="mode in options"
      :key="mode"
      class="ew-settings-mode__button"
      :class="{ 'is-selected': modelValue === mode }"
      type="button"
      :disabled="disabled"
      :aria-label="modeLabels[props.options.indexOf(mode)]"
      :aria-pressed="modelValue === mode"
      :title="modeLabels[props.options.indexOf(mode)]"
      @click="emit('update:modelValue', mode)"
    >
      <img :src="icons[mode]" alt="" />
    </button>
  </div>
</template>
