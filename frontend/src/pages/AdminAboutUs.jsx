import { useState } from 'react'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

const STORAGE_KEY = 'boknoy_admin_about'

const defaultBody = `Shaw's Delivery is a trusted local logistics partner focused on fast, reliable deliveries across our service areas. We connect customers with restaurants, merchants, and essential services through a simple ordering experience and professional riders.

Our mission is to move goods and services safely and on time while supporting partner businesses and the communities we serve. Shaw's Delivery invests in rider training, responsive customer support, and technology that keeps every delivery transparent from pickup to drop-off.

Whether you need meals, groceries, bills payment assistance, or other delivery needs, Shaw's Delivery is built to serve you with care and consistency.`

function readStoredAbout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return raw
  } catch {
    /* ignore */
  }
  return defaultBody
}

export default function AdminAboutUs() {
  const initial = readStoredAbout()
  const [body, setBody] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)

  const save = () => {
    setBody(draft)
    setEditing(false)
    try {
      localStorage.setItem(STORAGE_KEY, draft)
    } catch {
      /* ignore */
    }
  }

  const cancel = () => {
    setDraft(body)
    setEditing(false)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="About us — Shaw's Delivery" />
        <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-xl border border-violet-400/50 bg-violet-600/40 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-violet-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-xl border border-emerald-400/50 bg-emerald-700/50 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-600/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  Save
                </button>
              </>
            )}
          </div>

          <section className="rounded-2xl border border-white/15 bg-slate-950/55 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
              Company information
            </h2>
            {editing ? (
              <label className="block">
                <span className="sr-only">About content</span>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={16}
                  className="w-full resize-y rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              </label>
            ) : (
              <div className="space-y-4 text-sm leading-relaxed text-slate-200 sm:text-base">
                {body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
