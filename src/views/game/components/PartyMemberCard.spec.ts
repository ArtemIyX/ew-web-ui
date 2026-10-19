import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PartyMemberCard from './PartyMemberCard.vue'
import { createPartyEffect, createPartyMember } from '@/views/game/types/gamePartyFixtures'

describe('PartyMemberCard', () => {
  it('renders identity, resources, effects, and leader state', () => {
    const wrapper = mount(PartyMemberCard, {
      props: {
        member: createPartyMember({
          memberId: 'member-1',
          characterName: 'Sample Member One',
          isLeader: true,
          buffs: [createPartyEffect('buff', 1)],
          debuffs: [createPartyEffect('debuff', 1)],
        }),
      },
    })
    expect(wrapper.find('[data-member-id="member-1"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Sample Member One')
    expect(wrapper.findAll('.ew-progress')).toHaveLength(3)
    expect(wrapper.find('.ew-party-member-card__main').exists()).toBe(true)
    expect(
      wrapper.find('.ew-party-member-card__main .ew-party-member-resources').exists(),
    ).toBe(true)
    expect(wrapper.find('[data-party-leader="true"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-effect-kind="buff"] [role="listitem"]')).toHaveLength(1)
    expect(wrapper.findAll('[data-effect-kind="debuff"] [role="listitem"]')).toHaveLength(1)
  })

  it('keeps dead members marked without a visible dead label', () => {
    const wrapper = mount(PartyMemberCard, {
      props: { member: createPartyMember({ lifeState: 'dead' }) },
    })
    const identity = wrapper.find('.ew-party-member-card__identity')
    const children = identity.element.children
    expect(wrapper.find('[data-life-state="dead"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Dead')
    expect(identity.find('.ew-party-member-card__rip').exists()).toBe(false)
    expect(children[1]?.classList.contains('ew-party-member-card__name')).toBe(true)
    expect(children[2]?.classList.contains('ew-party-member-card__class-icon')).toBe(true)
  })
})
