<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import type { LocalizationLoader } from '@/shared/services/localization/localizationService'
import { localizationKey } from './localizationContext'
import { createLocalizationService } from '@/shared/services/localization/localizationService'

const props = withDefaults(defineProps<{ culture?: string; loader?: LocalizationLoader }>(), { culture: 'en' })
const culture = ref(props.culture)
const loader = props.loader ?? (async () => ({}))
watch(() => props.culture, (value) => { culture.value = value })
provide(localizationKey, { culture, loader, service: createLocalizationService(loader) })
</script>
<template><slot /></template>
