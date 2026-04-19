import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const ORDER_SEARCH_MODES = [
  { id: 'all', label: 'All entries' },
  { id: 'serviceType', label: 'Service type' },
  { id: 'riderName', label: 'Rider name' },
  { id: 'address', label: 'Address' },
  { id: 'date', label: 'Date' },
]

function matchesOrderSearch(order, mode, query) {
  const q = query.trim().toLowerCase()
  if (mode === 'all') {
    if (!q) return true
    return (
      [
        order.serviceType,
        order.riderName,
        order.address,
        order.date,
        order.orderRef,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }
  if (!q) return true
  if (mode === 'serviceType')
    return order.serviceType.toLowerCase().includes(q)
  if (mode === 'riderName')
    return order.riderName.toLowerCase().includes(q)
  if (mode === 'address') return order.address.toLowerCase().includes(q)
  if (mode === 'date') return order.date.toLowerCase().includes(q)
  return true
}

function mapOrderForAdmin(o) {
  const d = o.createdAt
  return {
    ...o,
    date: d ? new Date(d).toISOString().slice(0, 10) : '—',
    riderName: o.riderName ?? '—',
  }
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cust-order-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="cust-order-detail-title"
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
              Service type
            </dt>
            <dd className="text-slate-200">{order.serviceType}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              Rider
            </dt>
            <dd className="text-slate-200">{order.riderName}</dd>
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

export default function AdminCustomerOrderHistory() {
  const { customerId } = useParams()
  const [tab, setTab] = useState('pending')
  const [completedMode, setCompletedMode] = useState('all')
  const [completedQuery, setCompletedQuery] = useState('')
  const [cancelledMode, setCancelledMode] = useState('all')
  const [cancelledQuery, setCancelledQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [ordersForCustomer, setOrdersForCustomer] = useState([])
  const [loadState, setLoadState] = useState('loading')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadState('loading')
      const [cRes, oRes] = await Promise.all([
        apiJson(`/api/customers/${customerId}`),
        apiJson(`/api/orders/customer/${customerId}`),
      ])
      if (cancelled) return
      if (!cRes.ok) {
        setCustomer(null)
        setOrdersForCustomer([])
        setLoadState('missing')
        return
      }
      setCustomer({
        id: cRes.customer.id,
        name: cRes.customer.name,
        email: cRes.customer.email,
        phone: cRes.customer.phone,
        address: cRes.customer.address,
      })
      const raw = oRes.ok && Array.isArray(oRes.orders) ? oRes.orders : []
      setOrdersForCustomer(raw.map(mapOrderForAdmin))
      setLoadState('ready')
    })()
    return () => {
      cancelled = true
    }
  }, [customerId])

  const pendingOrders = useMemo(
    () =>
      ordersForCustomer.filter(
        (o) => o.status === 'pending' || o.status === 'in_transit',
      ),
    [ordersForCustomer],
  )
  const completedOrders = useMemo(() => {
    const list = ordersForCustomer.filter((o) => o.status === 'completed')
    return list.filter((o) =>
      matchesOrderSearch(o, completedMode, completedQuery),
    )
  }, [ordersForCustomer, completedMode, completedQuery])
  const cancelledOrders = useMemo(() => {
    const list = ordersForCustomer.filter((o) => o.status === 'cancelled')
    return list.filter((o) =>
      matchesOrderSearch(o, cancelledMode, cancelledQuery),
    )
  }, [ordersForCustomer, cancelledMode, cancelledQuery])

  const rowClass =
    'cursor-pointer border-b border-white/10 transition hover:bg-white/10'

  const renderSearchBar = (mode, setMode, query, setQuery) => (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[10rem]">
        <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
          Search by
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to filter…"
          className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
      </div>
    </div>
  )

  const ordersTable = (orders) => (
    <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
          <tr>
            <th className="px-4 py-3">Service type</th>
            <th className="px-4 py-3">Rider</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Order ref</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-slate-400"
              >
                No orders match your search.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr
                key={o.id}
                className={rowClass}
                onClick={() => setSelectedOrder(o)}
              >
                <td className="px-4 py-3 text-slate-200">{o.serviceType}</td>
                <td className="px-4 py-3 text-slate-200">{o.riderName}</td>
                <td className="px-4 py-3 text-slate-200">{o.address}</td>
                <td className="px-4 py-3 text-slate-200">{o.date}</td>
                <td className="px-4 py-3 text-violet-200">{o.orderRef}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col print:hidden">
        <AdminSubHeader
          title={
            customer
              ? `Order history — ${customer.name}`
              : 'Order history'
          }
        />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <p className="mb-6 text-sm text-slate-400">
            <Link
              to="/admin/customers"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← Customers
            </Link>
          </p>

          {loadState === 'loading' ? (
            <p className="rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">
              Loading…
            </p>
          ) : loadState === 'missing' || !customer ? (
            <p className="rounded-xl border border-white/10 bg-slate-950/50 p-8 text-center text-slate-400">
              Customer not found.
            </p>
          ) : (
            <>
              <div
                className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4"
                role="tablist"
              >
                {TABS.map((t) => (
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
                            <span className="text-slate-500">Rider: </span>
                            {o.riderName}
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
                  {renderSearchBar(
                    completedMode,
                    setCompletedMode,
                    completedQuery,
                    setCompletedQuery,
                  )}
                  {ordersTable(completedOrders)}
                </section>
              )}

              {tab === 'cancelled' && (
                <section>
                  {renderSearchBar(
                    cancelledMode,
                    setCancelledMode,
                    cancelledQuery,
                    setCancelledQuery,
                  )}
                  {ordersTable(cancelledOrders)}
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
