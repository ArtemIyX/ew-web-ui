<script setup lang="ts">
import type { TextContent } from '@/shared/types/components'
import { useLocalizedTexts } from '@/shared/composables/localization/useLocalizedText'
const props = defineProps<{ items: ReadonlyArray<{ key: TextContent; value: TextContent }> }>()
const keys = useLocalizedTexts(() => props.items.map((item) => item.key))
const values = useLocalizedTexts(() => props.items.map((item) => item.value))
</script>
<template>
  <dl class="ew-key-value-list"><template v-for="(item, index) in props.items" :key="String(item.key)"><dt>{{ keys[index] }}</dt><dd>{{ values[index] }}</dd></template></dl>
</template>
