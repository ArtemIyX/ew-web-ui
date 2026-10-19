import {defineComponent} from 'vue'
import GImage from '@/shared/components/content/GImage/GImage.vue'
import type {HeroSummary} from '@/services/menu/menuGateway'
import {menuKeys, menuText} from '@/localization/menuText'

export default defineComponent({
  components: {GImage},
  props: {hero: {type: Object as () => HeroSummary, required: true}},
  setup() {
    return {menuKeys, menuText}
  }
})
