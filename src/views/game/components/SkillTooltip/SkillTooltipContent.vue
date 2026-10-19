<script setup lang="ts">
import { computed, inject } from 'vue'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import GText from '@/shared/components/content/GText/GText.vue'
import type { TextContent } from '@/shared/types/components'
import { formatSkillTooltipValue } from '../../utilities/skillTooltipModel'
import type { SkillTooltipModel, SkillTooltipValue } from '../../types/skills'
import { gameText, gameKeys } from '@/localization/gameText'
import { localizationKey } from '@/shared/providers/localization/localizationContext'

const props = withDefaults(
  defineProps<{
    model: SkillTooltipModel
    showDebugMetadata?: boolean
    density?: 'compact' | 'comfortable'
  }>(),
  { showDebugMetadata: false, density: 'compact' },
)
const visibleFacts = computed(() => props.model.facts?.filter((fact) => !fact.hidden) ?? [])
const hasDetails = computed(() => Boolean(props.model.description) || visibleFacts.value.length > 0)
const localization = inject(localizationKey)
const resolveText = (content: TextContent) =>
  typeof content === 'string' ? content : (content.fallback ?? content.textKey)
const formatValue = (value: SkillTooltipValue) =>
  formatSkillTooltipValue(value, {
    locale: localization?.culture.value ?? 'en-US',
    resolveText,
  })
</script>

<template>
  <article
    class="ew-skill-tooltip"
    :class="`ew-skill-tooltip--${density}`"
  >
    <header class="ew-skill-tooltip__identity">
      <GIcon
        v-if="model.icon"
        class="ew-skill-tooltip__icon"
        :source="model.icon"
        :label="model.name"
      />
      <div class="ew-skill-tooltip__identity-copy">
        <div class="ew-skill-tooltip__name"><GText :content="model.name" /></div>
        <div class="ew-skill-tooltip__metadata">
          <span v-if="model.level !== undefined"
            ><GText :content="gameText(gameKeys.skillLevel)" /> {{ model.level }}</span
          >
          <span v-if="model.type"
            ><GText :content="gameText(gameKeys.skillType)" />: <GText :content="model.type"
          /></span>
          <span v-if="showDebugMetadata"
            ><GText :content="gameText(gameKeys.skillId)" />: {{ model.skillId }}</span
          >
        </div>
      </div>
    </header>
    <section v-if="hasDetails" class="ew-skill-tooltip__details">
      <GText
        v-if="model.description"
        as="p"
        class="ew-skill-tooltip__description"
        :content="model.description"
      />
      <dl v-if="visibleFacts.length" class="ew-skill-tooltip__facts">
        <div
          v-for="fact in visibleFacts"
          :key="fact.key"
          class="ew-skill-tooltip__fact"
          :data-tone="fact.tone"
        >
          <dt><GText :content="fact.label" /></dt>
          <dd v-if="fact.value.kind === 'text'"><GText :content="fact.value.content" /></dd>
          <dd v-else-if="fact.value.kind === 'boolean'">
            <GText :content="fact.value.value ? fact.value.trueLabel : fact.value.falseLabel" />
          </dd>
          <dd v-else>{{ formatValue(fact.value) }}</dd>
        </div>
      </dl>
    </section>
    <section v-if="model.upgrades?.length" class="ew-skill-tooltip__upgrades">
      <ul>
        <li v-for="upgrade in model.upgrades" :key="upgrade.key" :data-tone="upgrade.tone">
          <svg
            class="ew-skill-tooltip__upgrade-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 1.5 9.8 6l4.7 1.2-4.7 1.3L8 13l-1.8-4.5-4.7-1.3L6.2 6 8 1.5Z" />
          </svg>
          <GText :content="upgrade.text" />
        </li>
      </ul>
    </section>
  </article>
</template>
