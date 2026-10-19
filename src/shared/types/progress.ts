import type { CSSProperties } from 'vue'
import type { GradientVariant } from '@/shared/types/components'

export type ProgressTone = 'neutral' | 'hp' | 'mp' | 'energy' | 'shield' | 'cp' | 'xp' | 'cast'

export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg'
export type ProgressOrientation = 'horizontal' | 'vertical'
export type ProgressShape = 'rounded' | 'square' | 'angled' | 'notched'
export type ProgressTextPlacement = 'inside' | 'before' | 'after'
export type ProgressChangeAnimation = 'none' | 'decrease' | 'increase' | 'both'

export type ProgressFill =
  | { kind: 'tone' }
  | { kind: 'color'; value: string }
  | { kind: 'gradient'; variant: GradientVariant; angle?: string }
  | { kind: 'css'; value: string }

export interface ProgressThreshold {
  atOrBelow: number
  tone?: ProgressTone
  fill?: ProgressFill
}

export interface ProgressMotionOptions {
  durationMs?: number
  delayMs?: number
  easing?: string
  increaseFill?: ProgressFill
  decreaseFill?: ProgressFill
}

export interface ProgressFormatContext {
  value: number
  min: number
  max: number
  ratio: number
  percentage: number
}

export interface ProgressSlotProps extends ProgressFormatContext {
  tone: ProgressTone
  indeterminate: boolean
  increasing: boolean
  decreasing: boolean
}

export interface ProgressStyleVariables extends CSSProperties {
  '--ew-progress-ratio'?: number | string
  '--ew-progress-delta-ratio'?: number | string
  '--ew-progress-track-opacity'?: number
  '--ew-progress-fill-opacity'?: number
  '--ew-progress-frame-opacity'?: number
  '--ew-progress-delta-opacity'?: number
  '--ew-progress-custom-fill'?: string
  '--ew-progress-custom-increase'?: string
  '--ew-progress-custom-decrease'?: string
  '--ew-progress-segments'?: number
  '--ew-progress-duration'?: string
  '--ew-progress-easing'?: string
}
