<script setup lang="ts">
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import GTooltip from '@/shared/components/overlays/GTooltip/GTooltip.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import type { TargetAffiliation } from '@/views/game/types/gameTargetStatus'

const props = defineProps<{ kind: 'guild' | 'order'; affiliation: TargetAffiliation }>()
const affiliationName = useLocalizedText(() => props.affiliation.name)
const label = useLocalizedText(() => gameText(props.kind === 'guild' ? gameKeys.targetGuild : gameKeys.targetOrder, { name: affiliationName.value }))
</script>

<template>
  <GTooltip>
    <template #trigger="{ triggerProps }">
      <span
        v-bind="triggerProps"
        class="ew-target-affiliation-badge"
        :data-affiliation-kind="kind"
        data-ew-window-no-drag
        :aria-label="label"
      >
        <GIcon :source="affiliation.icon" :label="label" />
      </span>
    </template>
    {{ label }}
  </GTooltip>
</template>
