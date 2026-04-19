export const BANNERS_STORAGE_KEY = 'boknoy_admin_banners'

const BANNERS_CHANGED_EVENT = 'boknoy-banners-changed'

function bannerPlaceholderSrc(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="320" viewBox="0 0 800 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1e3a8a"/><stop offset="1" stop-color="#5b21b6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="400" y="160" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-family="system-ui,sans-serif" font-size="26" font-weight="600">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function newId() {
  return crypto.randomUUID?.() ?? String(Date.now()) + Math.random()
}

function defaultBanners() {
  return [
    {
      id: newId(),
      category: 'goods',
      src: bannerPlaceholderSrc("Shaw's Delivery — Goods"),
    },
    {
      id: newId(),
      category: 'bills',
      src: bannerPlaceholderSrc("Shaw's Delivery — Bills"),
    },
    {
      id: newId(),
      category: 'promos',
      src: bannerPlaceholderSrc('Promos & Announcements'),
    },
  ]
}

export function readCustomerBanners() {
  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return defaultBanners()
}

/** Persists banners from admin; notifies same-tab listeners (storage event does not). */
export function persistAdminBanners(banners) {
  try {
    localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners))
    window.dispatchEvent(new CustomEvent(BANNERS_CHANGED_EVENT))
  } catch {
    /* quota or private mode */
  }
}

/** Subscribe to banner updates: other tabs (storage), same tab (custom event), window focus. */
export function subscribeBanners(callback) {
  const onStorage = (e) => {
    if (e.key === BANNERS_STORAGE_KEY || e.key === null) callback()
  }
  const onCustom = () => callback()
  window.addEventListener('storage', onStorage)
  window.addEventListener(BANNERS_CHANGED_EVENT, onCustom)
  window.addEventListener('focus', onCustom)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(BANNERS_CHANGED_EVENT, onCustom)
    window.removeEventListener('focus', onCustom)
  }
}
