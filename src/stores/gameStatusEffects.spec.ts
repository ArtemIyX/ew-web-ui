import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameDebuffsStore } from './gameDebuffs'
import { useGameTogglesStore } from './gameToggles'

function definition(skillId: string) {
  return {
    skillId,
    name: skillId,
    icon: { kind: 'local' as const, src: '/effect.svg' },
    level: 1,
  }
}

describe('independent status-effect domains', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps snapshots and revisions isolated', () => {
    const debuffs = useGameDebuffsStore()
    const toggles = useGameTogglesStore()

    expect(
      debuffs.replaceSnapshot({
        revision: 3,
        debuffs: [
          {
            debuffId: 'poison',
            definition: definition('poison-skill'),
            appliedAtMs: 1_000,
            endsAtMs: 2_000,
            order: 0,
          },
        ],
      }),
    ).toBe(true)
    expect(toggles.revision).toBe(0)
    expect(toggles.allToggles).toHaveLength(0)
  })

  it('expires locally without changing the authoritative revision', () => {
    const debuffs = useGameDebuffsStore()
    debuffs.replaceSnapshot({
      revision: 1,
      debuffs: [
        {
          debuffId: 'short',
          definition: definition('short-skill'),
          appliedAtMs: 0,
          endsAtMs: 100,
          order: 0,
        },
      ],
    })

    expect(debuffs.expireDueDebuffs(100)).toEqual(['short'])
    expect(debuffs.revision).toBe(1)
    expect(debuffs.allDebuffs).toHaveLength(0)
  })

  it('marks only the affected domain stale when a revision gap arrives', () => {
    const debuffs = useGameDebuffsStore()
    const toggles = useGameTogglesStore()

    expect(debuffs.applyRuntimeEvent({ kind: 'clear', revision: 2 })).toBe('needs-resync')
    expect(debuffs.status).toBe('stale')
    expect(toggles.status).toBe('idle')
    expect(toggles.revision).toBe(0)
  })
})
