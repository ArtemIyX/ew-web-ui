<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFocusTrap } from '@/shared/composables/accessibility/useFocusTrap'
const container = ref<HTMLElement | null>(null)
const { focusFirst } = useFocusTrap(container)
onMounted(() => focusFirst())
</script>
<template><div ref="container" class="ew-focus-trap"><slot /></div></template>
