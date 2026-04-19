import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

const HISTORY_TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'declined', label: 'Declined' },
]

const ORDER_SEARCH_MODES = [
  { id: 'all', label: 'All entries' },
  { id: 'serviceType', label: 'Service type' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'address', label: 'Address' },
  { id: 'date', label: 'Date' },
]

function matchesOrderSearch(order, mode, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const svc = String(order.serviceType ?? '')
  const cust = String(order.customerName ?? '')
  const addr = String(order.address ?? '')
  const date = String(order.date ?? '')
  const kind =
    order._cancelKind === 'rider_released'
      ? 'rider released'
      : order._cancelKind === 'order_cancelled'
        ? 'order cancelled'
        : ''
  if (mode === 'all') {
    return (
      [svc, cust, addr, date, kind].join(' ').toLowerCase().includes(q) ||
      (order.orderRef && String(order.orderRef).toLowerCase().includes(q))
    )
  }
  if (mode === 'serviceType') return svc.toLowerCase().includes(q)
  if (mode === 'customerName') return cust.toLowerCase().includes(q)
  if (mode === 'address') return addr.toLowerCase().includes(q)
  if (mode === 'date') return date.toLowerCase().includes(q)
  return true
}

function cancelledHistoryLabel(order) {
  if (order._cancelKind === 'rider_released') return 'Rider released job'
  if (order._cancelKind === 'order_cancelled') return 'Order cancelled'
  return null
}

function cancelledHistoryWhen(order) {
  if (order._cancelKind === 'rider_released' && order.lastRiderCancelAt) {
    return new Date(order.lastRiderCancelAt).toLocaleString()
  }
  return null
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  const historyLabel = cancelledHistoryLabel(order)
  const releasedWhen = cancelledHistoryWhen(order)
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="order-detail-title"
          className="mb-4 text-lg font-semibold text-white"
        >
          Order details
        </h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Order ref
            </dt>
            <dd className="text-slate-200">{order.orderRef}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Status
            </dt>
            <dd className="text-slate-200">
              {String(order.status ?? '—').replace('_', ' ')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Service type
            </dt>
            <dd className="text-slate-200">{order.serviceType}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Customer
            </dt>
            <dd className="text-slate-200">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Address
            </dt>
            <dd className="text-slate-200">{order.address}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Date
            </dt>
            <dd className="text-slate-200">{order.date}</dd>
          </div>
          {historyLabel ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                Cancellation history
              </dt>
              <dd className="text-slate-200">
                {historyLabel}
                {releasedWhen ? ` — ${releasedWhen}` : ''}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Details
            </dt>
            <dd className="text-slate-200">{order.details}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/15"
        >
          Back
        </button>
      </div>
    </div>
  )
}

export default function AdminRiderHistory() {
  const { riderId } = useParams()
  const [tab, setTab] = useState('pending')
  const [completedSearchMode, setCompletedSearchMode] = useState('all')
  const [completedQuery, setCompletedQuery] = useState('')
  const [cancelledSearchMode, setCancelledSearchMode] = useState('all')
  const [cancelledQuery, setCancelledQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [rider, setRider] = useState(null)
  const [ordersForRider, setOrdersForRider] = useState([])
  const [riderCancelledOrders, setRiderCancelledOrders] = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [histErr, setHistErr] = useState(null)

  useEffect(() => {
    if (!riderId) return undefined
    let cancelled = false
    ;(async () => {
      setHistLoading(true)
      setHistErr(null)
      const [rR, oR] = await Promise.all([
        apiJson(`/api/riders/${riderId}`),
        apiJson(`/api/admin/riders/${riderId}/orders`),
      ])
      if (cancelled) return
      setHistLoading(false)
      if (!rR.ok) {
        setRider(null)
        setOrdersForRider([])
        setRiderCancelledOrders([])
        setHistErr(rR.error ?? 'Rider not found.')
        return
      }
      setRider(rR.rider)
      if (!oR.ok) {
        setOrdersForRider([])
        setRiderCancelledOrders([])
        setHistErr(oR.error ?? 'Could not load rider orders.')
        return
      }
      setOrdersForRider(oR.orders ?? [])
      setRiderCancelledOrders(
        Array.isArray(oR.riderCancelled) ? oR.riderCancelled : [],
      )
    })()
    return () => {
      cancelled = true
    }
  }, [riderId])

  const pendingOrders = useMemo(
    () =>
      ordersForRider.filter(
        (o) => o.status === 'pending' || o.status === 'in_transit',
      ),
    [ordersForRider],
  )
  const completedOrders = useMemo(() => {
    const list = ordersForRider.filter((o) => o.status === 'completed')
    return list.filter((o) =>
      matchesOrderSearch(o, completedSearchMode, completedQuery),
    )
  }, [ordersForRider, completedSearchMode, completedQuery])
  const cancelledOrders = useMemo(() => {
    const byId = new Map()
    for (const o of riderCancelledOrders) {
      byId.set(o.id, { ...o, _cancelKind: 'rider_released' })
    }
    for (const o of ordersForRider) {
      if (o.status === 'cancelled' && !byId.has(o.id)) {
        byId.set(o.id, { ...o, _cancelKind: 'order_cancelled' })
      }
    }
    const list = [...byId.values()].sort((a, b) => {
      const ta = a.lastRiderCancelAt ?? 0
      const tb = b.lastRiderCancelAt ?? 0
      if (tb !== ta) return tb - ta
      return String(b.date).localeCompare(String(a.date))
    })
    return list.filter((o) =>
      matchesOrderSearch(o, cancelledSearchMode, cancelledQuery),
    )
  }, [
    ordersForRider,
    riderCancelledOrders,
    cancelledSearchMode,
    cancelledQuery,
  ])
  const declinedOrders = useMemo(
    () => ordersForRider.filter((o) => o.status === 'declined'),
    [ordersForRider],
  )

  const tableRowClass =
    'cursor-pointer border-b border-white/10 transition hover:bg-white/10'

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col print:hidden">
        <AdminSubHeader
          title={
            rider
              ? `Rider history — ${rider.name}`
              : 'Rider history'
          }
        />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <p className="mb-6 text-sm text-slate-400">
            <Link
              to="/admin/system/riders"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← Registered riders
            </Link>
            <span className="mx-2 text-white/25">|</span>
            <Link
              to="/admin/system"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              System settings
            </Link>
          </p>

          {histLoading ? (
            <p className="rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">
              Loading rider history…
            </p>
          ) : !rider ? (
            <p className="rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">
              {histErr ?? 'Rider not found.'}
            </p>
          ) : (
            <>
              {histErr ? (
                <p
                  className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-sm text-amber-200"
                  role="alert"
                >
                  {histErr}
                </p>
              ) : null}
              <div
                className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4"
                role="tablist"
              >
                {HISTORY_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => {
                      setTab(t.id)
                      setSelectedOrder(null)
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide sm:text-sm ${
                      tab === t.id
                        ? 'bg-violet-600/70 text-white ring-2 ring-violet-400/50'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === 'pending' && (
                <section className="rounded-2xl border border-white/15 bg-slate-950/55 p-6 backdrop-blur-md">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-violet-200">
                    Current order details
                  </h2>
                  {pendingOrders.length === 0 ? (
                    <p className="text-slate-400">No pending orders.</p>
                  ) : (
                    <ul className="space-y-4">
                      {pendingOrders.map((o) => (
                        <li
                          key={o.id}
                          className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
                        >
                          <p className="text-xs font-semibold text-violet-300">
                            {o.orderRef}
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            <span className="text-slate-500">Service: </span>
                            {o.serviceType}
                          </p>
                          <p className="text-sm text-slate-200">
                            <span className="text-slate-500">Customer: </span>
                            {o.customerName}
                          </p>
                          <p className="text-sm text-slate-200">
                            <span className="text-slate-500">Address: </span>
                            {o.address}
                          </p>
                          <p className="text-sm text-slate-200">
                            <span className="text-slate-500">Date: </span>
                            {o.date}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {o.details}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              {tab === 'completed' && (
                <section>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="min-w-[10rem]">
                      <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                        Search by
                      </label>
                      <select
                        value={completedSearchMode}
                        onChange={(e) =>
                          setCompletedSearchMode(e.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                      >
                        {ORDER_SEARCH_MODES.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                        Search
                      </label>
                      <input
                        type="search"
                        value={completedQuery}
                        onChange={(e) => setCompletedQuery(e.target.value)}
                        placeholder="Type to filter…"
                        className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                        <tr>
                          <th className="px-4 py-3">Service type</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Address</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Order ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-slate-400"
                            >
                              No completed orders match your search.
                            </td>
                          </tr>
                        ) : (
                          completedOrders.map((o) => (
                            <tr
                              key={o.id}
                              className={tableRowClass}
                              onClick={() => setSelectedOrder(o)}
                            >
                              <td className="px-4 py-3 text-slate-200">
                                {o.serviceType}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.customerName}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.address}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.date}
                              </td>
                              <td className="px-4 py-3 text-violet-200">
                                {o.orderRef}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === 'cancelled' && (
                <section>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="min-w-[10rem]">
                      <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                        Search by
                      </label>
                      <select
                        value={cancelledSearchMode}
                        onChange={(e) =>
                          setCancelledSearchMode(e.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                      >
                        {ORDER_SEARCH_MODES.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                        Search
                      </label>
                      <input
                        type="search"
                        value={cancelledQuery}
                        onChange={(e) => setCancelledQuery(e.target.value)}
                        placeholder="Type to filter…"
                        className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">
                    Includes jobs this rider released back to the pool (same as
                    the rider&apos;s Cancelled tab) and orders cancelled in the
                    system while assigned to them.
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                        <tr>
                          <th className="px-4 py-3">History</th>
                          <th className="px-4 py-3">Service type</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Address</th>
                          <th className="px-4 py-3">When</th>
                          <th className="px-4 py-3">Order ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancelledOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-slate-400"
                            >
                              No cancelled or released orders match your search.
                            </td>
                          </tr>
                        ) : (
                          cancelledOrders.map((o) => (
                            <tr
                              key={o.id}
                              className={tableRowClass}
                              onClick={() => setSelectedOrder(o)}
                            >
                              <td className="px-4 py-3 text-slate-200">
                                {o._cancelKind === 'rider_released' ? (
                                  <span className="rounded-md bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-200">
                                    Rider released
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-slate-500/25 px-2 py-1 text-xs font-semibold text-slate-200">
                                    Order cancelled
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.serviceType}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.customerName}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.address}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o._cancelKind === 'rider_released' &&
                                o.lastRiderCancelAt
                                  ? new Date(
                                      o.lastRiderCancelAt,
                                    ).toLocaleString()
                                  : o.date}
                              </td>
                              <td className="px-4 py-3 text-violet-200">
                                {o.orderRef}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {tab === 'declined' && (
                <section>
                  <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                        <tr>
                          <th className="px-4 py-3">Service type</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Address</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Order ref</th>
                        </tr>
                      </thead>
                      <tbody>
                        {declinedOrders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-slate-400"
                            >
                              No declined orders.
                            </td>
                          </tr>
                        ) : (
                          declinedOrders.map((o) => (
                            <tr
                              key={o.id}
                              className={tableRowClass}
                              onClick={() => setSelectedOrder(o)}
                            >
                              <td className="px-4 py-3 text-slate-200">
                                {o.serviceType}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.customerName}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.address}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {o.date}
                              </td>
                              <td className="px-4 py-3 text-violet-200">
                                {o.orderRef}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
