import {defineComponent} from 'vue'
import type {HeroSummary} from '@/services/menu/menuGateway'
import HeroListItem from '../HeroListItem/HeroListItem.vue'
import {menuKeys, menuText} from '@/localization/menuText'
import {useLocalizedText} from '@/shared/composables/localization/useLocalizedText'

export default defineComponent({
  components: {HeroListItem},
  props: {
    heroes: {type: Array as () => HeroSummary[], required: true},
    selectedHeroId: {type: String, required: false, default: null},
    nowMs: {type: Number, required: true},
    actionIds: {type: Object, required: true}
  },
  emits: ['select', 'destroy', 'cancel'],
  setup(_props, {emit}) {
    const empty = useLocalizedText(() =>
      menuText(menuKeys.noHeroes));
    return {empty, emit}
  }
})
