<script setup lang="ts">
import { computed } from 'vue'
import { GNumberInput, GSlider, GText } from '@/shared/components'
import { gameSettingsText as gameText } from '@/localization/gameSettingsText'
import { useGameSettingsStore } from '@/stores/gameSettings'

const store = useGameSettingsStore()
const input = computed(() => store.draft!.input)

function updateNumber(
  path: 'input.cameraSensitivity' | 'input.zoomSensitivity',
  value: number | null,
): void {
  if (value !== null) store.setField(path, value)
}
</script>
<template>
  <div class="ew-settings-grid">
    <section class="ew-settings__section">
      <h2><GText :content="gameText('#GAME_SETTINGS_CAMERA')" /></h2>
      <div class="ew-settings__section-body">
        <table class="ew-settings-range-table ew-settings-camera-table">
          <tbody>
            <tr>
              <th scope="row">
                <label for="camera-sensitivity"
                  ><GText :content="gameText('#GAME_SETTINGS_CAMERA_SENSITIVITY')"
                /></label>
              </th>
              <td class="ew-settings-performance-value">
                <GNumberInput
                  id="camera-sensitivity"
                  :model-value="input.cameraSensitivity"
                  v-bind="store.capabilities!.ranges.cameraSensitivity"
                  :aria-label="gameText('#GAME_SETTINGS_CAMERA_SENSITIVITY').textKey"
                  @update:model-value="updateNumber('input.cameraSensitivity', $event)"
                />
              </td>
              <td class="ew-settings-performance-slider">
                <GSlider
                  :model-value="input.cameraSensitivity"
                  v-bind="store.capabilities!.ranges.cameraSensitivity"
                  :aria-label="gameText('#GAME_SETTINGS_CAMERA_SENSITIVITY').textKey"
                  @update:model-value="store.setField('input.cameraSensitivity', $event)"
                />
              </td>
            </tr>
            <tr>
              <th scope="row">
                <label for="zoom-sensitivity"
                  ><GText :content="gameText('#GAME_SETTINGS_ZOOM_SENSITIVITY')"
                /></label>
              </th>
              <td class="ew-settings-performance-value">
                <GNumberInput
                  id="zoom-sensitivity"
                  :model-value="input.zoomSensitivity"
                  v-bind="store.capabilities!.ranges.zoomSensitivity"
                  :aria-label="gameText('#GAME_SETTINGS_ZOOM_SENSITIVITY').textKey"
                  @update:model-value="updateNumber('input.zoomSensitivity', $event)"
                />
              </td>
              <td class="ew-settings-performance-slider">
                <GSlider
                  :model-value="input.zoomSensitivity"
                  v-bind="store.capabilities!.ranges.zoomSensitivity"
                  :aria-label="gameText('#GAME_SETTINGS_ZOOM_SENSITIVITY').textKey"
                  @update:model-value="store.setField('input.zoomSensitivity', $event)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
