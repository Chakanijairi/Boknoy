import { createDeliveryServicesSeed } from './deliveryServicesSeed.js'

export const DELIVERY_SERVICES_STORAGE_KEY = 'boknoy_admin_delivery_services'
const STORAGE_KEY = DELIVERY_SERVICES_STORAGE_KEY

export function loadDeliveryServices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return createDeliveryServicesSeed()
}

export function saveDeliveryServices(rows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  } catch {
    /* ignore */
  }
}
