import { describe, expect, it, vi } from 'vitest'
import { createDisconnectedMenuGateway } from '../disconnectedMenuGateway'

describe('disconnected menu gateway', () => {
  it('returns sample heroes only after its configured delay', async () => {
    vi.useFakeTimers(); const gateway = createDisconnectedMenuGateway(1500)
    const request = gateway.connect({ sessionId: '302', login: 'testLogin' }); let settled = false
    request.then(() => { settled = true }); await vi.advanceTimersByTimeAsync(1499); expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1); expect((await request).map(hero => hero.heroName)).toEqual(['Sample Hero 01','Sample Hero 02','Sample Hero 03']); vi.useRealTimers()
  })
  it('uses an absolute fifteen second debug deadline', async () => {
    vi.useFakeTimers(); const now = 1_000_000; const gateway = createDisconnectedMenuGateway(0, () => now)
    const request = gateway.startHeroDeletion('sample-01'); await vi.advanceTimersByTimeAsync(0)
    expect(await request).toBe(now + 15_000); vi.useRealTimers()
  })
})
