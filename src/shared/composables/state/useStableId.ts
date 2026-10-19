import { getCurrentInstance } from 'vue'

let nextId = 0

export function useStableId(prefix = 'ew') {
  const instance = getCurrentInstance()
  const uid = instance?.uid ?? nextId++
  return `${prefix}-${uid}`
}
