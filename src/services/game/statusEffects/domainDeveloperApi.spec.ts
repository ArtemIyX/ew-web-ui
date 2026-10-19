import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createGameDebuffDeveloperApi } from '@/services/game/debuffs/gameDebuffDeveloperApi'
import { createGameToggleDeveloperApi } from '@/services/game/toggles/gameToggleDeveloperApi'

describe('domain developer mutation guards', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('rejects debuff and toggle mutations when the guard is closed', () => {
    const debuffs = createGameDebuffDeveloperApi({ allowMutations: () => false })
    const toggles = createGameToggleDeveloperApi({ allowMutations: () => false })

    expect(debuffs.clearDebuffs()).toEqual({
      ok: false,
      error: 'developer-mutations-disabled',
    })
    expect(toggles.clearToggles()).toEqual({
      ok: false,
      error: 'developer-mutations-disabled',
    })
  })
})
