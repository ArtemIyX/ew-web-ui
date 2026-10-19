import type { Component, AsyncComponentLoader } from 'vue'
import type { TextContent } from '@/shared/types/components'

export type WindowHeaderPlacement = 'top' | 'right' | 'bottom' | 'left'
export type WindowResizeMode = 'none' | 'corner'
export type WindowTitleSize = 'sm' | 'md' | 'lg'
export type WindowHeaderSize = 'sm' | 'md' | 'lg'
export type WindowSurface = 'default' | 'void' | 'iron' | 'stone' | 'bronze' | 'transparent'
export type WindowDragRegion = 'header' | 'surface' | 'handle' | 'none'
export type WindowChrome = 'default' | 'none'

export interface WindowPoint {
  x: number
  y: number
}
export interface WindowAnchoredPosition {
  anchor: 'bottom-center'
  insetBlockEnd: number
}
export type WindowDefaultPosition = 'center' | WindowPoint | WindowAnchoredPosition
export interface WindowSize {
  width: number
  height: number
}
export interface WindowRect extends WindowPoint, WindowSize {}
export interface WindowConstraints {
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
}
export interface WindowDefinition {
  id: string
  component: Component | AsyncComponentLoader
  title?: TextContent
  ariaLabel?: TextContent
  closeLabel?: TextContent
  resizeLabel?: TextContent
  headerPlacement?: WindowHeaderPlacement
  titleSize?: WindowTitleSize
  headerSize?: WindowHeaderSize
  headerVisible?: boolean
  movable?: boolean
  dragRegion?: WindowDragRegion
  chrome?: WindowChrome
  surface?: WindowSurface
  headerSurface?: WindowSurface
  opacity?: number
  closable?: boolean
  resizable?: boolean
  resizeMode?: WindowResizeMode
  closeOnEscape?: boolean
  persistent?: boolean
  resetSizeOnOpen?: boolean
  bodyFlush?: boolean
  fitContentHeight?: boolean
  fitContentWidth?: boolean
  autoFocus?: boolean
  defaultSize?: WindowSize
  constraints?: Partial<WindowConstraints>
  defaultPosition?: WindowDefaultPosition
}
