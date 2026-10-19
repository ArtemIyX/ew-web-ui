import {computed, defineComponent} from 'vue'
import type {HeroSummary} from '@/services/menu/menuGateway'
import HeroPortrait from '../HeroPortrait/HeroPortrait.vue'
import {menuKeys, menuText} from '@/localization/menuText'
import {useLocalizedText} from '@/shared/composables/localization/useLocalizedText'

export default defineComponent({
  components: {HeroPortrait},
  props: {
    hero: {type: Object as () => HeroSummary, required: true},
    selected: {type: Boolean, required: true},
    action: {type: String, required: false},
    nowMs: {type: Number, required: true}
  },
  emits: ['select', 'destroy', 'cancel'],
  setup(props, {emit}) {
    const remaining = computed(() => props.hero.deletionDeadlineMs === null ? null : Math.max(0, props.hero.deletionDeadlineMs - props.nowMs));
    const time = computed(() => {
      const seconds = Math.ceil((remaining.value ?? 0) / 1000);
      return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    });
    const destroy = useLocalizedText(() => menuText(menuKeys.destroy)),
      cancel = useLocalizedText(() => menuText(menuKeys.cancelDestruction)),
      deleting = useLocalizedText(() => menuText(menuKeys.heroPendingDeletion));
    return {remaining, time, destroy, cancel, deleting, emit}
  }
})
