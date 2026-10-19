<script setup lang="ts">
import { computed } from 'vue'
import { useGameSettingsStore } from '@/stores/gameSettings'
import {
  GNumberInput,
  GSegmentedControl,
  GSelect,
  GSlider,
  GSwitch,
  GText,
} from '@/shared/components'
import GameSettingsSection from './GameSettingsSection.vue'
import WindowModeSelector from './WindowModeSelector.vue'
import type { GameSettingsPath } from '@/views/game/types/gameSettings'
import { gameSettingsText as gameText } from '@/localization/gameSettingsText'
const store = useGameSettingsStore()
const snapshot = computed(() => store.draft!.video)
const caps = computed(() => store.capabilities!)
const qualityOptions = computed(() =>
  store.capabilities!.qualityLevels.map((value) => ({
    value,
    label: gameText(qualityKey(value)),
  })),
)
const overallQualityOptions = computed(() => [
  ...qualityOptions.value,
  { value: 'custom', label: gameText('#GAME_SETTINGS_QUALITY_CUSTOM') },
])
const resolutionOptions = computed(() =>
  store.capabilities!.resolutions.map((value) => ({
    value: `${value.width}x${value.height}@${value.refreshRateHz ?? 0}`,
    label: `${value.width} × ${value.height}${value.refreshRateHz ? ` @ ${value.refreshRateHz} Hz` : ''}`,
  })),
)
const graphicsLabels: Record<string, string> = {
  viewDistance: '#GAME_SETTINGS_VIEW_DISTANCE',
  antiAliasingQuality: '#GAME_SETTINGS_ANTI_ALIASING_QUALITY',
  shadowQuality: '#GAME_SETTINGS_SHADOWS',
  globalIlluminationQuality: '#GAME_SETTINGS_GLOBAL_ILLUMINATION',
  reflectionQuality: '#GAME_SETTINGS_REFLECTIONS',
  postProcessQuality: '#GAME_SETTINGS_POST_PROCESSING',
  textureQuality: '#GAME_SETTINGS_TEXTURES',
  effectsQuality: '#GAME_SETTINGS_EFFECTS',
  foliageQuality: '#GAME_SETTINGS_FOLIAGE',
  shadingQuality: '#GAME_SETTINGS_SHADING',
  landscapeQuality: '#GAME_SETTINGS_LANDSCAPE',
}
const visibilityItems = [
  { key: 'brightness', label: '#GAME_SETTINGS_BRIGHTNESS' },
  { key: 'characterVisibility', label: '#GAME_SETTINGS_CHARACTERS' },
  { key: 'npcVisibility', label: '#GAME_SETTINGS_NPCS' },
] as const
function qualityKey(value: string): string {
  const key = `#GAME_SETTINGS_QUALITY_${value.toUpperCase().replace(/-/g, '_')}`
  return gameTextKeys[key] ?? '#GAME_SETTINGS_QUALITY_CUSTOM'
}
const gameTextKeys: Record<string, string> = {
  '#GAME_SETTINGS_QUALITY_LOW': '#GAME_SETTINGS_QUALITY_LOW',
  '#GAME_SETTINGS_QUALITY_MEDIUM': '#GAME_SETTINGS_QUALITY_MEDIUM',
  '#GAME_SETTINGS_QUALITY_HIGH': '#GAME_SETTINGS_QUALITY_HIGH',
  '#GAME_SETTINGS_QUALITY_EPIC': '#GAME_SETTINGS_QUALITY_EPIC',
  '#GAME_SETTINGS_QUALITY_CINEMATIC': '#GAME_SETTINGS_QUALITY_CINEMATIC',
  '#GAME_SETTINGS_DLSS_MODE_DLAA': '#GAME_SETTINGS_DLSS_MODE_DLAA',
  '#GAME_SETTINGS_DLSS_MODE_QUALITY': '#GAME_SETTINGS_DLSS_MODE_QUALITY',
  '#GAME_SETTINGS_DLSS_MODE_BALANCED': '#GAME_SETTINGS_DLSS_MODE_BALANCED',
  '#GAME_SETTINGS_DLSS_MODE_PERFORMANCE': '#GAME_SETTINGS_DLSS_MODE_PERFORMANCE',
  '#GAME_SETTINGS_DLSS_MODE_ULTRA_PERFORMANCE': '#GAME_SETTINGS_DLSS_MODE_ULTRA_PERFORMANCE',
  '#GAME_SETTINGS_AA_NONE': '#GAME_SETTINGS_AA_NONE',
  '#GAME_SETTINGS_AA_FXAA': '#GAME_SETTINGS_AA_FXAA',
  '#GAME_SETTINGS_AA_TAA': '#GAME_SETTINGS_AA_TAA',
  '#GAME_SETTINGS_AA_TSR': '#GAME_SETTINGS_AA_TSR',
}
function dlssModeKey(value: string): string {
  return (
    gameTextKeys[`#GAME_SETTINGS_DLSS_MODE_${value.toUpperCase().replace(/-/g, '_')}`] ??
    '#GAME_SETTINGS_DLSS_MODE_QUALITY'
  )
}
function graphicsKey(value: string): string {
  return graphicsLabels[value] ?? '#GAME_SETTINGS_GRAPHICS'
}
function antiAliasingMethodKey(value: string): string {
  return gameTextKeys[`#GAME_SETTINGS_AA_${value.toUpperCase()}`] ?? '#GAME_SETTINGS_AA_TAA'
}
function value(path: GameSettingsPath): unknown {
  return path
    .split('.')
    .reduce<unknown>((current, key) => (current as Record<string, unknown>)[key], store.draft!)
}
function number(path: GameSettingsPath, next: number | null): void {
  if (next !== null) store.setField(path, next as never)
}
function setResolution(valueKey: string | number): void {
  const found = store.capabilities!.resolutions.find(
    (item) => `${item.width}x${item.height}@${item.refreshRateHz ?? 0}` === String(valueKey),
  )
  if (found) store.setField('video.display.resolution', found)
}
function update(path: GameSettingsPath, next: string | number | boolean): void {
  store.setField(path, next as never)
}
function range(key: keyof typeof caps.value.ranges) {
  return caps.value.ranges[key]
}
</script>
<template>
  <div class="ew-settings-grid">
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_DISPLAY')"
      ><div class="ew-settings-row ew-settings-display-row">
        <label><GText :content="gameText('#GAME_SETTINGS_WINDOW_MODE')" /></label
        ><WindowModeSelector
          :model-value="snapshot.display.windowMode"
          :options="caps.windowModes"
          @update:model-value="update('video.display.windowMode', $event)"
        />
      </div>
      <div class="ew-settings-row ew-settings-display-row ew-settings-resolution-row">
        <label for="settings-resolution"
          ><GText :content="gameText('#GAME_SETTINGS_RESOLUTION')"
        /></label>
        <div class="ew-settings-display-resolution-control">
          <GSelect
            id="settings-resolution"
            :model-value="`${snapshot.display.resolution.width}x${snapshot.display.resolution.height}@${snapshot.display.resolution.refreshRateHz ?? 0}`"
            :options="resolutionOptions"
            :disabled="store.isResolutionDisabled"
            @update:model-value="setResolution"
          />
        </div></div
    ></GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_VISIBILITY')"
      ><table class="ew-settings-range-table ew-settings-visibility-table">
        <tbody>
          <tr v-for="item in visibilityItems" :key="item.key">
            <th scope="row">
              <label :for="`settings-${item.key}`"><GText :content="gameText(item.label)" /></label>
            </th>
            <td class="ew-settings-performance-value">
              <GNumberInput
                :id="`settings-${item.key}`"
                :model-value="value(`video.visibility.${item.key}` as GameSettingsPath) as number"
                v-bind="range(item.key as keyof typeof caps.ranges)"
                :aria-label="item.label"
                @update:model-value="
                  number(`video.visibility.${item.key}` as GameSettingsPath, $event)
                "
              />
            </td>
            <td class="ew-settings-performance-slider">
              <GSlider
                :model-value="value(`video.visibility.${item.key}` as GameSettingsPath) as number"
                v-bind="range(item.key as keyof typeof caps.ranges)"
                :aria-label="`${item.label} slider`"
                @update:model-value="
                  update(`video.visibility.${item.key}` as GameSettingsPath, $event)
                "
              />
            </td>
          </tr>
        </tbody></table
    ></GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_GRAPHICS')" wide
      ><div class="ew-settings-quality-rail">
        <span class="ew-settings-quality-rail__label"
          ><GText :content="gameText('#GAME_SETTINGS_OVERALL_QUALITY')"
        /></span>
        <GSegmentedControl
          :model-value="snapshot.graphics.overallQuality"
          :options="overallQualityOptions"
          :aria-label="gameText('#GAME_SETTINGS_OVERALL_QUALITY').textKey"
          @update:model-value="update('video.graphics.overallQuality', $event)"
        />
      </div>
      <div class="ew-settings-controls">
        <label
          ><GText :content="gameText('#GAME_SETTINGS_VIEW_DISTANCE')" />
          <GSelect
            :model-value="snapshot.graphics.viewDistance"
            :options="qualityOptions"
            @update:model-value="update('video.graphics.viewDistance', $event)" /></label
        ><label
          v-for="group in caps.graphicsGroups.filter(
            (item) => item !== 'overallQuality' && item !== 'viewDistance',
          )"
          :key="group"
          ><GText :content="gameText(graphicsKey(group))" />
          <GSelect
            :model-value="snapshot.graphics[group]"
            :options="qualityOptions"
            @update:model-value="
              update(`video.graphics.${group}` as GameSettingsPath, $event)
            " /></label
        ><label
          ><GText :content="gameText('#GAME_SETTINGS_ANTI_ALIASING_METHOD')" />
          <GSelect
            :model-value="snapshot.graphics.antiAliasingMethod"
            :options="
              caps.antiAliasingMethods.map((value) => ({
                value,
                label: gameText(antiAliasingMethodKey(value)),
              }))
            "
            :disabled="store.isAntiAliasingMethodDisabled"
            @update:model-value="update('video.graphics.antiAliasingMethod', $event)"
        /></label></div
    ></GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_SUPER_RESOLUTION')"
      ><div class="ew-settings-super-resolution">
        <label
          ><span><GText :content="gameText('#GAME_SETTINGS_UPSCALER')" /></span>
          <GSelect
            :model-value="snapshot.superResolution.method"
            :options="
              caps.superResolutionMethods.map((value) => ({
                value,
                label:
                  value === 'dlss'
                    ? gameText('#GAME_SETTINGS_DLSS')
                    : gameText('#GAME_SETTINGS_NATIVE'),
              }))
            "
            @update:model-value="update('video.superResolution.method', $event)" /></label
        ><label
          ><span><GText :content="gameText('#GAME_SETTINGS_DLSS_MODE')" /></span>
          <GSelect
            :model-value="snapshot.superResolution.dlssMode"
            :options="
              caps.dlss.modes.map((value) => ({ value, label: gameText(dlssModeKey(value)) }))
            "
            :disabled="store.isDlssModeDisabled"
            @update:model-value="update('video.superResolution.dlssMode', $event)" /></label
        ><label
          ><span><GText :content="gameText('#GAME_SETTINGS_FRAME_GENERATION')" /></span>
          <GSelect
            :model-value="snapshot.superResolution.frameGenerationMode"
            :options="
              caps.frameGeneration.modes.map((value) => ({
                value,
                label: gameText(
                  `#GAME_SETTINGS_FRAME_GENERATION_${value.toUpperCase() as 'OFF' | '2X' | '3X' | '4X'}`,
                ),
              }))
            "
            :disabled="store.isFrameGenerationDisabled"
            @update:model-value="update('video.superResolution.frameGenerationMode', $event)"
        /></label></div
    ></GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_OUTLINE')"
      ><table class="ew-settings-outline-table ew-settings-outline-adaptive-table">
        <tbody>
          <tr
            v-for="item in [
              { key: 'outlineThickness', label: '#GAME_SETTINGS_OUTLINE_THICKNESS' },
              { key: 'outlineCurve', label: '#GAME_SETTINGS_OUTLINE_CURVE' },
              { key: 'highlightThicknessNear', label: '#GAME_SETTINGS_HIGHLIGHT_NEAR' },
              { key: 'highlightThicknessFar', label: '#GAME_SETTINGS_HIGHLIGHT_FAR' },
              { key: 'highlightBrightness', label: '#GAME_SETTINGS_HIGHLIGHT_BRIGHTNESS' },
            ]"
            :key="item.key"
          >
            <th scope="row">
              <label :for="`settings-outline-${item.key}`"
                ><GText :content="gameText(item.label)"
              /></label>
            </th>
            <td>
              <GNumberInput
                :id="`settings-outline-${item.key}`"
                :model-value="value(`video.outline.${item.key}` as GameSettingsPath) as number"
                v-bind="range(item.key as keyof typeof caps.ranges)"
                @update:model-value="
                  number(`video.outline.${item.key}` as GameSettingsPath, $event)
                "
              />
            </td>
          </tr>
        </tbody></table
    ></GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_FRAME_RATE')">
      <table class="ew-settings-performance-table ew-settings-frame-rate-table">
        <tbody>
          <tr>
            <th scope="row"><GText :content="gameText('#GAME_SETTINGS_VSYNC')" /></th>
            <td class="ew-settings-performance-control">
              <GSwitch
                :model-value="snapshot.performance.vSyncEnabled"
                :aria-label="gameText('#GAME_SETTINGS_VSYNC').textKey"
                @update:model-value="update('video.performance.vSyncEnabled', $event)"
              />
            </td>
          </tr>
          <tr>
            <th scope="row"><GText :content="gameText('#GAME_SETTINGS_LIMIT_FPS')" /></th>
            <td class="ew-settings-performance-control">
              <GSwitch
                :model-value="snapshot.performance.frameRateLimitEnabled"
                :aria-label="gameText('#GAME_SETTINGS_LIMIT_FPS').textKey"
                @update:model-value="update('video.performance.frameRateLimitEnabled', $event)"
              />
            </td>
          </tr>
          <tr class="ew-settings-max-fps-row">
            <th scope="row">
              <label for="settings-max-fps"
                ><GText :content="gameText('#GAME_SETTINGS_MAX_FPS')"
              /></label>
            </th>
            <td
              class="ew-settings-performance-control"
              :class="{ 'is-muted': !snapshot.performance.frameRateLimitEnabled }"
            >
              <GNumberInput
                id="settings-max-fps"
                class="ew-settings-max-fps-input"
                :model-value="snapshot.performance.maxFps"
                v-bind="range('maxFps')"
                :disabled="!snapshot.performance.frameRateLimitEnabled"
                @update:model-value="number('video.performance.maxFps', $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </GameSettingsSection>
    <GameSettingsSection :title="gameText('#GAME_SETTINGS_VIEW_RENDERING')">
      <table
        class="ew-settings-performance-table ew-settings-performance-table--range ew-settings-view-rendering-table"
      >
        <tbody>
          <tr>
            <th scope="row"><GText :content="gameText('#GAME_SETTINGS_FOV')" /></th>
            <td class="ew-settings-performance-value">
              <GNumberInput
                :model-value="snapshot.performance.fieldOfView"
                v-bind="range('fieldOfView')"
                :aria-label="gameText('#GAME_SETTINGS_FOV').textKey"
                @update:model-value="number('video.performance.fieldOfView', $event)"
              />
            </td>
            <td class="ew-settings-performance-slider">
              <GSlider
                :model-value="snapshot.performance.fieldOfView"
                v-bind="range('fieldOfView')"
                :aria-label="gameText('#GAME_SETTINGS_FOV').textKey"
                @update:model-value="update('video.performance.fieldOfView', $event)"
              />
            </td>
          </tr>
          <tr>
            <th scope="row"><GText :content="gameText('#GAME_SETTINGS_RENDER_SCALE')" /></th>
            <td class="ew-settings-performance-value">
              <GNumberInput
                :model-value="snapshot.performance.renderScalePercent"
                v-bind="range('renderScalePercent')"
                :disabled="store.isRenderScaleDisabled"
                :aria-label="gameText('#GAME_SETTINGS_RENDER_SCALE').textKey"
                @update:model-value="number('video.performance.renderScalePercent', $event)"
              />
            </td>
            <td class="ew-settings-performance-slider">
              <GSlider
                :model-value="snapshot.performance.renderScalePercent"
                v-bind="range('renderScalePercent')"
                :disabled="store.isRenderScaleDisabled"
                :aria-label="gameText('#GAME_SETTINGS_RENDER_SCALE').textKey"
                @update:model-value="update('video.performance.renderScalePercent', $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </GameSettingsSection>
  </div>
</template>
