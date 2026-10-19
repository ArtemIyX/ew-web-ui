export type LocalizationParams = Readonly<Record<string, string | number | boolean>>

export interface LocalizedText {
  table: string
  textKey: string
  params?: LocalizationParams
  fallback?: string
}

export type TextContent = string | LocalizedText

export type IconSource =
  | { kind: 'local'; src: string }
  | { kind: 'server'; resourceId: string }

export interface SelectOption<TValue extends string | number = string> {
  value: TValue
  label: TextContent
  disabled?: boolean
  icon?: IconSource
  description?: TextContent
}

export type ComponentSize = 'sm' | 'md' | 'lg'
export type SemanticTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'right' | 'right-start' | 'right-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
export type Placement = TooltipPlacement
export type GradientVariant = 'bronze' | `gradient-${number}`
export type TextElement = 'span' | 'p' | 'strong' | 'em' | 'small' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'div'
