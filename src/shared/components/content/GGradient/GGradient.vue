<script setup lang="ts">
import { computed } from 'vue'
import type { GradientVariant } from '@/shared/types/components'
import { resolveGradient } from '@/shared/utils/progress/resolveGradient'

const props = withDefaults(defineProps<{ variant?: GradientVariant }>(), { variant: 'bronze' })
const gradient = computed(() => resolveGradient(props.variant))
</script>
<template><span class="ew-gradient" :style="{ background: gradient }"><slot /></span></template>
