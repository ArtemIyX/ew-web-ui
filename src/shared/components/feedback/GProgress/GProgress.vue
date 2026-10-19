<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { useLocalizedText } from '@/shared/composables/localization/useLocalizedText'
import { useProgressChange } from '@/shared/composables/progress/useProgressChange'
import { useReducedMotion } from '@/shared/composables/accessibility/useReducedMotion'
import { normalizeProgress } from '@/shared/utils/progress/normalizeProgress'
import { resolveGradient } from '@/shared/utils/progress/resolveGradient'
import type { TextContent } from '@/shared/types/components'
import type {
  ProgressChangeAnimation,
  ProgressFill,
  ProgressFormatContext,
  ProgressMotionOptions,
  ProgressOrientation,
  ProgressShape,
  ProgressSize,
  ProgressSlotProps,
  ProgressStyleVariables,
  ProgressThreshold,
  ProgressTone,
  ProgressTextPlacement,
} from '@/shared/types/progress'

defineOptions({ inheritAttrs: false })

interface GProgressProps {
  value?: number
  percentage?: number
  min?: number
  max?: number
  indeterminate?: boolean
  tone?: ProgressTone
  fill?: ProgressFill
  thresholds?: readonly ProgressThreshold[]
  size?: ProgressSize
  orientation?: ProgressOrientation
  shape?: ProgressShape
  reverse?: boolean
  segments?: number
  label?: TextContent
  showLabel?: boolean
  showValue?: boolean
  showPercentage?: boolean
  textPlacement?: ProgressTextPlacement
  precision?: number
  formatValue?: (context: ProgressFormatContext) => string
  trackOpacity?: number
  fillOpacity?: number
  frameOpacity?: number
  deltaOpacity?: number
  animated?: boolean
  changeAnimation?: ProgressChangeAnimation
  motion?: ProgressMotionOptions
  ariaLabel?: string
  ariaValueText?: string
}

const props = withDefaults(defineProps<GProgressProps>(), {
  value: 0,
  min: 0,
  max: 100,
  indeterminate: false,
  tone: 'neutral',
  size: 'md',
  orientation: 'horizontal',
  shape: 'rounded',
  reverse: false,
  segments: 1,
  showLabel: false,
  showValue: false,
  showPercentage: false,
  textPlacement: 'inside',
  precision: 0,
  trackOpacity: 0.92,
  fillOpacity: 1,
  frameOpacity: 1,
  deltaOpacity: 0.88,
  animated: true,
  changeAnimation: 'both',
})
const attrs = useAttrs()
const reducedMotion = useReducedMotion()
const warnedProps = new Set<string>()
const warnInvalid = (name: string) => {
  if (import.meta.env.DEV && !warnedProps.has(name)) {
    warnedProps.add(name)
    console.warn(`[GProgress] Invalid ${name}; using a safe fallback.`)
  }
}
const normalized = computed(() => {
  if (props.indeterminate) return normalizeProgress(0, props.min, props.max)
  if (props.percentage !== undefined) {
    if (!Number.isFinite(props.percentage)) warnInvalid('percentage')
    else return normalizeProgress(Math.min(100, Math.max(0, props.percentage)), 0, 100)
  }
  if (!Number.isFinite(props.value)) warnInvalid('value')
  if (!Number.isFinite(props.min)) warnInvalid('min')
  if (!Number.isFinite(props.max)) warnInvalid('max')
  if (Number.isFinite(props.min) && Number.isFinite(props.max) && props.max <= props.min) {
    warnInvalid('range')
  }
  return normalizeProgress(props.value, props.min, props.max)
})
const ratio = computed(() => normalized.value.ratio)
const change = useProgressChange(
  ratio,
  computed(() => props.animated),
  computed(() => props.changeAnimation),
  computed(() => props.motion),
  reducedMotion,
)
const labelText = useLocalizedText(() => props.label)
const activeThreshold = computed(() => {
  const thresholds = [...(props.thresholds ?? [])]
    .filter((threshold) => Number.isFinite(threshold.atOrBelow))
    .sort((left, right) => left.atOrBelow - right.atOrBelow)
  return thresholds.find(
    (threshold) => ratio.value <= Math.min(1, Math.max(0, threshold.atOrBelow)),
  )
})
const activeTone = computed(() => activeThreshold.value?.tone ?? props.tone)
const activeFill = computed(() => activeThreshold.value?.fill ?? props.fill)
const resolveFillValue = (fill: ProgressFill | undefined) => {
  if (!fill || fill.kind === 'tone') return ''
  if (fill.kind === 'color' || fill.kind === 'css') return fill.value
  return resolveGradient(fill.variant, fill.angle)
}
const fillValue = computed(() => resolveFillValue(activeFill.value))
const increaseFillValue = computed(
  () => resolveFillValue(props.motion?.increaseFill) || 'var(--ew-color-success)',
)
const decreaseFillValue = computed(
  () => resolveFillValue(props.motion?.decreaseFill) || 'var(--ew-color-danger)',
)
const fillKind = computed(() => activeFill.value?.kind ?? 'tone')
const clampOpacity = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1))
const segmentCount = computed(() => Math.min(100, Math.max(1, Math.round(props.segments))))
const percentageText = computed(() =>
  normalized.value.percentage.toFixed(Math.max(0, Math.min(6, props.precision))),
)
const context = computed<ProgressFormatContext>(() => normalized.value)
const formattedValue = computed(
  () => props.formatValue?.(context.value) ?? String(normalized.value.value),
)
const slotProps = computed<ProgressSlotProps>(() => ({
  ...context.value,
  tone: activeTone.value,
  indeterminate: props.indeterminate,
  increasing: change.direction.value === 'increase',
  decreasing: change.direction.value === 'decrease',
}))
const defaultAriaValueText = computed(() => {
  if (props.indeterminate) return undefined
  if (props.showValue) return `${formattedValue.value} of ${normalized.value.max}`
  return `${percentageText.value}%`
})
const meterAttrs = computed(() => {
  const forwarded = { ...attrs }
  delete forwarded.class
  delete forwarded.style
  delete forwarded.role
  delete forwarded['aria-label']
  delete forwarded['aria-valuemin']
  delete forwarded['aria-valuemax']
  delete forwarded['aria-valuenow']
  delete forwarded['aria-valuetext']
  return forwarded
})
const styleVariables = computed<ProgressStyleVariables>(() => {
  const variables: ProgressStyleVariables = {
    '--ew-progress-ratio': props.indeterminate ? 0 : change.renderedRatio.value,
    '--ew-progress-delta-ratio': change.deltaRatio.value,
    '--ew-progress-track-opacity': clampOpacity(props.trackOpacity),
    '--ew-progress-fill-opacity': clampOpacity(props.fillOpacity),
    '--ew-progress-frame-opacity': clampOpacity(props.frameOpacity),
    '--ew-progress-delta-opacity': clampOpacity(props.deltaOpacity),
    '--ew-progress-custom-increase': increaseFillValue.value,
    '--ew-progress-custom-decrease': decreaseFillValue.value,
    '--ew-progress-segments': segmentCount.value,
    '--ew-progress-duration': `${Math.max(0, props.motion?.durationMs ?? 360)}ms`,
    '--ew-progress-easing': props.motion?.easing ?? 'ease-out',
  }
  if (fillValue.value) variables['--ew-progress-custom-fill'] = fillValue.value
  return variables
})
const directionClass = computed(() => `ew-progress--${change.direction.value}`)
const exposedPercentage = computed(() => normalized.value.percentage)
defineExpose({ ratio, percentage: exposedPercentage, direction: change.direction })
</script>

<template>
  <div
    class="ew-progress"
    :class="[
      directionClass,
      `ew-progress--${size}`,
      `ew-progress--${orientation}`,
      `ew-progress--${shape}`,
      { 'ew-progress--reverse': reverse },
    ]"
    :data-tone="activeTone"
    :data-shape="shape"
    :data-fill-kind="fillKind"
    :data-indeterminate="indeterminate || undefined"
    :data-segments="segmentCount"
    :style="styleVariables"
  >
    <div v-if="$slots.leading" class="ew-progress__leading">
      <slot name="leading" v-bind="slotProps" />
    </div>
    <div v-if="$slots.before || textPlacement === 'before'" class="ew-progress__before">
      <slot name="before" v-bind="slotProps"
        ><span v-if="showLabel && labelText" class="ew-progress__label"
          ><slot name="label" v-bind="slotProps">{{ labelText }}</slot></span
        ><span v-if="showValue" class="ew-progress__value"
          ><slot name="value" v-bind="slotProps">{{ formattedValue }}</slot></span
        ></slot
      >
    </div>
    <div
      class="ew-progress__meter"
      role="progressbar"
      :aria-label="ariaLabel"
      :aria-valuemin="indeterminate ? undefined : normalized.min"
      :aria-valuemax="indeterminate ? undefined : normalized.max"
      :aria-valuenow="indeterminate ? undefined : normalized.value"
      :aria-valuetext="ariaValueText ?? defaultAriaValueText"
      v-bind="meterAttrs"
    >
      <div class="ew-progress__track" aria-hidden="true"></div>
      <div
        v-if="!indeterminate && change.direction.value !== 'none'"
        class="ew-progress__delta"
        :class="`ew-progress__delta--${change.direction.value}`"
        aria-hidden="true"
      ></div>
      <div v-if="!indeterminate" class="ew-progress__fill" aria-hidden="true"></div>
      <div v-if="$slots.markers" class="ew-progress__markers" aria-hidden="true">
        <slot name="markers" v-bind="slotProps" />
      </div>
      <div
        v-if="$slots.overlay || showLabel || showValue || showPercentage"
        class="ew-progress__overlay"
      >
        <slot name="overlay" v-bind="slotProps"
          ><slot name="label" v-if="showLabel" v-bind="slotProps">{{ labelText }}</slot
          ><slot name="value" v-if="showValue" v-bind="slotProps">{{ formattedValue }}</slot
          ><span v-if="showPercentage" class="ew-progress__percentage"
            >{{ percentageText }}%</span
          ></slot
        >
      </div>
    </div>
    <div v-if="$slots.after || textPlacement === 'after'" class="ew-progress__after">
      <slot name="after" v-bind="slotProps"
        ><span v-if="showPercentage" class="ew-progress__percentage"
          >{{ percentageText }}%</span
        ></slot
      >
    </div>
    <div v-if="$slots.trailing" class="ew-progress__trailing">
      <slot name="trailing" v-bind="slotProps" />
    </div>
  </div>
</template>
