import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameSkillDragStore } from './gameSkillDrag'
import { useGameSkillsStore } from './gameSkills'
import { useGameShortcutsStore } from './gameShortcuts'
import type { GameSkillSnapshot } from '@/views/game/types/gameSkills'

const snapshot: GameSkillSnapshot = {
  revision: 1,
  subcategories: [{ id: 'combat', group: 'active', label: 'Combat', order: 1 }],
  skills: [
    {
      definition: {
        skillId: 'strike',
        subcategoryId: 'combat',
        name: 'Strike',
        level: 1,
        icon: { kind: 'local', src: '/strike.svg' },
        flags: { toggleable: false, active: false, usable: true, passive: false },
      },
      runtime: { skillId: 'strike', usable: true, active: false, cooldown: null },
    },
  ],
}
describe('game skill drag store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  it('binds a catalog skill to an unlocked shortcut without copying drag data', () => {
    const skills = useGameSkillsStore()
    const drag = useGameSkillDragStore()
    skills.replaceSnapshot(snapshot)
    expect(drag.begin({ kind: 'catalog', skillId: 'strike' })).toBe(true)
    drag.start()
    drag.updatePointer(24, 36)
    expect(drag.pointer).toEqual({ x: 24, y: 36 })
    expect(drag.drop(1)).toBe(true)
    expect(skills.bindings[1]).toBe('strike')
    expect(drag.pointer).toBeNull()
  })
  it('rejects locked destinations and cancels safely', () => {
    const skills = useGameSkillsStore()
    const drag = useGameSkillDragStore()
    skills.replaceSnapshot(snapshot)
    const shortcuts = useGameShortcutsStore()
    shortcuts.toggleSlotLocked(1)
    drag.begin({ kind: 'catalog', skillId: 'strike' })
    drag.start()
    expect(drag.drop(1)).toBe(false)
    drag.cancel()
    expect(drag.source).toBeNull()
  })
})
