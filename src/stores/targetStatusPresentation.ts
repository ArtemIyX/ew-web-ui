import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ResourceDisplayMode } from '@/views/game/types/gameResources'

const STORAGE_KEY = 'ew.target-status.preferences.v1'
const DEFAULT_MODE: ResourceDisplayMode = 'percentage'

export const useTargetStatusPresentationStore = defineStore('target-status-presentation', () => {
  const hpDisplayMode = ref<ResourceDisplayMode>(readMode())
  function setHpDisplayMode(mode: ResourceDisplayMode): void {
    if (mode !== 'percentage' && mode !== 'exact') return
    hpDisplayMode.value = mode
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify({ hpDisplayMode: mode }))
  }
  function toggleHpDisplayMode(): void { setHpDisplayMode(hpDisplayMode.value === 'percentage' ? 'exact' : 'percentage') }
  return { hpDisplayMode, setHpDisplayMode, toggleHpDisplayMode }
})

function readMode(): ResourceDisplayMode {
  if (typeof localStorage === 'undefined') return DEFAULT_MODE
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as { hpDisplayMode?: unknown }
    return parsed.hpDisplayMode === 'exact' ? 'exact' : DEFAULT_MODE
  } catch { return DEFAULT_MODE }
}
