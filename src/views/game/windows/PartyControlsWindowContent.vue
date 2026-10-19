<script setup lang="ts">
import GButton from '@/shared/components/actions/GButton/GButton.vue'
import GText from '@/shared/components/content/GText/GText.vue'
import { gameKeys, gameText } from '@/localization/gameText'
import type { TextContent } from '@/shared/types/components'
import type {
  PartyControlActionId,
  PartyControlActionIntent,
} from '@/views/game/types/partyControls'

defineProps<{
  title?: TextContent
  mode?: 'pinned' | 'unpinned'
  visible?: boolean
}>()

const emit = defineEmits<{
  action: [intent: PartyControlActionIntent]
}>()

const actionDefinitions: ReadonlyArray<{
  id: PartyControlActionId
  label: TextContent
  variant: 'dark' | 'danger'
}> = [
  {
    id: 'leave-party',
    label: gameText(gameKeys.partyControlsLeave),
    variant: 'danger',
  },
  {
    id: 'toggle-party-pin',
    label: gameText(gameKeys.partyControlsTogglePin),
    variant: 'dark',
  },
  {
    id: 'toggle-party-visibility',
    label: gameText(gameKeys.partyControlsToggleVisibility),
    variant: 'dark',
  },
  {
    id: 'change-party-drop',
    label: gameText(gameKeys.partyControlsChangeDrop),
    variant: 'dark',
  },
  {
    id: 'check-party-readiness',
    label: gameText(gameKeys.partyControlsCheckReadiness),
    variant: 'dark',
  },
]

function emitAction(action: PartyControlActionId): void {
  emit('action', {
    action,
    source: 'party-controls-window',
  })
}
</script>

<template>
  <div class="ew-compact-controls ew-party-controls">
    <div class="ew-compact-controls__actions">
      <GButton
        v-for="definition in actionDefinitions"
        :key="definition.id"
        class="ew-compact-controls__action ew-party-controls__action ew-button--sm"
        :variant="definition.variant"
        type="button"
        :aria-pressed="definition.id === 'toggle-party-pin' ? mode === 'pinned' : definition.id === 'toggle-party-visibility' ? visible : undefined"
        @click="emitAction(definition.id)"
      >
        <GText :content="definition.label" />
      </GButton>
    </div>
  </div>
</template>
