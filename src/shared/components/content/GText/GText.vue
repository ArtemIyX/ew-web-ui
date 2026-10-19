<script setup lang="ts">
import type { TextElement } from '@/shared/types/components'
import type { TextContent } from '@/shared/types/components'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ as?: TextElement; content?: TextContent }>()
const text = useLocalizedText(() => props.content)
</script>
<template>
  <component :is="as ?? 'span'" class="ew-text"><template v-if="content !== undefined">{{ text }}</template><slot v-else /></component>
</template>
