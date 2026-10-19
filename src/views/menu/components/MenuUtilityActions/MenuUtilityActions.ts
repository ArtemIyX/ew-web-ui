import { defineComponent } from 'vue'
import { menuKeys, menuText } from '@/localization/menuText'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useWindows } from '@/shared/composables/windows/useWindows'

export default defineComponent({
  setup() {
    const { openWindow } = useWindows()
    const settings = useLocalizedText(() => menuText(menuKeys.settings))
    const quit = useLocalizedText(() => menuText(menuKeys.quit))
    const utilities = useLocalizedText(() => menuText(menuKeys.menuUtilities))

    function openSettings(): void {
      openWindow('game-settings')
    }

    return { settings, quit, utilities, openSettings }
  },
})
