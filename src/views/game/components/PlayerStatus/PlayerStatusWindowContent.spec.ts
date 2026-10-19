import { createPinia } from 'pinia'
import { h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { appLocalizationLoader } from '@/localization/appLocalizationLoader'
import GLocalizationProvider from '@/shared/providers/localization/GLocalizationProvider.vue'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import { useWindowManagerStore } from '@/stores/windowManager'
import { usePartyPresentationStore } from '@/stores/partyPresentation'
import PlayerStatusWindowContent from './PlayerStatusWindowContent.vue'
import PartyControlsWindowContent from '@/views/game/windows/PartyControlsWindowContent.vue'
import SquadControlsWindowContent from '@/views/game/windows/SquadControlsWindowContent.vue'

describe('PlayerStatusWindowContent party launcher', () => {
  it('opens and force-closes the managed party controls window', async () => {
    const pinia = createPinia()
    const wrapper = mount(GLocalizationProvider, {
      props: { loader: appLocalizationLoader },
      global: { plugins: [pinia] },
      slots: {
        default: () =>
          h(GOverlayHost, {
            windowDefinitions: [
              { id: 'player-status', component: PlayerStatusWindowContent },
              { id: 'party-controls', component: PartyControlsWindowContent },
              { id: 'squad-controls', component: SquadControlsWindowContent },
            ],
          }),
      },
    })
    const windowStore = useWindowManagerStore(pinia)
    windowStore.openManagedWindow('player-status')
    await nextTick()

    await flushPromises()
    const launcher = document.body.querySelector(
      '.ew-player-status__party-launcher',
    ) as HTMLButtonElement
    expect(launcher).not.toBeNull()
    expect(launcher.dataset.ewWindowNoDrag).toBe('')
    expect(launcher.getAttribute('aria-expanded')).toBe('false')
    expect(launcher.getAttribute('aria-label')).toBe('#PARTY_OPEN')

    launcher.click()
    await nextTick()
    expect(windowStore.isWindowOpen('party-controls').value).toBe(true)
    expect(document.body.querySelectorAll('#party-controls')).toHaveLength(1)
    expect(launcher.getAttribute('aria-expanded')).toBe('true')
    expect(launcher.getAttribute('aria-label')).toBe('#PARTY_CLOSE')

    launcher.click()
    await nextTick()
    expect(windowStore.isWindowOpen('party-controls').value).toBe(false)
    expect(document.body.querySelector('#party-controls')).toBeNull()
    expect(launcher.getAttribute('aria-expanded')).toBe('false')

    await wrapper.unmount()
  })

  it('opens squad controls independently and force-closes it without closing party controls', async () => {
    const pinia = createPinia()
    const wrapper = mount(GLocalizationProvider, {
      props: { loader: appLocalizationLoader },
      global: { plugins: [pinia] },
      slots: {
        default: () =>
          h(GOverlayHost, {
            windowDefinitions: [
              { id: 'player-status', component: PlayerStatusWindowContent },
              { id: 'party-controls', component: PartyControlsWindowContent },
              { id: 'squad-controls', component: SquadControlsWindowContent },
            ],
          }),
      },
    })
    const windowStore = useWindowManagerStore(pinia)
    windowStore.openManagedWindow('player-status')
    await nextTick()
    await flushPromises()

    const launcher = document.body.querySelector(
      '.ew-player-status__squad-launcher',
    ) as HTMLButtonElement
    expect(launcher.dataset.ewWindowNoDrag).toBe('')
    expect(launcher.getAttribute('aria-controls')).toBe('squad-controls')
    expect(launcher.getAttribute('aria-expanded')).toBe('false')
    expect(launcher.getAttribute('aria-label')).toBe('#SQUAD_OPEN')

    launcher.click()
    await nextTick()
    expect(windowStore.isWindowOpen('squad-controls').value).toBe(true)
    expect(launcher.getAttribute('aria-expanded')).toBe('true')
    expect(launcher.getAttribute('aria-label')).toBe('#SQUAD_CLOSE')

    const partyLauncher = document.body.querySelector(
      '.ew-player-status__party-launcher',
    ) as HTMLButtonElement
    partyLauncher.click()
    await nextTick()
    expect(windowStore.isWindowOpen('party-controls').value).toBe(true)
    expect(windowStore.isWindowOpen('squad-controls').value).toBe(true)

    launcher.click()
    await nextTick()
    expect(windowStore.isWindowOpen('squad-controls').value).toBe(false)
    expect(windowStore.isWindowOpen('party-controls').value).toBe(true)
    expect(document.body.querySelector('#squad-controls')).toBeNull()

    await wrapper.unmount()
  })

  it('wires party control intents to presentation state without closing controls', async () => {
    const pinia = createPinia()
    const wrapper = mount(GLocalizationProvider, {
      props: { loader: appLocalizationLoader },
      global: { plugins: [pinia] },
      slots: {
        default: () =>
          h(GOverlayHost, {
            windowDefinitions: [
              { id: 'player-status', component: PlayerStatusWindowContent },
              { id: 'party-controls', component: PartyControlsWindowContent },
              { id: 'squad-controls', component: SquadControlsWindowContent },
            ],
          }),
      },
    })
    const windowStore = useWindowManagerStore(pinia)
    const presentation = usePartyPresentationStore(pinia)
    windowStore.openManagedWindow('player-status')
    await flushPromises()

    const launcher = document.body.querySelector(
      '.ew-player-status__party-launcher',
    ) as HTMLButtonElement
    launcher.click()
    await nextTick()
    const actions = document.body.querySelectorAll('.ew-party-controls__action')
    expect(actions).toHaveLength(5)
    const pinAction = actions[1] as HTMLButtonElement
    pinAction.click()
    await nextTick()
    expect(presentation.mode).toBe('unpinned')
    expect(windowStore.isWindowOpen('party-controls').value).toBe(true)
    expect(pinAction.getAttribute('aria-pressed')).toBe('false')

    const visibilityAction = actions[2] as HTMLButtonElement
    visibilityAction.click()
    await nextTick()
    expect(presentation.visible).toBe(false)
    expect(visibilityAction.getAttribute('aria-pressed')).toBe('false')
    await wrapper.unmount()
  })
})
