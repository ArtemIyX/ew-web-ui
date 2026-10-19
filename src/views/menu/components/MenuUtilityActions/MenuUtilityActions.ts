import {defineComponent} from 'vue'
import {menuKeys, menuText} from '@/localization/menuText'
import {useLocalizedText} from '@/shared/composables/localization/useLocalizedText'

export default defineComponent({
  setup() {
    const settings = useLocalizedText(() => menuText(menuKeys.settings)),
      quit = useLocalizedText(() => menuText(menuKeys.quit)),
      utilities = useLocalizedText(() => menuText(menuKeys.menuUtilities));
    return {settings, quit, utilities}
  }
})
