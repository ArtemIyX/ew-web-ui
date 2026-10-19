import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import { useGamePartyStore } from '@/stores/gameParty'
import { usePartyPresentationStore } from '@/stores/partyPresentation'
import { usePartyWindowCoordinator } from './usePartyWindowCoordinator'
import { PARTY_GROUP_WINDOW_ID, PARTY_MEMBER_WINDOW_IDS } from '@/views/game/types/partyWindows'
import { createGamePartySnapshot } from '@/views/game/types/gamePartyFixtures'
import { useWindowManagerStore } from '@/stores/windowManager'

const StubWindow = defineComponent({ template: '<div />' })

describe('usePartyWindowCoordinator', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('opens exactly one representation for a displayable party', async () => {
    const pinia = getActivePinia()!
    const party = useGamePartyStore(pinia)
    const presentation = usePartyPresentationStore(pinia)
    const Harness = defineComponent({ setup: () => usePartyWindowCoordinator(), template: '<div />' })
    const wrapper = mount(GOverlayHost, {
      props: {
        windowDefinitions: [
          { id: PARTY_GROUP_WINDOW_ID, component: StubWindow },
          ...PARTY_MEMBER_WINDOW_IDS.map((id) => ({ id, component: StubWindow })),
        ],
      },
      global: { plugins: [pinia] },
      slots: { default: Harness },
    })
    party.replaceSnapshot(createGamePartySnapshot())
    await nextTick()
    expect(openIds()).toEqual([PARTY_GROUP_WINDOW_ID])
    const windowStore = useWindowManagerStore()
    const groupGeometry = windowStore.layouts[PARTY_GROUP_WINDOW_ID]
    expect(groupGeometry).toBeDefined()

    presentation.toggleMode()
    await nextTick()
    expect(openIds()).toEqual(['party-member-1', 'party-member-2'])
    expect(windowStore.layouts['party-member-1']).toMatchObject({
      x: groupGeometry!.x,
      y: groupGeometry!.y,
    })
    expect(windowStore.layouts['party-member-2']).toMatchObject({
      x: groupGeometry!.x,
      y: groupGeometry!.y + (groupGeometry!.height - 2 * 0.5 * 16) / 2,
    })

    presentation.toggleVisible()
    await nextTick()
    expect(openIds()).toEqual([])
    presentation.toggleVisible()
    await nextTick()
    expect(openIds()).toEqual(['party-member-1', 'party-member-2'])
    await wrapper.unmount()
  })
})

function openIds(
): string[] {
  const ids = [PARTY_GROUP_WINDOW_ID, ...PARTY_MEMBER_WINDOW_IDS]
  return ids.filter((id) => useWindowManagerStore().isWindowOpen(id).value)
}
