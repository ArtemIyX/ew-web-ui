import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useMenuStore, MenuConnectionStatus } from '../menu'

describe('menu store', () => { beforeEach(() => setActivePinia(createPinia()))
  it('connects and selects an allowed hero', async () => { const store=useMenuStore(); await store.connect({sessionId:'302',login:'testLogin'}); expect(store.connectionStatus).toBe(MenuConnectionStatus.Ready); store.selectHero('sample-01'); expect(store.selectedHero?.heroName).toBe('Sample Hero 01'); expect(store.canEnterWorld).toBe(true) })
  it('does not allow a deleting hero to remain selected', async () => { const store=useMenuStore(); await store.connect({sessionId:'302',login:'testLogin'}); store.selectHero('sample-01'); await store.startHeroDeletion('sample-01'); expect(store.selectedHero).toBeNull(); expect(store.heroes[0]?.deletionDeadlineMs).not.toBeNull() })
})
