import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import GOverlayHost from '@/shared/providers/overlays/GOverlayHost.vue'
import { useGameTargetStatusStore } from '@/stores/gameTargetStatus'
import { useWindowManagerStore } from '@/stores/windowManager'
import { createSamplePlayerTarget } from '@/views/game/types/gameTargetStatusFixtures'
import { TARGET_STATUS_WINDOW_ID } from '@/views/game/types/gameTargetStatus'
import { useTargetStatusWindowCoordinator } from './useTargetStatusWindowCoordinator'

const StubWindow = defineComponent({ template: '<div />' })

describe('useTargetStatusWindowCoordinator', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('opens on selection, preserves z-order during updates, and closes on clear', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const Harness = defineComponent({ setup: () => useTargetStatusWindowCoordinator(), template: '<div />' })
    const wrapper = mount(GOverlayHost, {
      props: { windowDefinitions: [{ id: TARGET_STATUS_WINDOW_ID, component: StubWindow }] },
      global: { plugins: [pinia] },
      slots: { default: Harness },
    })
    const store = useGameTargetStatusStore()
    store.replaceSnapshot({ revision: 1, target: createSamplePlayerTarget() })
    await nextTick()
    const windows = useWindowManagerStore()
    expect(windows.isWindowOpen(TARGET_STATUS_WINDOW_ID).value).toBe(true)
    const zOrder = windows.managedWindows[TARGET_STATUS_WINDOW_ID]?.zOrder
    store.applyRuntimeEvent({ kind: 'target-patched', revision: 2, targetId: 'sample-target-player', patch: { displayName: 'Updated target' } })
    await nextTick()
    expect(windows.managedWindows[TARGET_STATUS_WINDOW_ID]?.zOrder).toBe(zOrder)
    store.applyRuntimeEvent({ kind: 'target-cleared', revision: 3, targetId: 'sample-target-player' })
    await nextTick()
    expect(windows.isWindowOpen(TARGET_STATUS_WINDOW_ID).value).toBe(false)
    await wrapper.unmount()
  })
})
