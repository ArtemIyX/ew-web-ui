<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useFocusTrap } from '@/shared/composables/accessibility/useFocusTrap'
import { useStableId } from '@/shared/composables/state/useStableId'
import type { TextContent } from '@/shared/types/components'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
const props = withDefaults(defineProps<{ open?: boolean; title?: TextContent; closeOnBackdrop?: boolean; closeLabel?: TextContent }>(), { open: false, closeOnBackdrop: true, closeLabel: () => ({ table: 'Common', textKey: '#CLOSE' }) })
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const dialog = ref<HTMLElement | null>(null)
const titleId = useStableId('ew-modal-title')
const previous = ref<HTMLElement | null>(null)
const { focusFirst, activate, deactivate } = useFocusTrap(dialog)
const titleText = useLocalizedText(() => props.title)
const closeText = useLocalizedText(() => props.closeLabel)
function close() { emit('update:open', false) }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') close() }
function setBackgroundLocked(locked: boolean) {
  document.body.classList.toggle('ew-modal-open', locked)
  const appShell = document.querySelector<HTMLElement>('.ew-app-shell')
  if (locked) appShell?.setAttribute('inert', '')
  else appShell?.removeAttribute('inert')
}
watch(() => props.open, async (open) => {
  if (open) {
    previous.value = document.activeElement as HTMLElement
    setBackgroundLocked(true)
    await nextTick(); activate(); focusFirst(); dialog.value?.addEventListener('keydown', onKeydown)
  } else {
    deactivate(); dialog.value?.removeEventListener('keydown', onKeydown); setBackgroundLocked(false)
    previous.value?.focus(); previous.value = null
  }
}, { immediate: true })
onBeforeUnmount(() => { deactivate(); setBackgroundLocked(false); previous.value?.focus() })
</script>
<template><Teleport to="body"><div v-if="open" class="ew-backdrop" @mousedown.self="closeOnBackdrop && close()"><section ref="dialog" class="ew-dialog" role="dialog" aria-modal="true" :aria-labelledby="title ? titleId : undefined"><h2 v-if="title" :id="titleId">{{ titleText }}</h2><button class="ew-button" type="button" :aria-label="closeText" @click="close">{{ closeText }}</button><slot /></section></div></Teleport></template>
