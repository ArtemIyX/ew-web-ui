import {defineComponent, onBeforeUnmount, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {
  useCharacterCreationStore,
  CharacterCatalogueStatus,
  CharacterCreateStatus,
} from '@/stores/characterCreation'
import {menuKeys, menuText} from '@/localization/menuText'
import {
  useLocalizedText,
  useLocalizedTexts,
} from '@/shared/composables/localization/useLocalizedText'
import GIcon from '@/shared/components/content/GIcon/GIcon.vue'
import GTooltip from '@/shared/components/overlays/GTooltip/GTooltip.vue'

export default defineComponent({
  components: {GIcon, GTooltip},
  setup() {
    const router = useRouter(),
      store = useCharacterCreationStore()
    let controller: AbortController | undefined
    const title = useLocalizedText(() => menuText(menuKeys.createCharacterTitle)),
      raceLabel = useLocalizedText(() => menuText(menuKeys.racePickerLabel)),
      genderLabel = useLocalizedText(() => menuText(menuKeys.genderLabel)),
      classLabel = useLocalizedText(() => menuText(menuKeys.classPickerLabel)),
      nameLabel = useLocalizedText(() => menuText(menuKeys.charNameLabel)),
      placeholder = useLocalizedText(() => menuText(menuKeys.charName)),
      createLabel = useLocalizedText(() => menuText(menuKeys.create)),
      creating = useLocalizedText(() => menuText(menuKeys.creatingCharacter)),
      back = useLocalizedText(() => menuText(menuKeys.back)),
      noClasses = useLocalizedText(() => menuText(menuKeys.noClassesAvailable)),
      error = useLocalizedText(() => (store.errorKey ? menuText(store.errorKey as never) : undefined)),
      selectedRaceName = useLocalizedText(() => store.selectedRace?.name),
      selectedRaceDescription = useLocalizedText(() => store.selectedRace?.description),
      selectedClassName = useLocalizedText(() => store.selectedClass?.name),
      selectedClassDescription = useLocalizedText(() => store.selectedClass?.description)
    const raceNames = useLocalizedTexts(() => store.catalogue?.races.map((r) => r.name) ?? []),
      genderNames = useLocalizedTexts(() => store.catalogue?.genders.map((g) => g.label) ?? []),
      classNames = useLocalizedTexts(() => store.availableClasses.map((c) => c.name) ?? []),
      classDescriptions = useLocalizedTexts(() => store.availableClasses.map((c) => c.description) ?? [])

    function submit() {
      void store.create(controller?.signal).then((ok) => {
        if (ok) router.push({name: 'colors'})
      })
    }

    function backToHeroes() {
      if (store.createStatus !== CharacterCreateStatus.Creating)
        router.push({name: 'menu-select-hero'})
    }

    onMounted(() => {
      controller = new AbortController()
      void store.load(controller.signal)
    })
    onBeforeUnmount(() => controller?.abort())
    return {
      store,
      title,
      raceLabel,
      genderLabel,
      classLabel,
      nameLabel,
      placeholder,
      createLabel,
      creating,
      back,
      noClasses,
      error,
      raceNames,
      genderNames,
      classNames,
      classDescriptions,
      selectedRaceName,
      selectedRaceDescription,
      selectedClassName,
      selectedClassDescription,
      submit,
      backToHeroes,
      CharacterCatalogueStatus,
      CharacterCreateStatus
    }
  },
})
