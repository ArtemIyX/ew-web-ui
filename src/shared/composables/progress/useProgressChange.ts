import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { ProgressChangeAnimation, ProgressMotionOptions } from '@/shared/types/progress'

export type ProgressDirection = 'increase' | 'decrease' | 'none'

export interface ProgressChangeState {
  renderedRatio: Readonly<Ref<number>>
  deltaRatio: Readonly<Ref<number>>
  direction: Readonly<Ref<ProgressDirection>>
  transitionKey: Readonly<Ref<number>>
}

export function useProgressChange(
  ratio: Ref<number>,
  animated: Ref<boolean>,
  changeAnimation: Ref<ProgressChangeAnimation>,
  motion: Ref<ProgressMotionOptions | undefined>,
  reducedMotion: Ref<boolean>,
): ProgressChangeState {
  const renderedRatio = ref(ratio.value)
  const deltaRatio = ref(ratio.value)
  const direction = ref<ProgressDirection>('none')
  const transitionKey = ref(0)
  let timeout: ReturnType<typeof setTimeout> | undefined
  let mounted = false

  const clearCompletion = () => {
    if (timeout !== undefined) {
      clearTimeout(timeout)
      timeout = undefined
    }
  }

  const finish = (nextRatio: number) => {
    deltaRatio.value = nextRatio
    direction.value = 'none'
    timeout = undefined
  }

  watch(ratio, (nextRatio, previousRatio) => {
    if (!mounted) {
      mounted = true
      renderedRatio.value = nextRatio
      deltaRatio.value = nextRatio
      return
    }

    clearCompletion()
    transitionKey.value += 1

    if (!animated.value || reducedMotion.value || nextRatio === previousRatio) {
      renderedRatio.value = nextRatio
      finish(nextRatio)
      return
    }

    const nextDirection: ProgressDirection = nextRatio > previousRatio ? 'increase' : 'decrease'
    const animation = changeAnimation.value
    const disabledDirection =
      nextDirection === 'increase' ? animation === 'decrease' : animation === 'increase'
    if (animation === 'none' || disabledDirection) {
      renderedRatio.value = nextRatio
      finish(nextRatio)
      return
    }

    direction.value = nextDirection
    deltaRatio.value = nextDirection === 'decrease' ? previousRatio : nextRatio
    renderedRatio.value = nextRatio
    const completionKey = transitionKey.value
    const durationMs = Math.max(0, motion.value?.durationMs ?? 360)
    const delayMs = Math.max(0, motion.value?.delayMs ?? 260)
    timeout = setTimeout(() => {
      if (transitionKey.value !== completionKey) return
      finish(nextRatio)
    }, durationMs + delayMs)
  })

  onMounted(() => {
    mounted = true
  })

  onBeforeUnmount(() => {
    clearCompletion()
  })

  return { renderedRatio, deltaRatio, direction, transitionKey }
}
