import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWindowManagerStore } from './windowManager'

describe('window manager store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn<() => void>() })
  })
  it('focuses an existing window instead of duplicating it', () => {
    const store = useWindowManagerStore()
    expect(store.openManagedWindow('settings')).toBe(true)
    expect(store.openManagedWindow('settings')).toBe(false)
    expect(Object.keys(store.managedWindows)).toHaveLength(1)
    expect(store.managedWindows.settings?.zOrder).toBe(2)
  })
  it('honors closability and keeps geometry after closing', () => {
    const store = useWindowManagerStore()
    store.openManagedWindow('locked', { closable: false })
    expect(store.closeManagedWindow('locked')).toBe(false)
    expect(store.closeManagedWindow('locked', true)).toBe(true)
    store.commitGeometry('locked', { x: 1, y: 2, width: 300, height: 200 })
    expect(store.layouts.locked?.width).toBe(300)
  })
  it('defaults direct managed openings to non-closable', () => {
    const store = useWindowManagerStore()
    store.openManagedWindow('default-locked')
    expect(store.managedWindows['default-locked']?.props.closable).toBe(false)
    expect(store.closeManagedWindow('default-locked')).toBe(false)
  })
  it('raises an existing window when it receives focus', () => {
    const store = useWindowManagerStore()
    store.openManagedWindow('first')
    store.openManagedWindow('second')
    expect(store.managedWindows.first?.zOrder).toBeLessThan(
      store.managedWindows.second?.zOrder ?? 0,
    )
    expect(store.focusWindow('first')).toBe(true)
    expect(store.managedWindows.first?.zOrder).toBeGreaterThan(
      store.managedWindows.second?.zOrder ?? 0,
    )
  })
})
