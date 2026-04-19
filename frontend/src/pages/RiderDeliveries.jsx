import { useEffect, useMemo, useState } from 'react'
import { getRiderSession } from '../data/riderAuth.js'
import {
  getAvailableOrdersForRider,
  getOrdersForRider,
  riderAcceptOrder,
  riderCompleteOrder,
  riderDeclineOrder,
  riderReleaseOrder,
} from '../data/customerOrders.js'

const TABS = [
  { id: 'available', label: 'Available' },
  { id: 'active', label: 'My active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

function mapsHref(order) {
  if (order.customerLocation?.lat != null && order.customerLocation?.lng != null) {
    const { lat, lng } = order.customerLocation
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address ?? '')}`
}

export default function RiderDeliveries() {
  const session = getRiderSession()
  const [tab, setTab] = useState('available')
  const [mine, setMine] = useState([])
  const [riderCancelledHistory, setRiderCancelledHistory] = useState([])
  const [available, setAvailable] = useState([])
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    ;(async () => {
      const [av, riderData] = await Promise.all([
        getAvailableOrdersForRider(session.id),
        getOrdersForRider(session.id),
      ])
      if (!cancelled) {
        setAvailable(av)
        setMine(riderData.orders)
        setRiderCancelledHistory(riderData.riderCancelled)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session, refresh])

  const cancelledTabOrders = useMemo(() => {
    const byId = new Map()
    for (const o of riderCancelledHistory) {
      byId.set(o.id, { ...o, _history: 'rider_cancelled' })
    }
    for (const o of mine) {
      if (o.status === 'cancelled' && !byId.has(o.id)) {
        byId.set(o.id, { ...o, _history: 'order_cancelled' })
      }
    }
    return [...byId.values()].sort(
      (a, b) => (b.lastRiderCancelAt ?? 0) - (a.lastRiderCancelAt ?? 0),
    )
  }, [mine, riderCancelledHistory])

  if (!session) return null

  const list =
    tab === 'available'
      ? available
      : tab === 'active'
        ? mine.filter(
            (o) => o.status === 'pending' || o.status === 'in_transit',
          )
        : tab === 'completed'
          ? mine.filter((o) => o.status === 'completed')
          : cancelledTabOrders

  const bump = () => setRefresh((n) => n + 1)

  const accept = async (orderId) => {
    await riderAcceptOrder(orderId, session.id, session.name)
    bump()
  }

  const decline = async (orderId) => {
    await riderDeclineOrder(orderId, session.id)
    bump()
  }

  const complete = async (orderId) => {
    await riderCompleteOrder(orderId, session.id)
    bump()
  }

  const release = async (orderId) => {
    await riderReleaseOrder(orderId, session.id, session.name)
    bump()
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-800">My deliveries</h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-emerald-200/80 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {list.length === 0 ? (
          <li className="rounded-xl border border-dashed border-emerald-300 bg-white/70 py-10 text-center text-slate-600">
            Nothing here right now.
          </li>
        ) : (
          list.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-emerald-200/80 bg-white/95 p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{o.orderRef}</p>
                  <p className="text-sm text-slate-600">{o.serviceType}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {tab === 'cancelled' && o._history === 'rider_cancelled' ? (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase text-rose-900">
                      You cancelled
                    </span>
                  ) : null}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      o.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-900'
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
              </div>
              <p className="mt-3 text-sm text-slate-800">{o.details}</p>
              <p className="mt-1 text-sm text-slate-600">{o.address}</p>
              {o.customerLocation ? (
                <p className="mt-1 text-xs text-emerald-800">
                  Pin: {o.customerLocation.lat.toFixed(5)},{' '}
                  {o.customerLocation.lng.toFixed(5)}
                </p>
              ) : null}
              <a
                href={mapsHref(o)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-emerald-700 underline"
              >
                Open in Maps →
              </a>
              {tab === 'cancelled' &&
              o._history === 'rider_cancelled' &&
              o.lastRiderCancelAt ? (
                <p className="mt-2 text-xs text-slate-600">
                  {new Date(o.lastRiderCancelAt).toLocaleString()}
                </p>
              ) : null}
              {tab === 'available' ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => accept(o.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => decline(o.id)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Decline
                  </button>
                </div>
              ) : null}
              {tab === 'active' &&
              (o.status === 'pending' || o.status === 'in_transit') ? (
                <div className="mt-4 border-t border-emerald-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => complete(o.id)}
                      className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => release(o.id)}
                      className="rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
