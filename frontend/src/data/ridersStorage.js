import { createSeedState } from './ridersSeed.js'

const STORAGE_KEY = 'boknoy_admin_riders_state'

export function loadRidersState() {
  const seed = createSeedState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.riders)) {
        return {
          riders: parsed.riders,
          orders: Array.isArray(parsed.orders) ? parsed.orders : seed.orders,
        }
      }
    }
  } catch {
    /* ignore */
  }
  return seed
}

export function saveRidersState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}
