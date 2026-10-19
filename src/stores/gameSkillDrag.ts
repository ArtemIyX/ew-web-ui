import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useGameSkillsStore } from './gameSkills'
import { useGameShortcutsStore } from './gameShortcuts'
import { isShortcutPosition } from '@/views/game/types/shortcuts'
import { toShortcutSkill } from '@/views/game/types/gameSkills'

export type SkillDragSource =
  { kind: 'catalog'; skillId: string } | { kind: 'shortcut'; position: number }
export interface SkillDragPointer {
  x: number
  y: number
}
export const useGameSkillDragStore = defineStore('game-skill-drag', () => {
  const source = ref<SkillDragSource | null>(null)
  const dragging = ref(false)
  const pointer = ref<SkillDragPointer | null>(null)
  const skills = useGameSkillsStore()
  const shortcuts = useGameShortcutsStore()
  function begin(next: SkillDragSource): boolean {
    if (next.kind === 'catalog' && !skills.record(next.skillId)) return false
    if (
      next.kind === 'shortcut' &&
      (!isShortcutPosition(next.position) || !shortcuts.slot(next.position)?.entry)
    )
      return false
    source.value = next
    dragging.value = false
    pointer.value = null
    return true
  }
  function start(): boolean {
    if (!source.value) return false
    dragging.value = true
    return true
  }
  function updatePointer(x: number, y: number): void {
    if (!source.value) return
    pointer.value = { x, y }
  }
  function cancel(): void {
    source.value = null
    dragging.value = false
    pointer.value = null
  }
  function drop(position: number): boolean {
    if (!source.value || !isShortcutPosition(position) || shortcuts.lockedPositions.has(position))
      return false
    if (source.value.kind === 'catalog') {
      const record = skills.record(source.value.skillId)
      if (!record || !skills.bind(position, source.value.skillId)) return false
      shortcuts.assignSkill(position, toShortcutSkill(record))
      cancel()
      return true
    }
    const result = shortcuts.moveOrSwap(source.value.position, position, 'ui')
    if (result) {
      const sourceId = skills.bindings[source.value.position]
      const destinationId = skills.bindings[position]
      if (destinationId) skills.bind(source.value.position, destinationId)
      else skills.unbind(source.value.position)
      if (sourceId) skills.bind(position, sourceId)
      else skills.unbind(position)
      cancel()
    }
    return result
  }
  return { source, dragging, pointer, begin, start, updatePointer, cancel, drop }
})
