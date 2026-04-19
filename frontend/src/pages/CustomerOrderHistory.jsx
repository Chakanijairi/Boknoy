import { useEffect, useState } from 'react'
import { getCustomerSession } from '../data/customerAuth.js'
import { cancelOrder, getOrdersForCustomer } from '../data/customerOrders.js'

const TABS = [
  { id: 'pending', label: 'Pending & in transit' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

function filterOrders(orders, tab) {
  if (tab === 'pending') {
    return orders.filter(
      (o) => o.status === 'pending' || o.status === 'in_transit',
    )
  }
  if (tab === 'completed') return orders.filter((o) => o.status === 'completed')
  return orders.filter((o) => o.status === 'cancelled')
}

export default function CustomerOrderHistory() {
  const session = getCustomerSession()
  const [tab, setTab] = useState('pending')
  const [orders, setOrders] = useState([])
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    getOrdersForCustomer(session.id).then((list) => {
      if (!cancelled) setOrders(list)
    })
    return () => {
      cancelled = true
    }
  }, [session, refresh])

  const list = filterOrders(orders, tab)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">Order history</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-sky-200/80 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-sky-600 text-white'
                : 'bg-white/80 text-slate-700 hover:bg-sky-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {list.length === 0 ? (
          <li className="rounded-xl border border-dashed border-sky-300 bg-white/60 py-10 text-center text-slate-600">
            No orders in this tab yet.
          </li>
        ) : (
          list.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{o.orderRef}</p>
                  <p className="text-sm text-slate-600">{o.serviceType}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    o.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : o.status === 'cancelled'
                        ? 'bg-slate-200 text-slate-700'
                        : o.status === 'in_transit'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sky-100 text-sky-900'
                  }`}
                >
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700">{o.details}</p>
              <p className="mt-1 text-sm text-slate-600">{o.address}</p>
              {o.status === 'pending' && !o.assignedRiderId ? (
                <p className="mt-2 text-sm font-medium text-amber-800">
                  Finding a rider — you can cancel while no one has accepted yet.
                </p>
              ) : null}
              {o.riderName ? (
                <p className="mt-2 text-sm font-medium text-slate-800">
                  Rider: {o.riderName}
                </p>
              ) : null}
              {o.status === 'pending' && !o.assignedRiderId ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (!session) return
                    const ok = await cancelOrder(o.id, session.id)
                    if (ok) setRefresh((n) => n + 1)
                  }}
                  className="mt-4 text-sm font-semibold text-red-600 underline"
                >
                  Cancel order
                </button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
