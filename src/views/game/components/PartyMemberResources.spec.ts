import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PartyMemberResources from './PartyMemberResources.vue'
import { createPartyMember } from '@/views/game/types/gamePartyFixtures'

describe('PartyMemberResources', () => {
  it('toggles the HP overlay between percentage and exact values', async () => {
    const member = createPartyMember()
    const wrapper = mount(PartyMemberResources, {
      props: { resources: member.resources, memberName: member.characterName },
    })
    const hpBar = wrapper.find('[data-resource-kind="hp"]')
    expect(hpBar.text()).toContain('84%')
    await hpBar.trigger('click')
    expect(hpBar.text()).toContain('8400 / 10000')
    await hpBar.trigger('click')
    expect(hpBar.text()).toContain('84%')
    expect(wrapper.findAll('.ew-progress')).toHaveLength(3)
  })
})
