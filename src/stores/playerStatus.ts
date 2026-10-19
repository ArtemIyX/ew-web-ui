import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  PlayerStatusPreferences,
  PlayerStatusSnapshot,
  ResourceDisplayMode,
  ResourceKind,
} from '@/views/game/types/playerStatus'
import { disconnectedPlayerStatusSnapshot } from '@/views/game/types/playerStatusFixtures'

const storageKey = 'ew.player-status.preferences.v1'
const defaultPreferences: PlayerStatusPreferences = {
  resourceModes: { hp: 'exact', mp: 'percentage', energy: 'percentage' },
}

function readPreferences(): PlayerStatusPreferences {
  if (typeof localStorage === 'undefined') return structuredClone(defaultPreferences)
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!value || typeof value !== 'object') return structuredClone(defaultPreferences)
    return {
      resourceModes: {
        ...defaultPreferences.resourceModes,
        ...(value as Partial<PlayerStatusPreferences>).resourceModes,
      },
    }
  } catch {
    return structuredClone(defaultPreferences)
  }
}

export const usePlayerStatusStore = defineStore('player-status', () => {
  const snapshot = ref<PlayerStatusSnapshot>(structuredClone(disconnectedPlayerStatusSnapshot))
  const preferences = ref<PlayerStatusPreferences>(readPreferences())
  const normalized = (kind: ResourceKind) => {
    const resource = snapshot.value[kind]
    const maximum = Math.max(0, Number.isFinite(resource.maximum) ? resource.maximum : 0)
    const current = Math.min(
      maximum,
      Math.max(0, Number.isFinite(resource.current) ? resource.current : 0),
    )
    return {
      current,
      maximum,
      ratio: maximum > 0 ? current / maximum : 0,
      percentage: maximum > 0 ? (current / maximum) * 100 : 0,
    }
  }
  function persist(): void {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem(storageKey, JSON.stringify(preferences.value))
  }
  function toggleResourceMode(kind: ResourceKind): void {
    preferences.value.resourceModes[kind] =
      preferences.value.resourceModes[kind] === 'exact' ? 'percentage' : 'exact'
    persist()
  }
  function replaceSnapshot(next: PlayerStatusSnapshot): void {
    snapshot.value = next
  }
  function updatePrototypeState(patch: Partial<PlayerStatusSnapshot>): void {
    snapshot.value = { ...snapshot.value, ...patch }
  }
  return {
    snapshot,
    preferences,
    normalized,
    toggleResourceMode,
    replaceSnapshot,
    updatePrototypeState,
  }
})
