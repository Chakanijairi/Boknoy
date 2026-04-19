import { createCustomersSeedState } from './customersSeed.js'

export const CUSTOMERS_STATE_STORAGE_KEY = 'boknoy_admin_customers_state'
const STORAGE_KEY = CUSTOMERS_STATE_STORAGE_KEY

export function loadCustomersState() {
  const seed = createCustomersSeedState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.customers)) {
        return {
          customers: parsed.customers,
          customerOrders: Array.isArray(parsed.customerOrders)
            ? parsed.customerOrders
            : seed.customerOrders,
        }
      }
    }
  } catch {
    /* ignore */
  }
  return seed
}

export function saveCustomersState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function adminCustomerEmailExists(email) {
  if (email == null || typeof email !== 'string') return false
  const e = email.trim().toLowerCase()
  const { customers } = loadCustomersState()
  return customers.some((c) => (c.email ?? '').trim().toLowerCase() === e)
}

export function addCustomerFromRegistration(entry) {
  if (!entry?.id || !entry?.name?.trim()) {
    return { ok: false, error: 'Invalid customer entry.' }
  }
  const state = loadCustomersState()
  if (state.customers.some((c) => c.id === entry.id)) {
    return { ok: false, error: 'Customer id already exists.' }
  }
  const e = (entry.email ?? '').trim().toLowerCase()
  if (state.customers.some((c) => (c.email ?? '').trim().toLowerCase() === e)) {
    return { ok: false, error: 'This email is already in the customer list.' }
  }
  state.customers.push({
    id: entry.id,
    name: entry.name,
    phone: entry.phone,
    email: entry.email,
    sex: entry.sex,
    birthdate: entry.birthdate,
    address: entry.address,
    status: entry.status ?? 'Active',
  })
  saveCustomersState(state)
  return { ok: true }
}
