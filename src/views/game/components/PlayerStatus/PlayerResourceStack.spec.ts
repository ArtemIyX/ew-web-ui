import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerResourceStack from './PlayerResourceStack.vue'
import type { PlayerStatusSnapshot } from '@/views/game/types/playerStatus'

const snapshot: PlayerStatusSnapshot = {
  characterName: 'Sample Player',
  level: 50,
  isPartyLeader: false,
  isRaidLeader: false,
  isInParty: false,
  isInRaid: false,
  partyLocked: false,
  raidVisible: false,
  readiness: 'not-ready',
  hp: { current: 100000, maximum: 100000 },
  mp: { current: 64000, maximum: 64000 },
  energy: { current: 82, maximum: 100 },
  lifeEnergy: { current: 72, maximum: 100 },
  manaEnergy: { current: 88, maximum: 100 },
}

describe('PlayerResourceStack', () => {
  it('renders secondary strips inside HP and MP rows only', () => {
    const wrapper = mount(PlayerResourceStack, {
      props: {
        snapshot,
        modes: { hp: 'exact', mp: 'percentage', energy: 'percentage' },
      },
    })

    const rows = wrapper.findAll('.ew-player-status__resource-row')
    expect(rows).toHaveLength(3)
    expect(rows[0]?.findAll('.ew-player-status__resource')).toHaveLength(2)
    expect(rows[1]?.findAll('.ew-player-status__resource')).toHaveLength(2)
    expect(wrapper.findAll('.ew-player-status__resource-row-secondary')).toHaveLength(2)
    expect(
      wrapper.findAll('.ew-player-status__resource-row-secondary > .ew-player-status__resource'),
    ).toHaveLength(2)
    expect(wrapper.find('[data-resource-kind="energy"]')).toBeTruthy()
    expect(rows.map((row) => row.attributes('data-resource-kind'))).toEqual(['hp', 'mp', 'energy'])
    expect(
      rows[0]?.find('.ew-player-status__resource-row-main .ew-progress--notched').exists(),
    ).toBe(true)
    expect(
      rows[1]?.find('.ew-player-status__resource-row-main .ew-progress--notched').exists(),
    ).toBe(true)
    expect(
      rows[2]?.find('.ew-player-status__resource-row-main .ew-progress--angled').exists(),
    ).toBe(true)
    expect(rows[0]?.find('.ew-player-status__resource-row-main').element.nextElementSibling).toBe(
      rows[0]?.find('.ew-player-status__resource-row-secondary').element,
    )
    expect(rows[1]?.find('.ew-player-status__resource-row-main').element.nextElementSibling).toBe(
      rows[1]?.find('.ew-player-status__resource-row-secondary').element,
    )
    expect(
      rows[0]?.find('.ew-player-status__resource-row-secondary .ew-progress--angled').exists(),
    ).toBe(true)
    expect(
      rows[1]?.find('.ew-player-status__resource-row-secondary .ew-progress--angled').exists(),
    ).toBe(true)
    expect(
      rows[0]?.find('.ew-player-status__resource-row-secondary [data-tone="hp"]').exists(),
    ).toBe(true)
    expect(
      rows[1]?.find('.ew-player-status__resource-row-secondary [data-tone="mp"]').exists(),
    ).toBe(true)
    expect(
      rows[0]?.find('.ew-player-status__resource-row-secondary .ew-progress__overlay').exists(),
    ).toBe(false)
    expect(
      rows[1]?.find('.ew-player-status__resource-row-secondary .ew-progress__overlay').exists(),
    ).toBe(false)
    expect(wrapper.text()).toContain('100000 / 100000')
  })
})
