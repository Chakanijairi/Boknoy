import { Link } from 'react-router-dom'
import { getCustomerSession } from '../data/customerAuth.js'

const MODULES = [
  { id: 'delivery', label: 'Delivery services', to: '/customer/delivery' },
  { id: 'orders', label: 'Order history', to: '/customer/orders' },
  { id: 'about', label: 'About us', to: '/customer/about' },
  { id: 'contact', label: 'Contact us', to: '/customer/contact' },
  { id: 'feedback', label: 'Feedback', to: '/customer/feedback' },
  { id: 'account', label: 'My account', to: '/customer/account' },
]

export default function CustomerDashboard() {
  const session = getCustomerSession()

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
        Welcome, {session?.name ?? 'Customer'}
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <Link
            key={m.id}
            to={m.to}
            className="rounded-2xl border border-sky-200/90 bg-white/90 p-6 shadow-md transition hover:border-sky-400 hover:shadow-lg"
          >
            <h2 className="text-lg font-bold text-slate-800">{m.label}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}
