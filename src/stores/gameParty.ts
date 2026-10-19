import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  cloneGamePartySnapshot,
  validateGamePartySnapshot,
} from '@/services/game/party/gamePartyValidation'
import { getGamePartyGateway } from '@/services/game/party/gamePartyService'
import type {
  GamePartyRuntimeEvent,
  GamePartySnapshot,
  PartyMemberId,
  PartyMemberSnapshot,
} from '@/views/game/types/gameParty'

export type GamePartyStoreStatus = 'idle' | 'loading' | 'ready' | 'stale' | 'error'

export const useGamePartyStore = defineStore('game-party', () => {
  const status = ref<GamePartyStoreStatus>('idle')
  const revision = ref(0)
  const records = ref<Record<string, PartyMemberSnapshot>>({})
  const lastError = ref<string | null>(null)
  const lastUpdatedAtMs = ref<number | null>(null)
  let gateway: ReturnType<typeof getGamePartyGateway> | undefined
  let unsubscribe: (() => void) | undefined
  let initialization: Promise<void> | undefined
  let resync: Promise<void> | undefined
  let lifecycleToken = 0

  const members = computed(() =>
    Object.values(records.value)
      .map((member) => member)
      .sort((first, second) => first.order - second.order || first.memberId.localeCompare(second.memberId)),
  )
  const memberCount = computed(() => members.value.length)
  const hasDisplayableParty = computed(() => memberCount.value >= 2 && memberCount.value <= 5)
  const hasTimedEffects = computed(() =>
    members.value.some((member) =>
      [...member.buffs, ...member.debuffs].some((effect) => effect.endsAtMs !== null),
    ),
  )

  function commitSnapshot(snapshot: GamePartySnapshot): boolean {
    const result = validateGamePartySnapshot(snapshot)
    if (!result.ok) {
      lastError.value = result.issues[0]?.code ?? 'invalid-snapshot'
      return false
    }
    if (result.value.revision < revision.value) return false
    records.value = Object.fromEntries(result.value.members.map((member) => [member.memberId, member]))
    revision.value = result.value.revision
    status.value = 'ready'
    lastError.value = null
    lastUpdatedAtMs.value = Date.now()
    return true
  }

  async function load(activeGateway: ReturnType<typeof getGamePartyGateway>, token: number): Promise<boolean> {
    const snapshot = await activeGateway.load()
    if (token !== lifecycleToken || activeGateway !== gateway) return false
    if (!commitSnapshot(snapshot)) throw new Error(lastError.value ?? 'invalid-snapshot')
    return true
  }

  async function resyncFromGateway(): Promise<void> {
    if (!gateway || resync) return resync
    const activeGateway = gateway
    const token = lifecycleToken
    resync = load(activeGateway, token)
      .then(() => undefined)
      .catch((error: unknown) => {
        if (token !== lifecycleToken) return
        status.value = 'error'
        lastError.value = error instanceof Error ? error.message : 'load-failed'
      })
      .finally(() => {
        resync = undefined
      })
    return resync
  }

  function applyRuntimeEventFromSubscription(event: GamePartyRuntimeEvent): void {
    if (applyRuntimeEvent(event) === 'needs-resync') void resyncFromGateway()
  }

  async function initialize(options: { force?: boolean } = {}): Promise<void> {
    if (initialization && !options.force) return initialization
    if (status.value === 'ready' && !options.force) return
    if (options.force) {
      lifecycleToken += 1
      unsubscribe?.()
      unsubscribe = undefined
      gateway = undefined
    }
    const token = lifecycleToken
    const pending = (async () => {
      status.value = 'loading'
      const activeGateway = getGamePartyGateway()
      gateway = activeGateway
      try {
        if (await load(activeGateway, token)) unsubscribe = activeGateway.subscribe(applyRuntimeEventFromSubscription)
      } catch (error: unknown) {
        if (token !== lifecycleToken) return
        status.value = 'error'
        lastError.value = error instanceof Error ? error.message : 'load-failed'
      }
    })().finally(() => {
      if (initialization === pending) initialization = undefined
    })
    initialization = pending
    return pending
  }

  function replaceSnapshot(snapshot: GamePartySnapshot): boolean {
    return commitSnapshot(snapshot)
  }

  function applyRuntimeEvent(
    event: GamePartyRuntimeEvent,
  ): 'applied' | 'ignored' | 'needs-resync' {
    if (event.kind === 'snapshot') return replaceSnapshot(event.snapshot) ? 'applied' : 'ignored'
    if (event.revision <= revision.value) return 'ignored'
    if (event.revision !== revision.value + 1) {
      status.value = 'stale'
      lastError.value = 'revision-gap'
      return 'needs-resync'
    }
    if (event.kind === 'clear') records.value = {}
    else if (event.kind === 'remove-member') {
      const next = { ...records.value }
      delete next[event.memberId]
      records.value = next
    } else {
      const nextMembers = [
        ...Object.values(records.value).filter((member) => member.memberId !== event.member.memberId),
        event.member,
      ]
      const result = validateGamePartySnapshot({ revision: event.revision, members: nextMembers })
      if (!result.ok) {
        lastError.value = result.issues[0]?.code ?? 'invalid-snapshot'
        return 'ignored'
      }
      records.value = Object.fromEntries(
        result.value.members.map((member) => [member.memberId, member]),
      )
    }
    revision.value = event.revision
    status.value = 'ready'
    lastError.value = null
    lastUpdatedAtMs.value = Date.now()
    return 'applied'
  }

  function memberById(memberId: PartyMemberId): PartyMemberSnapshot | undefined {
    const member = records.value[memberId]
    return member ? cloneGamePartySnapshot({ revision: revision.value, members: [member] }).members[0] : undefined
  }

  function dispose(): void {
    lifecycleToken += 1
    unsubscribe?.()
    unsubscribe = undefined
    gateway = undefined
    initialization = undefined
    resync = undefined
  }

  async function refresh(): Promise<void> {
    await initialize({ force: true })
  }

  return {
    status,
    revision,
    lastError,
    lastUpdatedAtMs,
    members,
    memberCount,
    hasDisplayableParty,
    hasTimedEffects,
    initialize,
    refresh,
    dispose,
    replaceSnapshot,
    applyRuntimeEvent,
    memberById,
  }
})
