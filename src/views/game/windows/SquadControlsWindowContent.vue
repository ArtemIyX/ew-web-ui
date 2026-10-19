<script setup lang="ts">
import GButton from '@/shared/components/actions/GButton/GButton.vue'
import GText from '@/shared/components/content/GText/GText.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import type { TextContent } from '@/shared/types/components'

defineProps<{
  title?: TextContent
}>()

const actionDefinitions: ReadonlyArray<{
  id: 'kick-group' | 'check-readiness' | 'leave-squad' | 'dismiss-squad'
  label: TextContent
  variant: 'dark' | 'danger'
}> = [
  {
    id: 'kick-group',
    label: gameText(gameKeys.squadControlsKickGroup),
    variant: 'danger',
  },
  {
    id: 'check-readiness',
    label: gameText(gameKeys.squadControlsCheckReadiness),
    variant: 'dark',
  },
  {
    id: 'leave-squad',
    label: gameText(gameKeys.squadControlsLeave),
    variant: 'danger',
  },
  {
    id: 'dismiss-squad',
    label: gameText(gameKeys.squadControlsDismiss),
    variant: 'danger',
  },
]
</script>

<template>
  <div class="ew-compact-controls ew-squad-controls">
    <div class="ew-compact-controls__actions">
      <GButton
        v-for="definition in actionDefinitions"
        :key="definition.id"
        class="ew-compact-controls__action ew-button--sm"
        :variant="definition.variant"
        type="button"
      >
        <GText :content="definition.label" />
      </GButton>
    </div>
  </div>
</template>
