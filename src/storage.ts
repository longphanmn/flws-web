export type StorageKind = 'localStorage' | 'sessionStorage'

export function storageGet(kind: StorageKind, key: string): string | null {
  try {
    return window[kind].getItem(key)
  } catch {
    return null
  }
}

export function storageSet(kind: StorageKind, key: string, value: string): boolean {
  try {
    window[kind].setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function storageRemove(kind: StorageKind, key: string): void {
  try {
    window[kind].removeItem(key)
  } catch {}
}

const LEGACY_SECRET_KEYS = ['flatworld-god-key', 'flatland_ai_key'] as const

export function migrateLegacySecrets(): void {
  for (const key of LEGACY_SECRET_KEYS) {
    try {
      const legacyValue = storageGet('localStorage', key)
      if (legacyValue !== null && storageGet('sessionStorage', key) === null) {
        storageSet('sessionStorage', key, legacyValue)
      }
      storageRemove('localStorage', key)
    } catch {}
  }
}
