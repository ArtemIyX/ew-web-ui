import debugOrb from '@/assets/debug-icons/debug-orb-02.svg'
import type { IconSource, TextContent } from '@/shared/types/components'
import type { AbilityCastSnapshot } from './gameAbilityCast'
import type { GameStatusEffectRecord } from './gameStatusEffects'
import type { ResourceValue } from './gameResources'
import type { SelectedTargetSnapshot, TargetAffiliation } from './gameTargetStatus'

const sampleIcon: IconSource = { kind: 'local', src: debugOrb }
export function createSampleTargetAffiliation(overrides: Partial<TargetAffiliation> = {}): TargetAffiliation {
  return { affiliationId: 'sample-affiliation', name: 'Sample affiliation', icon: sampleIcon, ...overrides }
}
export function createSampleTargetEffect(index = 1, overrides: Partial<GameStatusEffectRecord> = {}): GameStatusEffectRecord {
  return { id: `sample-effect-${index}`, definition: { skillId: `sample-effect-skill-${index}`, level: 1, name: `Sample effect ${index}`, icon: sampleIcon, description: 'Development-only sample effect.' }, appliedAtMs: 0, endsAtMs: null, order: index, ...overrides }
}
export function createSampleAbilityCast(overrides: Partial<AbilityCastSnapshot> = {}): AbilityCastSnapshot {
  return { castId: 'sample-cast-1', abilityId: 'sample-ability-1', abilityName: 'Sample Ability', startedAtMs: Date.now(), endsAtMs: Date.now() + 1200, ...overrides }
}
function createTarget(overrides: Partial<SelectedTargetSnapshot> = {}): SelectedTargetSnapshot {
  const hp: ResourceValue = { current: 730, maximum: 1000 }
  return { targetId: 'sample-target-player', entityKind: 'player', marker: 'ally', displayName: 'Sample Target', level: 42, portrait: sampleIcon, guild: createSampleTargetAffiliation({ affiliationId: 'sample-guild', name: 'Sample Guild' }), order: createSampleTargetAffiliation({ affiliationId: 'sample-order', name: 'Sample Order' }), hp, buffs: [], debuffs: [], activeCast: null, ...overrides }
}
export function createSamplePlayerTarget(overrides: Partial<SelectedTargetSnapshot> = {}): SelectedTargetSnapshot { return createTarget(overrides) }
export function createSampleStructureTarget(overrides: Partial<SelectedTargetSnapshot> = {}): SelectedTargetSnapshot { return createTarget({ targetId: 'sample-target-structure', entityKind: 'world-structure', marker: 'world-structure', displayName: 'Sample World Structure', portrait: null, guild: null, order: null, ...overrides }) }
export function createSampleMonsterTarget(overrides: Partial<SelectedTargetSnapshot> = {}): SelectedTargetSnapshot { return createTarget({ targetId: 'sample-target-monster', entityKind: 'monster', marker: 'monster', displayName: 'Sample Monster', portrait: null, guild: null, order: null, ...overrides }) }
export function createSampleBossTarget(overrides: Partial<SelectedTargetSnapshot> = {}): SelectedTargetSnapshot { return createTarget({ targetId: 'sample-target-boss', entityKind: 'boss', marker: 'boss', displayName: 'Sample Boss', portrait: null, guild: null, order: null, ...overrides }) }
