import { usePartyPresentationStore } from '@/stores/partyPresentation'
import { useWindowManagerStore } from '@/stores/windowManager'
import { PARTY_CONTROLS_WINDOW_ID } from '@/views/game/types/partyControls'
import type { PartyControlActionIntent } from '@/views/game/types/partyControls'

export function usePartyControlActions() {
  const presentation = usePartyPresentationStore()
  const windowStore = useWindowManagerStore()

  function controlProps(): Record<string, unknown> {
    return {
      mode: presentation.mode,
      visible: presentation.visible,
      onAction: handleControlAction,
    }
  }

  function handleControlAction(intent: PartyControlActionIntent): void {
    if (intent.action === 'toggle-party-pin') presentation.toggleMode()
    if (intent.action === 'toggle-party-visibility') presentation.toggleVisible()
    windowStore.updateManagedWindowProps(PARTY_CONTROLS_WINDOW_ID, controlProps())
  }

  return { handleControlAction, controlProps }
}
