import type { App } from 'vue'
import type { WindowDefinition } from '@/shared/windows/types'
export const WINDOW_DEFINITIONS = Symbol('ew-window-definitions')
export function provideWindowDefinitions(app: App, definitions: readonly WindowDefinition[]): void {
  app.provide(WINDOW_DEFINITIONS, definitions)
}

export function validateWindowDefinitions(
  definitions: readonly WindowDefinition[],
): readonly WindowDefinition[] {
  const seen = new Set<string>()
  return definitions.filter((definition) => {
    const valid =
      definition.id.length > 0 &&
      /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i.test(definition.id) &&
      !seen.has(definition.id)
    if (!valid && import.meta.env?.DEV)
      console.warn(`[GWindow] Ignoring invalid or duplicate window ID: ${definition.id}`)
    seen.add(definition.id)
    return valid
  })
}
