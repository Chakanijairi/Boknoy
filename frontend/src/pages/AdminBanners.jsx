import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import { persistAdminBanners, readCustomerBanners } from '../data/customerBanners.js'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'goods', label: 'Goods' },
  { id: 'bills', label: 'Bills' },
  { id: 'other-services', label: 'Other Services' },
  { id: 'promos', label: 'Promos & Announcements' },
]

const CATEGORY_OPTIONS = TABS.filter((t) => t.id !== 'all')

function newId() {
  return crypto.randomUUID?.() ?? String(Date.now()) + Math.random()
}

export default function AdminBanners() {
  const [banners, setBanners] = useState(() => readCustomerBanners())
  const [activeTab, setActiveTab] = useState('all')
  const [fullscreenId, setFullscreenId] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [formCategory, setFormCategory] = useState('goods')
  const previewObjectUrlRef = useRef(null)

  const persist = useCallback((next) => {
    persistAdminBanners(next)
  }, [])

  useEffect(() => {
    persist(banners)
  }, [banners, persist])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return banners
    return banners.filter((b) => b.category === activeTab)
  }, [banners, activeTab])

  const fullscreenBanner = useMemo(
    () => banners.find((b) => b.id === fullscreenId) ?? null,
    [banners, fullscreenId],
  )

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
        previewObjectUrlRef.current = null
      }
    }
  }, [])

  const handleBannerFileChange = (e) => {
    const f = e.target.files?.[0] ?? null
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
      previewObjectUrlRef.current = null
    }
    setFile(f)
    if (f) {
      const url = URL.createObjectURL(f)
      previewObjectUrlRef.current = url
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const readFileAsDataUrl = (f) =>
    new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(f)
    })

  const handleSaveBanner = async () => {
    if (!file) return
    try {
      const src = await readFileAsDataUrl(file)
      const next = [
        ...banners,
        { id: newId(), category: formCategory, src },
      ]
      setBanners(next)
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current)
        previewObjectUrlRef.current = null
      }
      setPreviewUrl(null)
      setFile(null)
    } catch {
      /* ignore */
    }
  }

  const handleDelete = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id))
    setFullscreenId(null)
  }

  useEffect(() => {
    if (!fullscreenId) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFullscreenId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreenId])

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="System settings — Banners" />

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <p className="mb-2 text-center text-sm text-slate-400">
            <Link
              to="/admin/system"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← System settings
            </Link>
          </p>

          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div
                className="flex flex-wrap gap-2 border-b border-white/10 pb-4"
                role="tablist"
                aria-label="Banner categories"
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                      activeTab === tab.id
                        ? 'bg-violet-600/70 text-white ring-2 ring-violet-400/50'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <aside
              className="w-full shrink-0 rounded-2xl border border-white/15 bg-slate-950/55 p-5 shadow-xl backdrop-blur-md lg:w-80 xl:w-96"
              aria-labelledby="add-banner-heading"
            >
              <h2
                id="add-banner-heading"
                className="mb-4 text-sm font-bold uppercase tracking-wider text-white"
              >
                Add banners
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="banner-image"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-violet-200/90"
                  >
                    Select image
                  </label>
                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="block w-full cursor-pointer text-sm text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-600/60 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500/70"
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="mt-3 max-h-32 w-full rounded-lg border border-white/15 object-contain"
                    />
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="banner-category"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-violet-200/90"
                  >
                    Select category
                  </label>
                  <select
                    id="banner-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2.5 text-sm text-white focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={!file}
                  className="w-full rounded-xl border border-emerald-400/50 bg-emerald-700/50 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </aside>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-slate-950/40 py-12 text-center text-slate-400">
              No banners in this category yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setFullscreenId(b.id)}
                    className="group w-full overflow-hidden rounded-xl border border-white/15 bg-slate-900/50 text-left shadow-lg transition hover:border-violet-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <img
                      src={b.src}
                      alt=""
                      className="aspect-[5/2] w-full object-cover transition group-hover:opacity-95"
                    />
                    <span className="block px-3 py-2 text-xs font-medium uppercase tracking-wide text-violet-200/90">
                      {CATEGORY_OPTIONS.find((c) => c.id === b.category)
                        ?.label ?? b.category}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {fullscreenBanner ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Banner full screen"
          onClick={() => setFullscreenId(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreenId(null)}
              className="absolute left-2 top-2 z-10 rounded-full border border-white/30 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-900/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => handleDelete(fullscreenBanner.id)}
              className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-red-400/50 bg-red-950/95 text-red-200 shadow-lg transition hover:bg-red-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              title="Delete banner"
            >
              <TrashIcon />
            </button>
            <img
              src={fullscreenBanner.src}
              alt=""
              className="max-h-[85vh] max-w-full rounded-lg border border-white/20 object-contain shadow-2xl"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}
