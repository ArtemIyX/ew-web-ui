<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGamePartyStore } from '@/stores/gameParty'
import { usePartyPresentationStore } from '@/stores/partyPresentation'
import { createGamePartyDeveloperApi } from '@/services/game/party/gamePartyDeveloperApi'
import type { ResourceKind } from '@/views/game/types/playerStatus'

const store = useGamePartyStore()
const presentation = usePartyPresentationStore()
const api = createGamePartyDeveloperApi()
const selectedMemberId = ref<string | null>(null)
const selectedMember = computed(() =>
  selectedMemberId.value ? store.memberById(selectedMemberId.value) : store.members[0],
)

function populate(count: 2 | 3 | 5): void {
  api.populate(count)
  selectedMemberId.value = store.members[0]?.memberId ?? null
}

function selectMember(memberId: string): void {
  selectedMemberId.value = memberId
}

function adjust(kind: ResourceKind, delta: number): void {
  if (selectedMember.value) api.adjustResource(selectedMember.value.memberId, kind, delta)
}
</script>

<template>
  <section class="ew-debug-window-content__panel ew-party-debug-panel" role="tabpanel">
    <div class="ew-party-debug-panel__actions">
      <button type="button" @click="populate(2)">Populate 2 sample members</button>
      <button type="button" @click="populate(3)">Populate 3 sample members</button>
      <button type="button" @click="populate(5)">Populate 5 sample members</button>
      <button type="button" @click="api.clear">Clear party</button>
      <button type="button" :aria-pressed="presentation.mode === 'pinned'" @click="presentation.toggleMode">
        {{ presentation.mode === 'pinned' ? 'Use unpinned windows' : 'Use pinned group' }}
      </button>
      <button type="button" :aria-pressed="presentation.visible" @click="presentation.toggleVisible">
        {{ presentation.visible ? 'Hide party' : 'Show party' }}
      </button>
    </div>
    <div v-if="store.members.length" class="ew-party-debug-panel__members">
      <button
        v-for="member in store.members"
        :key="member.memberId"
        type="button"
        :aria-pressed="selectedMember?.memberId === member.memberId"
        @click="selectMember(member.memberId)"
      >
        {{ member.characterName }}
      </button>
    </div>
    <div v-if="selectedMember" class="ew-party-debug-panel__selected">
      <strong>{{ selectedMember.characterName }}</strong>
      <button type="button" @click="api.setLeader(selectedMember.memberId)">Make leader</button>
      <button
        type="button"
        :aria-pressed="selectedMember.lifeState === 'dead'"
        @click="api.setDead(selectedMember.memberId, selectedMember.lifeState !== 'dead')"
      >
        {{ selectedMember.lifeState === 'dead' ? 'Revive' : 'Mark dead' }}
      </button>
      <div class="ew-party-debug-panel__resources">
        <button type="button" @click="adjust('hp', -1000)">HP −1000</button>
        <button type="button" @click="adjust('hp', 1000)">HP +1000</button>
        <button type="button" @click="adjust('mp', -500)">MP −500</button>
        <button type="button" @click="adjust('mp', 500)">MP +500</button>
        <button type="button" @click="adjust('energy', -10)">Energy −10</button>
        <button type="button" @click="adjust('energy', 10)">Energy +10</button>
      </div>
      <div class="ew-party-debug-panel__effects">
        <button type="button" @click="api.addEffect(selectedMember.memberId, 'buff')">Add buff</button>
        <button type="button" @click="api.clearEffects(selectedMember.memberId, 'buff')">Clear buffs</button>
        <button type="button" @click="api.addEffect(selectedMember.memberId, 'debuff')">Add debuff</button>
        <button type="button" @click="api.clearEffects(selectedMember.memberId, 'debuff')">Clear debuffs</button>
      </div>
    </div>
    <p v-else>Populate deterministic sample data to inspect the party presentation.</p>
  </section>
</template>
