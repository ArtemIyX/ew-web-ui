import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useReducedMotion() {
  const reduced = ref(false)
  let media: MediaQueryList | undefined
  const update = () => {
    reduced.value = media?.matches ?? false
  }
  onMounted(() => {
    if (typeof window.matchMedia !== 'function') return
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    media.addEventListener('change', update)
  })
  onBeforeUnmount(() => media?.removeEventListener('change', update))
  return reduced
}
