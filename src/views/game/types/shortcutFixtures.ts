import type { ShortcutSlot } from './shortcuts'
import debug02 from '@/assets/debug-icons/debug-orb-02.svg'
import debug03 from '@/assets/debug-icons/debug-orb-03.svg'
import debug04 from '@/assets/debug-icons/debug-orb-04.svg'
import debug05 from '@/assets/debug-icons/debug-orb-05.svg'

const sampleUpgradeTexts = [
  'Improves the effect at the next rank.',
  'Increases the strength of the skill.',
  'Extends the effect duration.',
  'Reduces the reuse period.',
  'Improves the skill range.',
  'Improves the resource efficiency.',
  'Adds a stronger secondary effect.',
  'Increases the maximum affected targets.',
  'Improves the effect against elite targets.',
  'Unlocks the final rank bonus.',
]

function sampleUpgrades(skillId: string) {
  const seed = Number.parseInt(skillId, 10) || 0
  const count = 3 + (seed % 8)
  return sampleUpgradeTexts.slice(0, count).map((text, index) => ({
    key: `rank-${index + 2}`,
    text: `Rank ${index + 2}: ${text}`,
  }))
}

function sampleFacts(skillId: string) {
  const seed = Number.parseInt(skillId, 10) || 0
  return [
    {
      key: 'reuse-time',
      label: 'Reuse time',
      value: { kind: 'duration' as const, milliseconds: 1200 + (seed % 5) * 600 },
    },
    {
      key: 'mp-cost',
      label: 'MP',
      value: { kind: 'number' as const, value: 12 + (seed % 6) * 4 },
    },
    {
      key: 'power',
      label: 'Power',
      value: { kind: 'number' as const, value: 80 + (seed % 8) * 15 },
    },
    {
      key: 'target',
      label: 'Target',
      value: { kind: 'text' as const, content: seed % 2 ? 'Single enemy' : 'Area' },
    },
  ]
}

export const shortcutDebugFixtures: ShortcutSlot[] = [
  {
    position: 1,
    entry: {
      kind: 'skill',
      skillId: '1001',
      level: 1,
      name: 'Sample ready skill',
      description: 'A sample skill used by the disconnected development harness.',
      type: 'Active',
      facts: sampleFacts('1001'),
      upgrades: sampleUpgrades('1001'),
      icon: { kind: 'local', src: debug02 },
      flags: { toggleable: false, active: false, usable: true, passive: false },
      cooldown: null,
    },
  },
  {
    position: 2,
    entry: {
      kind: 'skill',
      skillId: '1002',
      level: 2,
      name: 'Sample active skill',
      description: 'A sample active skill that demonstrates a persistent effect.',
      facts: sampleFacts('1002'),
      upgrades: sampleUpgrades('1002'),
      icon: { kind: 'local', src: debug03 },
      flags: { toggleable: true, active: true, usable: true, passive: false },
      cooldown: null,
    },
  },
  {
    position: 3,
    entry: {
      kind: 'skill',
      skillId: '1003',
      level: 1,
      name: 'Sample cooldown skill',
      description: 'A sample skill currently unavailable during its reuse period.',
      facts: sampleFacts('1003'),
      upgrades: sampleUpgrades('1003'),
      icon: { kind: 'local', src: debug04 },
      flags: { toggleable: false, active: false, usable: true, passive: false },
      cooldown: { startedAtMs: Date.now(), endsAtMs: Date.now() + 5000 },
    },
  },
  {
    position: 4,
    entry: {
      kind: 'skill',
      skillId: '1004',
      level: 1,
      name: 'Sample unusable skill',
      description: 'A sample skill that demonstrates an unavailable action state.',
      facts: sampleFacts('1004'),
      upgrades: sampleUpgrades('1004'),
      icon: { kind: 'local', src: debug05 },
      flags: { toggleable: false, active: false, usable: false, passive: false },
      cooldown: null,
    },
  },
  { position: 5, entry: { kind: 'item', itemId: 'debug-item', unsupported: true } },
  { position: 6, entry: { kind: 'macro', macroId: 'debug-macro', unsupported: true } },
]
