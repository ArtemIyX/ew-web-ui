import { computed, defineComponent, nextTick, ref } from 'vue'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { gameKeys, gameText } from '@/localization/gameText'
import {
  chatChannels,
  type ChatChannel,
  type ChatMessage,
  CHAT_HISTORY_LIMIT,
} from '../../types/chat'
import { useChatResize } from '../../composables/useChatResize'
import GText from '@/shared/components/content/GText/GText.vue'

export default defineComponent({
  components: { GText },
  setup() {
    const root = ref<HTMLElement | null>(null)
    const input = ref<HTMLInputElement | null>(null)
    const history = ref<HTMLElement | null>(null)
    const draft = ref('')
    const selectedChannel = ref<ChatChannel>('normal')
    const messages = ref<ChatMessage[]>([])
    const nextId = ref(1)
    const announcement = ref('')
    const {
      size,
      resizing,
      resizeHandleVisible,
      showResizeHandle,
      hideResizeHandle,
      start,
      keydown,
    } = useChatResize(root)
    const labels = computed(() =>
      chatChannels.map((channel) => ({ channel, content: gameText(gameKeys[channel]) })),
    )
    const chatLabel = useLocalizedText(() => gameText(gameKeys.chatLabel))
    const placeholder = useLocalizedText(() => gameText(gameKeys.placeholder))
    const resizeLabel = useLocalizedText(() => gameText(gameKeys.resize))
    const send = async (): Promise<void> => {
      const body = draft.value.trim()
      if (!body) {
        input.value?.focus()
        return
      }
      const message = {
        id: nextId.value++,
        channel: selectedChannel.value,
        body,
        createdAt: Date.now(),
      }
      const nearBottom = history.value
        ? history.value.scrollHeight - history.value.scrollTop - history.value.clientHeight < 48
        : true
      messages.value = [...messages.value, message].slice(-CHAT_HISTORY_LIMIT)
      draft.value = ''
      announcement.value = body
      await nextTick()
      if (nearBottom && history.value) history.value.scrollTop = history.value.scrollHeight
      input.value?.focus()
    }
    const selectChannel = (channel: ChatChannel): void => {
      selectedChannel.value = channel
    }
    const moveChannel = (event: KeyboardEvent, index: number): void => {
      const target =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? chatChannels.length - 1
            : event.key === 'ArrowRight'
              ? (index + 1) % chatChannels.length
              : event.key === 'ArrowLeft'
                ? (index - 1 + chatChannels.length) % chatChannels.length
                : -1
      if (target < 0) return
      event.preventDefault()
      selectChannel(chatChannels[target]!)
      ;(event.currentTarget as HTMLElement).parentElement?.children[target]?.dispatchEvent(
        new Event('focus'),
      )
    }
    return {
      root,
      input,
      history,
      draft,
      selectedChannel,
      messages,
      announcement,
      labels,
      chatLabel,
      placeholder,
      resizeLabel,
      size,
      resizing,
      resizeHandleVisible,
      showResizeHandle,
      hideResizeHandle,
      start,
      keydown,
      send,
      selectChannel,
      moveChannel,
      gameText,
      gameKeys,
    }
  },
})
