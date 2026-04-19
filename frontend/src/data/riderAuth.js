import { apiJson } from '../api/client.js'

const SESSION_KEY = 'shaws_rider_session'

export function getRiderSession() {
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

export function setRiderSession(rider) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        id: rider.id,
        email: rider.email,
        name: rider.name,
      }),
    )
  } catch {
    /* ignore */
  }
}

export function clearRiderSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export async function registerRider({ name, email, password, phone }) {
  const body = {
    name: name.trim(),
    email: email.trim(),
    password,
  }
  const p = (phone ?? '').trim()
  if (p) body.phone = p
  const r = await apiJson('/api/riders/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, rider: r.rider }
}

/** @param {string} login - email or phone (any formatting) */
export async function loginRider(login, password) {
  const r = await apiJson('/api/riders/login', {
    method: 'POST',
    body: JSON.stringify({ login: login.trim(), password }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, rider: r.rider }
}

export async function fetchRiderRecord(riderId) {
  const r = await apiJson(`/api/riders/${riderId}`)
  if (!r.ok) return null
  return r.rider
}

export async function updateRiderPassword(
  riderId,
  currentPassword,
  newPassword,
) {
  const r = await apiJson(`/api/riders/${riderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true }
}
