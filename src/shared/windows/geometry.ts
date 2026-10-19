import type {
  WindowConstraints,
  WindowDefaultPosition,
  WindowPoint,
  WindowRect,
  WindowSize,
} from './types'

export const DEFAULT_CONSTRAINTS: WindowConstraints = {
  minWidth: 18 * 16,
  minHeight: 10 * 16,
  maxWidth: 96 * 16,
  maxHeight: 76 * 16,
}
export function normalizeConstraints(
  input: Partial<WindowConstraints> = {},
  viewport: WindowSize = { width: Infinity, height: Infinity },
): WindowConstraints {
  const minWidth = Math.max(1, finite(input.minWidth, DEFAULT_CONSTRAINTS.minWidth))
  const minHeight = Math.max(1, finite(input.minHeight, DEFAULT_CONSTRAINTS.minHeight))
  const maxWidth = Math.max(
    minWidth,
    Math.min(
      finite(input.maxWidth, DEFAULT_CONSTRAINTS.maxWidth),
      Math.max(minWidth, viewport.width),
    ),
  )
  const maxHeight = Math.max(
    minHeight,
    Math.min(
      finite(input.maxHeight, DEFAULT_CONSTRAINTS.maxHeight),
      Math.max(minHeight, viewport.height),
    ),
  )
  return { minWidth, minHeight, maxWidth, maxHeight }
}
function finite(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? (value as number) : fallback
}
export function clampRect(
  rect: WindowRect,
  viewport: WindowSize,
  constraints: Partial<WindowConstraints> = {},
): WindowRect {
  const c = normalizeConstraints(constraints, viewport)
  const width = Math.min(c.maxWidth, Math.max(c.minWidth, finite(rect.width, c.minWidth)))
  const height = Math.min(c.maxHeight, Math.max(c.minHeight, finite(rect.height, c.minHeight)))
  const x = Math.max(0, Math.min(Math.max(0, finite(viewport.width, 0) - width), finite(rect.x, 0)))
  const y = Math.max(
    0,
    Math.min(Math.max(0, finite(viewport.height, 0) - height), finite(rect.y, 0)),
  )
  return { x, y, width, height }
}
export function centerPosition(viewport: WindowSize, size: WindowSize): WindowPoint {
  return { x: (viewport.width - size.width) / 2, y: (viewport.height - size.height) / 2 }
}
export function moveRect(
  rect: WindowRect,
  point: WindowPoint,
  offset: WindowPoint,
  viewport: WindowSize,
  constraints?: Partial<WindowConstraints>,
): WindowRect {
  return clampRect({ ...rect, x: point.x - offset.x, y: point.y - offset.y }, viewport, constraints)
}
export function resizeRect(
  rect: WindowRect,
  delta: WindowPoint,
  viewport: WindowSize,
  constraints?: Partial<WindowConstraints>,
): WindowRect {
  return clampRect(
    { ...rect, width: rect.width + delta.x, height: rect.height + delta.y },
    viewport,
    constraints,
  )
}
export function resolveInitialRect(
  saved: WindowRect | undefined,
  viewport: WindowSize,
  size: WindowSize,
  position: WindowDefaultPosition = 'center',
  constraints?: Partial<WindowConstraints>,
): WindowRect {
  const point =
    position === 'center'
      ? centerPosition(viewport, size)
      : 'anchor' in position
        ? {
            x: (viewport.width - size.width) / 2,
            y: viewport.height - size.height - position.insetBlockEnd,
          }
        : position
  return clampRect(saved ?? { ...point, ...size }, viewport, constraints)
}

export function cascadePosition(
  viewport: WindowSize,
  size: WindowSize,
  index: number,
  step = 24,
): WindowPoint {
  const center = centerPosition(viewport, size)
  const offset = Math.max(0, index) * step
  return {
    x: Math.min(Math.max(0, viewport.width - size.width), Math.max(0, center.x + offset)),
    y: Math.min(Math.max(0, viewport.height - size.height), Math.max(0, center.y + offset)),
  }
}
