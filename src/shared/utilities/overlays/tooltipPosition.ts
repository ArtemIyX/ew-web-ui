import type { TooltipPlacement } from '@/shared/types/components'

export interface Rect {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}
export interface TooltipPositionInput {
  anchor: Rect
  tooltip: Pick<Rect, 'width' | 'height'>
  viewport: Pick<Rect, 'width' | 'height'>
  preferredPlacement: TooltipPlacement
  fallbackPlacements: readonly TooltipPlacement[]
  offset: number
  viewportPadding: number
}
export interface TooltipPositionResult {
  x: number
  y: number
  placement: TooltipPlacement
  shifted: boolean
}

function candidate(input: TooltipPositionInput, placement: TooltipPlacement) {
  const [side, alignment = 'center'] = placement.split('-') as [string, string]
  const { anchor, tooltip, offset } = input
  let x = anchor.left + (anchor.width - tooltip.width) / 2
  let y = anchor.top - tooltip.height - offset
  if (side === 'bottom') y = anchor.bottom + offset
  if (side === 'left') {
    x = anchor.left - tooltip.width - offset
    y = anchor.top + (anchor.height - tooltip.height) / 2
  }
  if (side === 'right') {
    x = anchor.right + offset
    y = anchor.top + (anchor.height - tooltip.height) / 2
  }
  if (side === 'top' || side === 'bottom') {
    if (alignment === 'start') x = anchor.left
    if (alignment === 'end') x = anchor.right - tooltip.width
  } else {
    if (alignment === 'start') y = anchor.top
    if (alignment === 'end') y = anchor.bottom - tooltip.height
  }
  return { x, y }
}

function overflow(input: TooltipPositionInput, point: { x: number; y: number }) {
  const { tooltip, viewport, viewportPadding } = input
  return {
    left: Math.max(0, viewportPadding - point.x),
    right: Math.max(0, point.x + tooltip.width - viewport.width + viewportPadding),
    top: Math.max(0, viewportPadding - point.y),
    bottom: Math.max(0, point.y + tooltip.height - viewport.height + viewportPadding),
  }
}

export function computeTooltipPosition(input: TooltipPositionInput): TooltipPositionResult {
  const placements = [
    input.preferredPlacement,
    ...input.fallbackPlacements.filter((item) => item !== input.preferredPlacement),
  ]
  const candidates = placements.map((placement) => ({
    placement,
    point: candidate(input, placement),
  }))
  const fitting = candidates.find(({ point }) =>
    Object.values(overflow(input, point)).every((amount) => amount === 0),
  )
  const chosen =
    fitting ??
    candidates.reduce((best, current) => {
      const total = Object.values(overflow(input, current.point)).reduce(
        (sum, amount) => sum + amount,
        0,
      )
      const bestTotal = Object.values(overflow(input, best.point)).reduce(
        (sum, amount) => sum + amount,
        0,
      )
      return total < bestTotal ? current : best
    })
  const bounds = overflow(input, chosen.point)
  const shiftedX = chosen.point.x + bounds.left - bounds.right
  const shiftedY = chosen.point.y + bounds.top - bounds.bottom
  const x =
    input.tooltip.width + input.viewportPadding * 2 > input.viewport.width
      ? input.viewportPadding
      : shiftedX
  const y =
    input.tooltip.height + input.viewportPadding * 2 > input.viewport.height
      ? input.viewportPadding
      : shiftedY
  return {
    x,
    y,
    placement: chosen.placement,
    shifted: x !== chosen.point.x || y !== chosen.point.y,
  }
}
