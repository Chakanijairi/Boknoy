import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import {
  CUSTOMER_SEX,
  CUSTOMER_STATUS,
} from '../data/customersSeed.js'
import { apiJson } from '../api/client.js'

const SEARCH_MODES = [
  { id: 'all', label: 'All entries' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'sex', label: 'Sex' },
  { id: 'address', label: 'Address' },
  { id: 'status', label: 'Status' },
]

function matchesCustomerSearch(c, mode, textQuery, sexValue, statusValue) {
  const q = textQuery.trim().toLowerCase()
  if (mode === 'all') {
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.sex.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    )
  }
  if (mode === 'customerName') {
    if (!q) return true
    return c.name.toLowerCase().includes(q)
  }
  if (mode === 'address') {
    if (!q) return true
    return c.address.toLowerCase().includes(q)
  }
  if (mode === 'sex') {
    return c.sex === sexValue
  }
  if (mode === 'status') {
    return c.status === statusValue
  }
  return true
}

export default function AdminCustomers() {
  const navigate = useNavigate()
  const [state, setState] = useState({ customers: [] })

  useEffect(() => {
    const sync = async () => {
      const r = await apiJson('/api/admin/customers')
      if (r.ok && Array.isArray(r.customers)) {
        setState({ customers: r.customers })
      }
    }
    sync()
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  const [searchMode, setSearchMode] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [searchSex, setSearchSex] = useState('Female')
  const [searchStatus, setSearchStatus] = useState('Active')
  const [selectedId, setSelectedId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const filteredCustomers = useMemo(() => {
    return state.customers.filter((c) =>
      matchesCustomerSearch(
        c,
        searchMode,
        searchText,
        searchSex,
        searchStatus,
      ),
    )
  }, [state.customers, searchMode, searchText, searchSex, searchStatus])

  const selectedCustomer = useMemo(
    () => state.customers.find((c) => c.id === selectedId) ?? null,
    [state.customers, selectedId],
  )

  const openDetails = (customer) => {
    setSelectedId(customer.id)
    setDetailsOpen(true)
  }

  const rowClass = (id) =>
    `cursor-pointer border-b border-white/10 transition hover:bg-white/10 ${
      selectedId === id ? 'bg-violet-600/25 ring-1 ring-inset ring-violet-400/40' : ''
    }`

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="print:hidden">
        <AdminBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AdminSubHeader title="Customers" />
          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <p className="mb-6 text-sm text-slate-400">
              <Link
                to="/admin"
                className="text-violet-300 underline-offset-2 hover:underline"
              >
                ← Admin home
              </Link>
            </p>

            <section className="mb-6 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-md sm:p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-200">
                Search
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-[12rem]">
                  <label
                    htmlFor="cust-search-mode"
                    className="mb-1 block text-xs text-slate-400"
                  >
                    Search by
                  </label>
                  <select
                    id="cust-search-mode"
                    value={searchMode}
                    onChange={(e) => setSearchMode(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                  >
                    {SEARCH_MODES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                {searchMode === 'sex' ? (
                  <div className="min-w-[10rem]">
                    <label
                      htmlFor="cust-search-sex"
                      className="mb-1 block text-xs text-slate-400"
                    >
                      Sex
                    </label>
                    <select
                      id="cust-search-sex"
                      value={searchSex}
                      onChange={(e) => setSearchSex(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                    >
                      {CUSTOMER_SEX.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : searchMode === 'status' ? (
                  <div className="min-w-[10rem]">
                    <label
                      htmlFor="cust-search-status"
                      className="mb-1 block text-xs text-slate-400"
                    >
                      Status
                    </label>
                    <select
                      id="cust-search-status"
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                    >
                      {CUSTOMER_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="min-w-[12rem] flex-1">
                    <label
                      htmlFor="cust-search-text"
                      className="mb-1 block text-xs text-slate-400"
                    >
                      {searchMode === 'all'
                        ? 'Filter (optional)'
                        : searchMode === 'customerName'
                          ? 'Name contains'
                          : 'Address contains'}
                    </label>
                    <input
                      id="cust-search-text"
                      type="search"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={
                        searchMode === 'all'
                          ? 'Leave empty for all, or type to filter…'
                          : 'Type to filter…'
                      }
                      className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                  <tr>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Sex</th>
                    <th className="px-3 py-3">Birthdate</th>
                    <th className="px-3 py-3">Address</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        No customers match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        className={rowClass(c.id)}
                        onClick={() => openDetails(c)}
                      >
                        <td className="px-3 py-3 font-medium text-white">
                          {c.name}
                        </td>
                        <td className="px-3 py-3 text-slate-200">{c.phone}</td>
                        <td className="px-3 py-3 text-slate-200">{c.email}</td>
                        <td className="px-3 py-3 text-slate-200">{c.sex}</td>
                        <td className="px-3 py-3 text-slate-200">
                          {c.birthdate}
                        </td>
                        <td className="px-3 py-3 text-slate-200">
                          {c.address}
                        </td>
                        <td className="px-3 py-3 text-slate-200">
                          {c.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {detailsOpen && selectedCustomer ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cust-detail-title"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="cust-detail-title"
              className="mb-4 text-lg font-semibold text-white"
            >
              Customer details
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Name
                </dt>
                <dd className="text-slate-200">{selectedCustomer.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Phone
                </dt>
                <dd className="text-slate-200">{selectedCustomer.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Email
                </dt>
                <dd className="text-slate-200">{selectedCustomer.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Sex
                </dt>
                <dd className="text-slate-200">{selectedCustomer.sex}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Birthdate
                </dt>
                <dd className="text-slate-200">
                  {selectedCustomer.birthdate}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Address
                </dt>
                <dd className="text-slate-200">{selectedCustomer.address}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Status
                </dt>
                <dd className="text-slate-200">{selectedCustomer.status}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/customers/${selectedCustomer.id}/orders`)
              }
              className="mt-6 w-full rounded-xl border border-violet-400/50 bg-violet-700/50 py-3 text-sm font-semibold text-white transition hover:bg-violet-600/60"
            >
              Order history
            </button>
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/15"
            >
              Back
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
