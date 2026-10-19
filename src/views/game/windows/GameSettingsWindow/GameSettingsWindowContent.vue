<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameSettingsStore } from '@/stores/gameSettings'
import { gameSettingsText as gameText } from '@/localization/gameSettingsText'
import { GButton, GScrollArea, GText } from '@/shared/components'
import { useWindows } from '@/shared/composables/windows/useWindows'
import GTab from '@/shared/components/navigation/GTab/GTab.vue'
import GTabs from '@/shared/components/navigation/GTabs/GTabs.vue'
import GameSettingsVideoPanel from './GameSettingsVideoPanel.vue'
import GameSettingsInputPanel from './GameSettingsInputPanel.vue'
const store = useGameSettingsStore()
const windows = useWindows()
const showDiscard = ref(false)
const tabs = [
  { id: 'video', label: gameText('#GAME_SETTINGS_VIDEO') },
  { id: 'input', label: gameText('#GAME_SETTINGS_INPUT') },
] as const
const activePanel = computed(() => (store.activeTab === 'video' ? 'video-panel' : 'input-panel'))
const previewSeconds = computed(() =>
  Math.max(0, Math.ceil(((store.displayPreview?.expiresAtMs ?? 0) - Date.now()) / 1000)),
)
let previewTimer: number | undefined
onMounted(() => store.initialize())
onMounted(() => {
  previewTimer = window.setInterval(() => {
    if (store.displayPreview && Date.now() >= store.displayPreview.expiresAtMs)
      void store.revertDisplayPreview('timeout')
  }, 250)
})
onBeforeUnmount(() => {
  if (previewTimer !== undefined) window.clearInterval(previewTimer)
  if (store.displayPreview) void store.revertDisplayPreview('unmount')
})
function requestClose(): void {
  if (store.canCloseImmediately) {
    windows.closeWindow('game-settings')
    return
  }
  showDiscard.value = true
}
function discard(): void {
  store.discardDraft()
  showDiscard.value = false
  windows.closeWindow('game-settings')
}
async function save(): Promise<void> {
  const outcome = await store.apply({ closeAfterSuccess: true })
  if (outcome.kind === 'applied') windows.closeWindow('game-settings')
}
</script>
<template>
  <div class="ew-settings" @keydown.esc.stop="requestClose">
    <div v-if="store.status === 'loading'" class="ew-settings__state" role="status">
      <GText :content="gameText('#GAME_SETTINGS_LOADING')" />
    </div>
    <div
      v-else-if="store.status === 'error'"
      class="ew-settings__state ew-settings__state--error"
      role="alert"
    >
      <GText :content="gameText('#GAME_SETTINGS_ERROR_LOAD')" /><GButton @click="store.refresh"
        ><GText :content="gameText('#GAME_SETTINGS_RETRY')"
      /></GButton>
    </div>
    <template v-else-if="store.draft && store.capabilities">
      <GTabs class="ew-settings__tabs" :aria-label="gameText('#GAME_SETTINGS_TITLE')">
        <GTab
          v-for="tab in tabs"
          :id="`${tab.id}-tab`"
          :key="tab.id"
          :selected="store.activeTab === tab.id"
          :aria-controls="`${tab.id}-panel`"
          @click="store.setActiveTab(tab.id)"
          ><GText :content="tab.label"
        /></GTab>
      </GTabs>
      <GScrollArea class="ew-settings__scroll"
        ><div
          :id="activePanel"
          class="ew-settings__panel"
          role="tabpanel"
          :aria-labelledby="`${store.activeTab}-tab`"
        >
          <GameSettingsVideoPanel v-if="store.activeTab === 'video'" /><GameSettingsInputPanel
            v-else
          /></div
      ></GScrollArea>
      <footer class="ew-settings__footer">
        <span class="ew-settings__status" role="status"
          ><GText
            :content="
              store.isDirty ? gameText('#GAME_SETTINGS_READY') : gameText('#GAME_SETTINGS_SAVED')
            "
        /></span>
        <div class="ew-settings__actions">
          <GButton
            variant="ghost"
            :disabled="store.status !== 'ready'"
            @click="store.restoreDefaults(store.activeTab)"
            ><GText :content="gameText('#GAME_SETTINGS_RESTORE_DEFAULTS')" /></GButton
          ><GButton variant="ghost" :disabled="store.status === 'applying'" @click="requestClose"
            ><GText :content="gameText('#GAME_SETTINGS_CANCEL')" /></GButton
          ><GButton :disabled="!store.canApply" @click="store.apply()"
            ><GText :content="gameText('#GAME_SETTINGS_APPLY')" /></GButton
          ><GButton variant="bronze" :disabled="!store.canApply" @click="save"
            ><GText :content="gameText('#GAME_SETTINGS_SAVE')"
          /></GButton>
        </div>
      </footer>
      <div
        v-if="store.displayPreview"
        class="ew-settings__preview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-preview-title"
      >
        <h2 id="settings-preview-title">
          <GText :content="gameText('#GAME_SETTINGS_PREVIEW_TITLE')" />
        </h2>
        <p>
          <GText
            :content="gameText('#GAME_SETTINGS_PREVIEW_MESSAGE', { seconds: previewSeconds })"
          />
        </p>
        <div class="ew-button-group">
          <GButton @click="store.revertDisplayPreview('cancel')"
            ><GText :content="gameText('#GAME_SETTINGS_REVERT')"
          /></GButton>
          <GButton variant="bronze" @click="store.confirmDisplayPreview"
            ><GText :content="gameText('#GAME_SETTINGS_KEEP')"
          /></GButton>
        </div>
      </div>
    </template>
    <div v-if="showDiscard" class="ew-settings__discard" role="dialog" aria-modal="true">
      <p><GText :content="gameText('#GAME_SETTINGS_DISCARD_MESSAGE')" /></p>
      <div class="ew-button-group">
        <GButton @click="showDiscard = false"
          ><GText :content="gameText('#GAME_SETTINGS_CONTINUE_EDITING')" /></GButton
        ><GButton variant="danger" @click="discard"
          ><GText :content="gameText('#GAME_SETTINGS_DISCARD')"
        /></GButton>
      </div>
    </div>
  </div>
</template>
