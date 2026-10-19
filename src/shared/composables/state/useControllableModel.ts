import { computed, type ComputedRef, type Ref, ref } from 'vue'

export function useControllableModel<T>(
  value: Ref<T | undefined>,
  defaultValue: T,
  update: (next: T) => void,
): { model: ComputedRef<T>; isControlled: ComputedRef<boolean> } {
  const internal = ref(defaultValue) as Ref<T>
  const isControlled = computed(() => value.value !== undefined)
  const model = computed<T>({
    get: () => (isControlled.value ? (value.value as T) : internal.value),
    set: (next) => {
      if (!isControlled.value) internal.value = next
      update(next)
    },
  })
  return { model, isControlled }
}
