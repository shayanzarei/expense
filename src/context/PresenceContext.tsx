import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getLocalPresenceMeta } from '../lib/device-identity'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { PERSON_LABELS, type PersonName } from '../types'

type PresenceMeta = {
  person: PersonName
  deviceId: string
  deviceLabel: string
}

type PresenceContextValue = {
  localPerson: PersonName
  localDeviceLabel: string
  online: Record<PersonName, boolean>
  onlineDevices: PresenceMeta[]
  statusText: string
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

const CHANNEL = 'expenses-presence'

export function PresenceProvider({ children }: { children: ReactNode }) {
  const local = useMemo(() => getLocalPresenceMeta(), [])
  const [onlineDevices, setOnlineDevices] = useState<PresenceMeta[]>([])

  useEffect(() => {
    if (!supabaseConfigured) return

    const channel = supabase.channel(CHANNEL, {
      config: { presence: { key: local.deviceId } },
    })

    const sync = () => {
      const state = channel.presenceState<PresenceMeta>()
      const devices: PresenceMeta[] = []
      for (const rows of Object.values(state)) {
        for (const row of rows) {
          if (row?.person && row?.deviceId) devices.push(row)
        }
      }
      // Dedupe by deviceId
      const byId = new Map(devices.map((d) => [d.deviceId, d]))
      setOnlineDevices([...byId.values()])
    }

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            person: local.person,
            deviceId: local.deviceId,
            deviceLabel: local.deviceLabel,
          } satisfies PresenceMeta)
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [local.deviceId, local.deviceLabel, local.person])

  const online = useMemo(
    () => ({
      aryana: onlineDevices.some((d) => d.person === 'aryana'),
      shayan: onlineDevices.some((d) => d.person === 'shayan'),
    }),
    [onlineDevices],
  )

  const statusText = useMemo(() => {
    const names = (['aryana', 'shayan'] as PersonName[])
      .filter((p) => online[p])
      .map((p) => PERSON_LABELS[p])
    if (names.length === 0) return `You · ${local.deviceLabel} (${PERSON_LABELS[local.person]})`
    if (names.length === 2) return 'Both online'
    return `${names[0]} online`
  }, [local.deviceLabel, local.person, online])

  const value: PresenceContextValue = {
    localPerson: local.person,
    localDeviceLabel: local.deviceLabel,
    online,
    onlineDevices,
    statusText,
  }

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  )
}

export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext)
  if (!ctx) {
    throw new Error('usePresence must be used within PresenceProvider')
  }
  return ctx
}
