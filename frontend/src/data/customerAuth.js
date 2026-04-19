import { apiJson } from '../api/client.js'

const SESSION_KEY = 'shaws_customer_session'

export function getCustomerSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (s?.id && s?.email) return s
  } catch {
    /* ignore */
  }
  return null
}

export function setCustomerSession(user) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
    )
  } catch {
    /* ignore */
  }
}

export function clearCustomerSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export async function registerCustomer({
  name,
  email,
  password,
  phone,
  sex,
  birthdate,
  address,
}) {
  const r = await apiJson('/api/customers/register', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      sex,
      birthdate,
      address: address.trim(),
    }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, user: r.user }
}

export async function loginCustomer(email, password) {
  const r = await apiJson('/api/customers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, user: r.user }
}

export async function fetchCustomerRecord(customerId) {
  const r = await apiJson(`/api/customers/${customerId}`)
  if (!r.ok) return null
  return r.customer
}

export async function updateCustomerProfile(customerId, { name, phone, addresses }) {
  const r = await apiJson(`/api/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name, phone, addresses }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, customer: r.customer }
}

export async function updateCustomerPassword(
  customerId,
  currentPassword,
  newPassword,
) {
  const r = await apiJson(`/api/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true }
}
