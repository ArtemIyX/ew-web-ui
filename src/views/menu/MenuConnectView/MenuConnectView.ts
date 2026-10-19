import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import {useMenuStore} from '@/stores/menu'
import {MenuConnectionStatus} from '@/stores/menu'
import {menuKeys, menuText} from '@/localization/menuText'
import {useLocalizedText} from '@/shared/composables/localization/useLocalizedText'

export default defineComponent({
  setup() {
    const router = useRouter()
    const store = useMenuStore()
    const sessionId = ref('302')
    const login = ref('testLogin')
    const title = useLocalizedText(() => menuText(menuKeys.connectTitle))
    const sid = useLocalizedText(() => menuText(menuKeys.sessionId))
    const loginLabel = useLocalizedText(() => menuText(menuKeys.login))
    const connect = useLocalizedText(() => menuText(menuKeys.connect))
    const connecting = useLocalizedText(() => menuText(menuKeys.connecting))
    const error = useLocalizedText(() => menuText(menuKeys.connectFailed))

    async function submit() {
      await store.connect({ sessionId: sessionId.value, login: login.value })
      if (store.connectionStatus === MenuConnectionStatus.Ready) {
        await router.push({ name: 'menu-select-hero' })
      }
    }

    return {
      router,
      store,
      sessionId,
      login,
      title,
      sid,
      loginLabel,
      connect,
      connecting,
      error,
      submit,
      MenuConnectionStatus,
    }
  },
})
