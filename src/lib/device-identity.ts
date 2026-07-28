import type { PersonName } from '../types'

const DEVICE_ID_KEY = 'expenses-device-id'

export type DeviceKind = 'iphone' | 'ipad' | 'mac' | 'android' | 'windows' | 'other'

/**
 * Shayan: iPhone / iPad / Mac (his iPhone 14 Pro + MacBook Pro).
 * Aryana: everything else.
 * Browsers do not expose exact models like "14 Pro" — only iPhone vs Mac vs other.
 */
export function detectDeviceKind(): DeviceKind {
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iphone'
  if (/iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ipad'
  }
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  if (/Android/i.test(ua)) return 'android'
  if (/Windows/i.test(ua)) return 'windows'
  return 'other'
}

export function personFromDevice(kind: DeviceKind = detectDeviceKind()): PersonName {
  if (kind === 'iphone' || kind === 'ipad' || kind === 'mac') return 'shayan'
  return 'aryana'
}

export function deviceLabel(kind: DeviceKind = detectDeviceKind()): string {
  switch (kind) {
    case 'iphone':
      return 'iPhone'
    case 'ipad':
      return 'iPad'
    case 'mac':
      return 'Mac'
    case 'android':
      return 'Android'
    case 'windows':
      return 'Windows'
    default:
      return 'Device'
  }
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    return `dev-session-${Date.now()}`
  }
}

export function getLocalPresenceMeta() {
  const kind = detectDeviceKind()
  return {
    person: personFromDevice(kind),
    deviceId: getOrCreateDeviceId(),
    deviceLabel: deviceLabel(kind),
    kind,
  }
}
