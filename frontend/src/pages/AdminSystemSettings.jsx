import { Link } from 'react-router-dom'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

const SUBMODULES = [
  { to: '/admin/system/banners', label: 'Banners' },
  { to: '/admin/system/restaurant-banners', label: 'Restaurant Banners' },
  { to: '/admin/system/riders', label: 'Riders' },
]

export default function AdminSystemSettings() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="System settings" />
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10 sm:px-8">
          <p className="mb-8 text-center text-slate-300">
            Choose a submodule to manage system content.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {SUBMODULES.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-10 text-center text-sm font-bold uppercase tracking-wider text-white shadow-xl backdrop-blur-md transition hover:border-violet-300/40 hover:bg-white/18 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
