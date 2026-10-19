import {computed, inject, ref, watch, type MaybeRefOrGetter, type Ref, toValue} from 'vue'
import type {TextContent} from '@/shared/types/components'
import {localizationKey} from '@/shared/providers/localization/localizationContext'

export function useLocalizedText(content: MaybeRefOrGetter<TextContent | undefined>, empty = '') {
  const resolved = ref(empty)
  const context = inject(localizationKey)
  const service = context?.service
  let requestId = 0
  watch([() => toValue(content), () => context?.culture.value], async ([value]) => {
    const current = ++requestId
    if (!value || typeof value === 'string' || !service || !context) {
      resolved.value = !value ? empty : typeof value === 'string' ? value : value.textKey;
      return
    }
    resolved.value = value.textKey
    try {
      const result = await service.resolve(context.culture.value, value);
      if (current === requestId) resolved.value = result
    } catch { /* fallback remains visible */
    }
  }, {immediate: true})
  return computed(() => {
    const value = toValue(content)
    return typeof value === 'string' ? value : value ? resolved.value : empty
  })
}

export function useLocalizedTexts(
  content: MaybeRefOrGetter<ReadonlyArray<TextContent>>,
  _empty = '',
): Readonly<Ref<ReadonlyArray<string>>> {
  const resolved = ref<ReadonlyArray<string>>([])
  const context = inject(localizationKey)
  const service = context?.service
  let requestId = 0
  watch([() => toValue(content), () => context?.culture.value], async ([values]) => {
    const current = ++requestId
    resolved.value = values.map((value) => typeof value === 'string' ? value : value.textKey)
    if (!service || !context) return
    const result = await Promise.all(values.map(async (value) => typeof value === 'string' ? value : service.resolve(context.culture.value, value).catch(() => value.textKey)))
    if (current === requestId) resolved.value = result
  }, {immediate: true})
  return computed(() => resolved.value)
}
