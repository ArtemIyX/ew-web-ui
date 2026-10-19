import { inject, ref, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { IconSource } from '@/shared/types/components'
import { iconKey } from '@/shared/providers/icons/iconContext'

export function useIconSource(source: MaybeRefOrGetter<IconSource | undefined>) {
  const url = ref<string>()
  const context = inject(iconKey, { resolve: async (value: IconSource) => value.kind === 'local' ? value.src : undefined })
  let requestId = 0
  watch(() => toValue(source), async (value) => {
    const current = ++requestId
    const resolved = value ? await context.resolve(value) : undefined
    if (current === requestId) url.value = resolved
  }, { immediate: true })
  return url
}
