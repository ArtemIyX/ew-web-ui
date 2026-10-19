<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameShortcutsStore } from '@/stores/gameShortcuts'
import GTab from '@/shared/components/navigation/GTab/GTab.vue'
import GTabs from '@/shared/components/navigation/GTabs/GTabs.vue'
import { shortcutDebugFixtures } from '../types/shortcutFixtures'
import type { SkillShortcut } from '../types/shortcuts'
import { useWindows } from '@/shared/composables/windows/useWindows'
import { gameText } from '@/localization/gameText'
import GText from '@/shared/components/content/GText/GText.vue'
import { useGameSkillsStore } from '@/stores/gameSkills'
import { usePlayerStatusStore } from '@/stores/playerStatus'
import type { ResourceKind } from '@/views/game/types/playerStatus'
import type {
  GameSkillDefinition,
  GameSkillRecord,
  GameSkillSnapshot,
  SkillGroup,
} from '@/views/game/types/gameSkills'
import debug02 from '@/assets/debug-icons/debug-orb-02.svg'
import debug03 from '@/assets/debug-icons/debug-orb-03.svg'
import debug04 from '@/assets/debug-icons/debug-orb-04.svg'
import debug05 from '@/assets/debug-icons/debug-orb-05.svg'
import debug06 from '@/assets/debug-icons/debug-orb-06.svg'
import debug07 from '@/assets/debug-icons/debug-orb-07.svg'
import debug08 from '@/assets/debug-icons/debug-orb-08.svg'
import debug09 from '@/assets/debug-icons/debug-orb-09.svg'
import debug10 from '@/assets/debug-icons/debug-orb-10.svg'
import debug11 from '@/assets/debug-icons/debug-orb-11.svg'
import { createGameBuffDeveloperApi } from '@/services/game/buffs/gameBuffDeveloperApi'
import type { GameBuffDefinition } from '@/views/game/types/gameBuffs'
import { createGameDebuffDeveloperApi } from '@/services/game/debuffs/gameDebuffDeveloperApi'
import { createGameToggleDeveloperApi } from '@/services/game/toggles/gameToggleDeveloperApi'
import type { GameDebuffRecord } from '@/views/game/types/gameDebuffs'
import type { GameToggleRecord } from '@/views/game/types/gameToggles'
import StatusEffectDebugPanel from './debug/StatusEffectDebugPanel.vue'
import PartyDebugPanel from './debug/PartyDebugPanel.vue'
import TargetStatusDebugPanel from './debug/TargetStatusDebugPanel.vue'
import PlayerCastDebugPanel from './debug/PlayerCastDebugPanel.vue'

type DebugStatusResource = 'hp' | 'lifeEnergy' | 'mp' | 'manaEnergy' | 'energy'

interface DebugStatusControl {
  key: DebugStatusResource
  label: string
  tone: ResourceKind
  step: number
}

const activeTab = ref<
  | 'skills'
  | 'status'
  | 'buffs'
  | 'debuffs'
  | 'toggles'
  | 'windows'
  | 'party'
  | 'target-status'
  | 'player-cast'
>('skills')
const store = useGameShortcutsStore()
const skillsStore = useGameSkillsStore()
const statusStore = usePlayerStatusStore()
const { toggleWindow, isWindowOpen } = useWindows()
const skillListOpen = isWindowOpen('skill-list')
const settingsOpen = isWindowOpen('game-settings')
const buffListOpen = isWindowOpen('buff-list')
const buffApi = createGameBuffDeveloperApi()
const debuffApi = createGameDebuffDeveloperApi()
const toggleApi = createGameToggleDeveloperApi()
const buffDebugPanelApi = {
  list: () => buffApi.listBuffs().map((record) => ({ id: record.buffId, endsAtMs: record.endsAtMs })),
  listTimed: () =>
    buffApi.listTimedBuffs().map((record) => ({ id: record.buffId, endsAtMs: record.endsAtMs })),
  openWindow: buffApi.openWindow,
  add: (record: unknown) => buffApi.addBuff(record as Parameters<typeof buffApi.addBuff>[0]),
  clear: buffApi.clearBuffs,
  setRemainingTime: buffApi.setRemainingTime,
  adjustEndTime: buffApi.adjustEndTime,
  makePermanent: buffApi.makePermanent,
  expireNow: buffApi.expireNow,
}
const debuffDebugPanelApi = {
  list: () =>
    debuffApi.list().map((record) => ({ id: record.debuffId, endsAtMs: record.endsAtMs })),
  listTimed: () =>
    debuffApi.listTimed().map((record) => ({ id: record.debuffId, endsAtMs: record.endsAtMs })),
  openWindow: debuffApi.openWindow,
  add: (record: unknown) => debuffApi.addDebuff(record as GameDebuffRecord),
  clear: debuffApi.clearDebuffs,
  setRemainingTime: debuffApi.setRemainingTime,
  adjustEndTime: debuffApi.adjustEndTime,
  makePermanent: debuffApi.makePermanent,
  expireNow: debuffApi.expireNow,
}
const toggleDebugPanelApi = {
  list: () =>
    toggleApi.list().map((record) => ({ id: record.toggleId, endsAtMs: record.endsAtMs })),
  listTimed: () =>
    toggleApi.listTimed().map((record) => ({ id: record.toggleId, endsAtMs: record.endsAtMs })),
  openWindow: toggleApi.openWindow,
  add: (record: unknown) => toggleApi.addToggle(record as GameToggleRecord),
  clear: toggleApi.clearToggles,
  setRemainingTime: toggleApi.setRemainingTime,
  adjustEndTime: toggleApi.adjustEndTime,
  makePermanent: toggleApi.makePermanent,
  expireNow: toggleApi.expireNow,
}
function createDebugPanelSample(
  kind: 'debuff' | 'toggle',
  id: string,
  endsAtMs: number | null,
  order: number,
) {
  const definition = sampleEffectDefinition(kind, order)
  return kind === 'debuff'
    ? { debuffId: id, definition, appliedAtMs: Date.now(), endsAtMs, order }
    : { toggleId: id, definition, appliedAtMs: Date.now(), endsAtMs, order }
}
const statusControls: readonly DebugStatusControl[] = [
  { key: 'hp', label: 'Health', tone: 'hp', step: 10000 },
  { key: 'lifeEnergy', label: 'Health Energy', tone: 'hp', step: 10 },
  { key: 'mp', label: 'Mana', tone: 'mp', step: 10000 },
  { key: 'manaEnergy', label: 'Mana energy', tone: 'mp', step: 10 },
  { key: 'energy', label: 'Energy', tone: 'energy', step: 10 },
]
const debugIconUrls = [
  debug02,
  debug03,
  debug04,
  debug05,
  debug06,
  debug07,
  debug08,
  debug09,
  debug10,
  debug11,
]
const skillPositions = computed(() =>
  store.slots.filter((slot) => slot.entry?.kind === 'skill').map((slot) => slot.position),
)
const sampleDefinition = (index: number): GameBuffDefinition => ({
  skillId: `debug-buff-skill-${index}`,
  level: (index % 5) + 1,
  name: `Sample debug buff ${index}`,
  icon: { kind: 'local', src: debugIconUrls[index % debugIconUrls.length] ?? debug02 },
  description: 'Development-only buff data.',
})
const sampleEffectDefinition = (kind: 'debuff' | 'toggle', index: number) => ({
  skillId: `debug-${kind}-skill-${index}`,
  level: (index % 5) + 1,
  name: `Sample debug ${kind} ${index}`,
  icon: { kind: 'local' as const, src: debugIconUrls[index % debugIconUrls.length] ?? debug02 },
  description: `Development-only ${kind} data.`,
})

function createBuffPanelSample(id: string, endsAtMs: number | null, order: number) {
  return {
    buffId: id,
    definition: sampleDefinition(order),
    appliedAtMs: Date.now(),
    endsAtMs,
    order,
  }
}
function addSampleEffect(kind: 'debuff' | 'toggle', durationMs: number | null = null): void {
  const api = kind === 'debuff' ? debuffApi : toggleApi
  const index = api.list().length + 1
  const common = {
    definition: sampleEffectDefinition(kind, index),
    appliedAtMs: Date.now(),
    endsAtMs: durationMs === null ? null : Date.now() + durationMs,
    order: index,
  }
  if (kind === 'debuff')
    debuffApi.addDebuff({ ...common, debuffId: `debug-debuff-${Date.now()}-${index}` })
  else toggleApi.addToggle({ ...common, toggleId: `debug-toggle-${Date.now()}-${index}` })
}
function clearEffects(kind: 'debuffs' | 'toggles'): void {
  if (kind === 'debuffs') debuffApi.clearDebuffs()
  else toggleApi.clearToggles()
}
function addEffect(kind: 'debuffs' | 'toggles', durationMs: number | null): void {
  addSampleEffect(kind === 'debuffs' ? 'debuff' : 'toggle', durationMs)
}
function effectApi(kind: 'debuffs' | 'toggles') {
  return kind === 'debuffs' ? debuffApi : toggleApi
}
function populateEffects(kind: 'debuffs' | 'toggles', count: number): void {
  if (kind === 'debuffs') debuffApi.clearDebuffs()
  else toggleApi.clearToggles()
  for (let index = 1; index <= count; index += 1)
    addSampleEffect(kind === 'debuffs' ? 'debuff' : 'toggle')
}
function randomEffectId(kind: 'debuffs' | 'toggles'): string | undefined {
  const record = effectApi(kind).list()[Math.floor(Math.random() * effectApi(kind).list().length)]
  return kind === 'debuffs'
    ? (record as GameDebuffRecord | undefined)?.debuffId
    : (record as GameToggleRecord | undefined)?.toggleId
}
function setRandomEffectTime(kind: 'debuffs' | 'toggles', durationMs: number): void {
  const id = randomEffectId(kind)
  if (id) effectApi(kind).setRemainingTime(id, durationMs)
}
function adjustRandomEffect(kind: 'debuffs' | 'toggles', deltaMs: number): void {
  const timed = effectApi(kind).listTimed()
  const record = timed[Math.floor(Math.random() * timed.length)]
  const id =
    kind === 'debuffs'
      ? (record as GameDebuffRecord | undefined)?.debuffId
      : (record as GameToggleRecord | undefined)?.toggleId
  if (id) effectApi(kind).adjustEndTime(id, deltaMs)
}
function makeRandomEffectPermanent(kind: 'debuffs' | 'toggles'): void {
  const record = effectApi(kind).listTimed()[0]
  const id =
    kind === 'debuffs'
      ? (record as GameDebuffRecord | undefined)?.debuffId
      : (record as GameToggleRecord | undefined)?.toggleId
  if (id) effectApi(kind).makePermanent(id)
}
function expireRandomEffect(kind: 'debuffs' | 'toggles'): void {
  const id = randomEffectId(kind)
  if (id) effectApi(kind).expireNow(id)
}

function addRandomSkill() {
  const skills = shortcutDebugFixtures.flatMap((slot) =>
    slot.entry?.kind === 'skill' ? [slot.entry] : [],
  )
  const skill = skills[Math.floor(Math.random() * skills.length)]
  const position = Math.floor(Math.random() * store.slots.length) + 1

  if (!skill) {
    return
  }

  const copy: SkillShortcut = {
    ...skill,
    flags: { ...skill.flags },
    cooldown: null,
  }
  store.assignSkill(position, copy)
}

function startRandomReuse() {
  const position = skillPositions.value[Math.floor(Math.random() * skillPositions.value.length)]
  if (position === undefined) {
    return
  }

  const nowMs = Date.now()
  const durationMs = (Math.random() * 44 + 1) * 1000
  const progress = Math.random()
  const startedAtMs = nowMs - durationMs * progress
  const endsAtMs = startedAtMs + durationMs
  store.setCooldownWindow(position, startedAtMs, endsAtMs)
}

function populateSkillCatalog() {
  const groups: SkillGroup[] = ['active', 'passive', 'other']
  const skillsPerSubcategory: Record<SkillGroup, number[]> = {
    active: [3, 5, 6, 6],
    passive: [4, 6, 8, 9],
    other: [5, 7, 10, 12],
  }
  const subcategories = groups.flatMap((group) =>
    Array.from({ length: 4 }, (_, index) => ({
      id: `debug-${group}-${index + 1}`,
      group,
      label: `${group.charAt(0).toUpperCase()}${group.slice(1)} ${index + 1}`,
      order: index + 1,
    })),
  )
  const templates = shortcutDebugFixtures.flatMap((slot) =>
    slot.entry?.kind === 'skill' ? [slot.entry] : [],
  )
  const records: GameSkillRecord[] = groups.flatMap((group, groupIndex) =>
    Array.from(
      { length: skillsPerSubcategory[group].reduce((total, count) => total + count, 0) },
      (_, index) => {
        const template = templates[index % templates.length]!
        const counts = skillsPerSubcategory[group]
        let subcategoryIndex = 0
        let offset = counts[0]!
        while (index >= offset && subcategoryIndex < counts.length - 1) {
          subcategoryIndex += 1
          offset += counts[subcategoryIndex]!
        }
        const subcategory = subcategories[groupIndex * 4 + subcategoryIndex]!
        const skillId = `debug-${group}-${index + 1}`
        const definitionTemplate = Object.fromEntries(
          Object.entries(template).filter(([key]) => key !== 'kind' && key !== 'cooldown'),
        ) as GameSkillDefinition
        return {
          definition: {
            ...definitionTemplate,
            skillId,
            name: `${template.name} ${index + 1}`,
            subcategoryId: subcategory.id,
            icon: {
              kind: 'local',
              src: debugIconUrls[index % debugIconUrls.length] ?? debug02,
            },
            flags: {
              ...template.flags,
              passive: group === 'passive',
              usable: group !== 'other' || index % 2 === 0,
            },
          },
          runtime: {
            skillId,
            usable: group !== 'other' || index % 2 === 0,
            active: false,
            cooldown: null,
          },
        }
      },
    ),
  )
  const snapshot: GameSkillSnapshot = {
    revision: skillsStore.revision,
    subcategories,
    skills: records,
  }
  skillsStore.replaceSnapshot(snapshot)
}

function adjustStatusValue(control: DebugStatusControl, direction: 1 | -1): void {
  const resource = statusStore.snapshot[control.key]
  const current = Math.min(
    resource.maximum,
    Math.max(0, resource.current + control.step * direction),
  )
  statusStore.updatePrototypeState({ [control.key]: { ...resource, current } })
}
</script>

<template>
  <div class="ew-debug-window-content">
    <GTabs class="ew-debug-window-content__tabs" aria-label="Debug sections">
      <GTab :selected="activeTab === 'skills'" @click="activeTab = 'skills'"> Skills </GTab>
      <GTab :selected="activeTab === 'status'" @click="activeTab = 'status'"> Status </GTab>
      <GTab :selected="activeTab === 'windows'" @click="activeTab = 'windows'"> Windows </GTab>
      <GTab :selected="activeTab === 'buffs'" @click="activeTab = 'buffs'"> Buffs </GTab>
      <GTab :selected="activeTab === 'debuffs'" @click="activeTab = 'debuffs'"> Debuffs </GTab>
      <GTab :selected="activeTab === 'toggles'" @click="activeTab = 'toggles'"> Toggles </GTab>
      <GTab :selected="activeTab === 'party'" @click="activeTab = 'party'"> Party </GTab>
      <GTab :selected="activeTab === 'target-status'" @click="activeTab = 'target-status'">
        Target status
      </GTab>
      <GTab :selected="activeTab === 'player-cast'" @click="activeTab = 'player-cast'">
        Player cast
      </GTab>
    </GTabs>
    <section v-if="activeTab === 'skills'" class="ew-debug-window-content__panel" role="tabpanel">
      <button type="button" @click="addRandomSkill">Add random skill</button>
      <button type="button" :disabled="skillPositions.length === 0" @click="startRandomReuse">
        Start reuse
      </button>
      <button
        type="button"
        :aria-pressed="store.showDebugMetadata"
        @click="store.toggleDebugMetadata"
      >
        {{ store.showDebugMetadata ? 'Hide skill metadata' : 'Show skill metadata' }}
      </button>
      <button type="button" @click="populateSkillCatalog">Populate skill catalog</button>
    </section>
    <StatusEffectDebugPanel
      v-else-if="activeTab === 'buffs'"
      :api="buffDebugPanelApi"
      label="Buffs"
      singular="buff"
      id-prefix="debug-buff"
      :create-sample="createBuffPanelSample"
    />
    <section
      v-else-if="activeTab === 'debuffs' || activeTab === 'toggles'"
      class="ew-debug-window-content__panel"
      role="tabpanel"
    >
      <StatusEffectDebugPanel
        v-if="activeTab === 'debuffs'"
        :api="debuffDebugPanelApi"
        label="Debuffs"
        singular="debuff"
        id-prefix="debug-debuff"
        :create-sample="
          (id, endsAtMs, order) => createDebugPanelSample('debuff', id, endsAtMs, order)
        "
      />
      <StatusEffectDebugPanel
        v-else
        :api="toggleDebugPanelApi"
        label="Toggles"
        singular="toggle"
        id-prefix="debug-toggle"
        :create-sample="
          (id, endsAtMs, order) => createDebugPanelSample('toggle', id, endsAtMs, order)
        "
      />
    </section>
    <PartyDebugPanel v-else-if="activeTab === 'party'" />
    <TargetStatusDebugPanel v-else-if="activeTab === 'target-status'" />
    <PlayerCastDebugPanel v-else-if="activeTab === 'player-cast'" />
    <section
      v-else-if="activeTab === 'status'"
      class="ew-debug-window-content__panel"
      role="tabpanel"
    >
      <div class="ew-debug-status-controls" aria-label="Status controls">
        <div
          v-for="control in statusControls"
          :key="control.key"
          class="ew-debug-status-controls__row"
          :data-tone="control.tone"
        >
          <span class="ew-debug-status-controls__label">{{ control.label }}</span>
          <span class="ew-debug-status-controls__value">
            {{ statusStore.snapshot[control.key].current }} /
            {{ statusStore.snapshot[control.key].maximum }}
          </span>
          <button
            type="button"
            class="ew-debug-status-controls__button"
            :aria-label="`Increase ${control.label}`"
            @click="adjustStatusValue(control, 1)"
          >
            +
          </button>
          <button
            type="button"
            class="ew-debug-status-controls__button"
            :aria-label="`Decrease ${control.label}`"
            @click="adjustStatusValue(control, -1)"
          >
            -
          </button>
        </div>
      </div>
    </section>
    <section v-else class="ew-debug-window-content__panel" role="tabpanel">
      <button type="button" :aria-pressed="skillListOpen" @click="toggleWindow('skill-list')">
        <GText :content="gameText(skillListOpen ? '#SKILL_LIST_HIDE' : '#SKILL_LIST_SHOW')" />
      </button>
      <button type="button" :aria-pressed="settingsOpen" @click="toggleWindow('game-settings')">
        Settings
      </button>
      <a
        class="ew-button"
        href="#buff-list"
        role="button"
        :aria-pressed="buffListOpen"
        @click.prevent="buffApi.openWindow"
      >
        Buff List
      </a>
      <a
        class="ew-button"
        href="#debuff-list"
        role="button"
        :aria-pressed="debuffApi.isWindowOpen()"
        @click.prevent="debuffApi.openWindow"
        >Debuff List</a
      >
      <a
        class="ew-button"
        href="#toggle-list"
        role="button"
        :aria-pressed="toggleApi.isWindowOpen()"
        @click.prevent="toggleApi.openWindow"
        >Toggle List</a
      >
    </section>
  </div>
</template>
