import { nextTick, onBeforeUnmount, type Ref } from 'vue'

export function useFocusTrap(container: Ref<HTMLElement | null>) {
  const focusables = () =>
    Array.from(
      container.value?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        !element.hasAttribute('inert') &&
        window.getComputedStyle(element).display !== 'none' &&
        window.getComputedStyle(element).visibility !== 'hidden',
    )
  const focusFirst = async () => {
    await nextTick()
    focusables()[0]?.focus()
  }
  const focusLast = async () => {
    await nextTick()
    const items = focusables()
    items[items.length - 1]?.focus()
  }
  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return
    const items = focusables()
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  const activate = () => container.value?.addEventListener('keydown', onKeydown)
  const deactivate = () => container.value?.removeEventListener('keydown', onKeydown)
  onBeforeUnmount(deactivate)
  return { focusFirst, focusLast, activate, deactivate }
}
