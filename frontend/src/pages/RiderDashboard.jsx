import { Link } from 'react-router-dom'
import { getRiderSession } from '../data/riderAuth.js'

const MODULES = [
  { id: 'deliveries', label: 'My deliveries', to: '/rider/deliveries' },
  { id: 'about', label: 'About us', to: '/rider/about' },
  { id: 'contact', label: 'Contact us', to: '/rider/contact' },
  { id: 'account', label: 'My account', to: '/rider/account' },
]

export default function RiderDashboard() {
  const session = getRiderSession()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
        Welcome, {session?.name ?? 'Rider'}
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.id}
            to={m.to}
            className="rounded-2xl border border-emerald-200/90 bg-white/95 p-6 shadow-md transition hover:border-emerald-400 hover:shadow-lg"
          >
            <h2 className="text-lg font-bold text-slate-800">{m.label}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
