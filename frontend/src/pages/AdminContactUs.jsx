import { useState } from 'react'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

const STORAGE_KEY = 'boknoy_admin_contact'

const defaultContact = {
  address:
    "Shaw's Delivery HQ, Metro Business District, Philippines",
  phone: '+63 (2) 8123-4567',
  messengerLabel: "Shaw's Delivery (Messenger)",
  messengerUrl: 'https://m.me/shawsdelivery',
}

function readStoredContact() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultContact, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaultContact
}

export default function AdminContactUs() {
  const initial = readStoredContact()
  const [data, setData] = useState(initial)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)

  const save = () => {
    setData(draft)
    setEditing(false)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }

  const cancel = () => {
    setDraft(data)
    setEditing(false)
  }

  const view = editing ? draft : data

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="Contact us — Shaw's Delivery" />
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

          <section className="space-y-6 rounded-2xl border border-white/15 bg-slate-950/55 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Company contact
            </h2>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                Address
              </h3>
              {editing ? (
                <input
                  type="text"
                  value={draft.address}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, address: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              ) : (
                <p className="text-slate-200">{view.address}</p>
              )}
            </div>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                Contact number
              </h3>
              {editing ? (
                <input
                  type="text"
                  value={draft.phone}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, phone: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
              ) : (
                <p className="text-slate-200">
                  <a
                    href={`tel:${view.phone.replace(/\s/g, '')}`}
                    className="text-violet-300 underline decoration-violet-500/50 underline-offset-2 hover:text-violet-200"
                  >
                    {view.phone}
                  </a>
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                Facebook Messenger
              </h3>
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Display label"
                    value={draft.messengerLabel}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, messengerLabel: e.target.value }))
                    }
                    className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                  <input
                    type="url"
                    placeholder="Messenger link (e.g. https://m.me/...)"
                    value={draft.messengerUrl}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, messengerUrl: e.target.value }))
                    }
                    className="w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
              ) : (
                <p className="text-slate-200">
                  <a
                    href={view.messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-300 underline decoration-violet-500/50 underline-offset-2 hover:text-violet-200"
                  >
                    {view.messengerLabel}
                  </a>
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
