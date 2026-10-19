import { defineComponent, ref } from 'vue'
import type { GradientVariant } from '@/shared/types/components'
import type { ProgressChangeAnimation, ProgressFill, ProgressTone } from '@/shared/types/progress'
import {
  GAlert,
  GBadge,
  GButton,
  GButtonGroup,
  GChip,
  GCard,
  GCheckbox,
  GDivider,
  GEmptyState,
  GErrorState,
  GField,
  GFormError,
  GFormHint,
  GGradient,
  GIcon,
  GInset,
  GInput,
  GLabel,
  GModal,
  GNumberInput,
  GPanel,
  GPopover,
  GProgress,
  GRadio,
  GRadioGroup,
  GSelect,
  GSlider,
  GSpinner,
  GStatus,
  GSwitch,
  GText,
  GTextArea,
  GWindow,
  GTooltip,
} from '@/shared/components'
import GTabs from '@/shared/components/navigation/GTabs/GTabs.vue'
import GTab from '@/shared/components/navigation/GTab/GTab.vue'
import WindowPlacementPreview from './WindowPlacementPreview.vue'
import type {
  WindowHeaderPlacement,
  WindowHeaderSize,
  WindowSurface,
  WindowTitleSize,
} from '@/shared/windows/types'

const gradientVariant = ref<GradientVariant>('gradient-03')
const showWindowSample = ref(false)
const showClassicWindowSample = ref(false)
const windowHeaderPlacement = ref<WindowHeaderPlacement>('top')
const windowHeaderPlacements: WindowHeaderPlacement[] = ['top', 'right', 'bottom', 'left']
const windowTitleSize = ref<WindowTitleSize>('md')
const windowHeaderSize = ref<WindowHeaderSize>('md')
const windowSurface = ref<WindowSurface>('default')
const windowHeaderSurface = ref<WindowSurface>('default')
const windowOpacity = ref(1)
const windowTitleSizes: WindowTitleSize[] = ['sm', 'md', 'lg']
const windowHeaderSizes: WindowHeaderSize[] = ['sm', 'md', 'lg']
const windowSurfaces: WindowSurface[] = ['default', 'void', 'iron', 'stone', 'bronze', 'transparent']
const debugPercentage = ref(62)
const debugDuration = ref(360)
const debugAnimation = ref<ProgressChangeAnimation>('both')
const debugTone = ref<ProgressTone>('hp')
const debugFill = ref<ProgressFill>({ kind: 'tone' })
const gradientVariants = Array.from(
  { length: 50 },
  (_, index) => `gradient-${String(index + 1).padStart(2, '0')}` as GradientVariant,
)

const colors = [
  ['Void', '--ew-color-void'],
  ['Iron 950', '--ew-color-iron-950'],
  ['Iron 800', '--ew-color-iron-800'],
  ['Bronze', '--ew-color-bronze-500'],
  ['Accent', '--ew-color-bronze-300'],
  ['Info', '--ew-color-sapphire-400'],
  ['Success', '--ew-color-emerald-500'],
  ['Danger', '--ew-color-oxblood-500'],
]
const progressTones: ProgressTone[] = ['neutral', 'hp', 'mp', 'energy', 'shield', 'cp', 'xp']
const progressSizes = ['xs', 'sm', 'md', 'lg'] as const
const progressAnimations: ProgressChangeAnimation[] = ['none', 'increase', 'decrease', 'both']
export default defineComponent({
  components: {
    GTab,
    GTabs,
    GCard,
    GGradient,
    GInset,
    GText,
    GDivider,
    GButtonGroup,
    GChip,
    GInput,
    GField,
    GTextArea,
    GFormError,
    GCheckbox,
    GSwitch,
    GSelect,
    GNumberInput,
    GSlider,
    GRadioGroup,
    GRadio,
    GAlert,
    GSpinner,
    GEmptyState,
    GErrorState,
    GTooltip,
    GPopover,
    GModal,
    GIcon,
    GStatus,
    GPanel,
    GBadge,
    GButton,
    GProgress,
    GFormHint,
    GLabel,
    GWindow,
    WindowPlacementPreview,
  },
  setup() {
    return {
      gradientVariant,
      gradientVariants,
      colors,
      showWindowSample,
      showClassicWindowSample,
      windowHeaderPlacement,
      windowHeaderPlacements,
      windowTitleSize,
      windowHeaderSize,
      windowSurface,
      windowHeaderSurface,
      windowOpacity,
      windowTitleSizes,
      windowHeaderSizes,
      windowSurfaces,
      debugPercentage,
      debugDuration,
      debugAnimation,
      debugTone,
      debugFill,
      progressTones,
      progressSizes,
      progressAnimations,
    }
  },
})
