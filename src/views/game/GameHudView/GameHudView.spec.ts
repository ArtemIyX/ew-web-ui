import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import GameHudView from './GameHudView.vue'
import { useWindowManagerStore } from '@/stores/windowManager'
import { PARTY_GROUP_WINDOW_ID, PARTY_MEMBER_WINDOW_IDS } from '@/views/game/types/partyWindows'
import { PLAYER_ABILITY_CAST_WINDOW_ID } from '@/views/game/types/gameAbilityCast'

const StubWindow = defineComponent({ template: '<div />' })

describe('GameHudView', () => {
  it('opens the persistent HUD windows and leaves party hidden without a roster', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(GOverlayHost, {
      props: {
        windowDefinitions: [
          { id: 'player-status', component: StubWindow },
          { id: 'buff-list', component: StubWindow },
          { id: 'debuff-list', component: StubWindow },
          { id: 'toggle-list', component: StubWindow },
          { id: PLAYER_ABILITY_CAST_WINDOW_ID, component: StubWindow },
          { id: PARTY_GROUP_WINDOW_ID, component: StubWindow },
          ...PARTY_MEMBER_WINDOW_IDS.map((id) => ({ id, component: StubWindow })),
        ],
      },
      global: {
        plugins: [pinia],
        stubs: { GameChat: true, GameShortcutPanel: true },
      },
      slots: { default: GameHudView },
    })
    await wrapper.vm.$nextTick()
    const store = useWindowManagerStore(pinia)
    expect(store.isWindowOpen('player-status').value).toBe(true)
    expect(store.isWindowOpen('buff-list').value).toBe(true)
    expect(store.isWindowOpen('debuff-list').value).toBe(true)
    expect(store.isWindowOpen('toggle-list').value).toBe(true)
    expect(store.isWindowOpen(PLAYER_ABILITY_CAST_WINDOW_ID).value).toBe(true)
    expect(store.isWindowOpen(PARTY_GROUP_WINDOW_ID).value).toBe(false)
    await wrapper.unmount()
  })
})
