import { createStaffUsersSeed } from './staffUsersSeed.js'

const USERS_KEY = 'boknoy_admin_staff_users'
const PASSWORD_KEY = 'boknoy_admin_login_password'
const EMAIL_KEY = 'boknoy_admin_login_email'

const DEFAULT_ADMIN_EMAIL = 'Shaw@gmail.com'
const DEFAULT_ADMIN_PASSWORD = 'Shaw123'

export function loadStaffUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return createStaffUsersSeed()
}

export function saveStaffUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    /* ignore */
  }
}

export function getAdminEmail() {
  try {
    const e = localStorage.getItem(EMAIL_KEY)
    if (e) return e
  } catch {
    /* ignore */
  }
  return DEFAULT_ADMIN_EMAIL
}

export function setAdminEmail(plain) {
  try {
    localStorage.setItem(EMAIL_KEY, plain)
  } catch {
    /* ignore */
  }
}

export function getAdminPassword() {
  try {
    const p = localStorage.getItem(PASSWORD_KEY)
    if (p) return p
  } catch {
    /* ignore */
  }
  return DEFAULT_ADMIN_PASSWORD
}

export function setAdminPassword(plain) {
  try {
    localStorage.setItem(PASSWORD_KEY, plain)
  } catch {
    /* ignore */
  }
}
