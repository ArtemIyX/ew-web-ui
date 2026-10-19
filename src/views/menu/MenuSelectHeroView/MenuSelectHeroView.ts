import { defineComponent, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import HeroList from '../components/HeroList/HeroList.vue'
import {menuKeys, menuText} from '@/localization/menuText'
import {useLocalizedText} from '@/shared/composables/localization/useLocalizedText'

export default defineComponent({
  components: { HeroList },
  setup() {
    const router = useRouter()
    const store = useMenuStore()
    const title = useLocalizedText(() => menuText(menuKeys.selectHeroTitle))
    const enter = useLocalizedText(() => menuText(menuKeys.enterWorld))
    const entering = useLocalizedText(() => menuText(menuKeys.enteringWorld))
    let controller: AbortController | undefined

    async function enterWorld() {
      controller = new AbortController()
      await store.enterWorld(controller.signal)
      if (store.enterWorldStatus === 'idle' && store.selectedHero) {
        await router.push({ name: 'game-hud' })
      }
    }

    onBeforeUnmount(() => controller?.abort())

    return { router, store, title, enter, entering, enterWorld }
  },
})
