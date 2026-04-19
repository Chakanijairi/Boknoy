import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import { DELIVERY_STATUS } from '../data/deliveryServicesSeed.js'

const SEARCH_MODES = [
  { id: 'all', label: 'All entries' },
  { id: 'customerName', label: 'Customer name' },
  { id: 'serviceType', label: 'Service type' },
  { id: 'riderName', label: 'Rider name' },
  { id: 'address', label: 'Address' },
  { id: 'date', label: 'Date' },
  { id: 'status', label: 'Status' },
]

function matchesDeliveryRow(row, mode, textQuery, statusValue) {
  const q = textQuery.trim().toLowerCase()
  if (mode === 'all') {
    if (!q) return true
    return (
      [
        row.orderId,
        row.customerName,
        row.serviceType,
        row.riderName,
        row.orderAddress,
        row.date,
        row.status,
        row.orderDetails,
        row.paymentType,
        row.amount,
        row.feedback,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }
  if (mode === 'customerName') {
    if (!q) return true
    return row.customerName.toLowerCase().includes(q)
  }
  if (mode === 'serviceType') {
    if (!q) return true
    return row.serviceType.toLowerCase().includes(q)
  }
  if (mode === 'riderName') {
    if (!q) return true
    return row.riderName.toLowerCase().includes(q)
  }
  if (mode === 'address') {
    if (!q) return true
    return row.orderAddress.toLowerCase().includes(q)
  }
  if (mode === 'date') {
    if (!q) return true
    return row.date.toLowerCase().includes(q)
  }
  if (mode === 'status') {
    return row.status === statusValue
  }
  return true
}

const TABLE_HEADERS = [
  'Order ID',
  'Date',
  'Customer name',
  'Type of service',
  'Order details',
  'Type of payment',
  'Amount',
  'Order address',
  'Rider name',
  'Feedback',
  'Status',
]

export default function AdminDeliveryServices() {
  const [rows, setRows] = useState([])
  const [searchMode, setSearchMode] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [searchStatus, setSearchStatus] = useState('Completed')

  const reloadRows = useCallback(async () => {
    const r = await apiJson('/api/admin/delivery-services')
    if (r.ok && Array.isArray(r.rows)) setRows(r.rows)
  }, [])

  useEffect(() => {
    reloadRows()
    const id = window.setInterval(() => reloadRows(), 5000)
    const onFocus = () => reloadRows()
    window.addEventListener('focus', onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [reloadRows])

  const filteredRows = useMemo(() => {
    return rows.filter((r) =>
      matchesDeliveryRow(r, searchMode, searchText, searchStatus),
    )
  }, [rows, searchMode, searchText, searchStatus])

  const printVisible =
    (searchMode === 'serviceType' && searchText.trim() !== '') ||
    (searchMode === 'riderName' && searchText.trim() !== '')

  const handlePrint = () => {
    if (!printVisible) return
    window.print()
  }

  const renderCells = (row) => (
    <>
      <td className="px-3 py-3 font-mono text-xs text-violet-200 sm:text-sm">
        {row.orderId}
      </td>
      <td className="px-3 py-3 text-slate-200">{row.date}</td>
      <td className="px-3 py-3 text-slate-200">{row.customerName}</td>
      <td className="px-3 py-3 text-slate-200">{row.serviceType}</td>
      <td className="max-w-[200px] px-3 py-3 text-slate-200">
        <span className="line-clamp-2">{row.orderDetails}</span>
      </td>
      <td className="px-3 py-3 text-slate-200">{row.paymentType}</td>
      <td className="px-3 py-3 text-slate-200">{row.amount}</td>
      <td className="max-w-[180px] px-3 py-3 text-slate-200">
        <span className="line-clamp-2">{row.orderAddress}</span>
      </td>
      <td className="px-3 py-3 text-slate-200">{row.riderName}</td>
      <td className="px-3 py-3 text-slate-200">{row.feedback}</td>
      <td className="px-3 py-3 text-slate-200">{row.status}</td>
    </>
  )

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="print:hidden">
        <AdminBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AdminSubHeader title="Delivery services" />
          <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
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
                    htmlFor="del-search-mode"
                    className="mb-1 block text-xs text-slate-400"
                  >
                    Search by
                  </label>
                  <select
                    id="del-search-mode"
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
                {searchMode === 'status' ? (
                  <div className="min-w-[10rem]">
                    <label
                      htmlFor="del-search-status"
                      className="mb-1 block text-xs text-slate-400"
                    >
                      Status
                    </label>
                    <select
                      id="del-search-status"
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                    >
                      {DELIVERY_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="min-w-[12rem] flex-1">
                    <label
                      htmlFor="del-search-text"
                      className="mb-1 block text-xs text-slate-400"
                    >
                      {searchMode === 'all'
                        ? 'Filter (optional)'
                        : searchMode === 'customerName'
                          ? 'Customer name'
                          : searchMode === 'serviceType'
                            ? 'Service type'
                            : searchMode === 'riderName'
                              ? 'Rider name'
                              : searchMode === 'address'
                                ? 'Address'
                                : 'Date'}
                    </label>
                    <input
                      id="del-search-text"
                      type="search"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={
                        searchMode === 'all'
                          ? 'Leave empty for all, or type to filter…'
                          : 'Enter value to filter…'
                      }
                      className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th key={h} className="px-3 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        No delivery records match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.sourceOrderId ?? row.orderId}
                        className="border-b border-white/10 transition hover:bg-white/5"
                      >
                        {renderCells(row)}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {printVisible ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl border border-slate-400/40 bg-slate-800/60 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700/60"
                >
                  Print
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  Printing uses the current filtered list (service type or rider
                  name search).
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden print:block print:bg-white print:text-black">
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold">
            Shaw&apos;s Delivery — Delivery services
          </h1>
          <p className="mb-2 text-sm text-gray-600">
            Filter:{' '}
            {searchMode === 'serviceType'
              ? `Service type — ${searchText.trim()}`
              : `Rider name — ${searchText.trim()}`}
          </p>
          <p className="mb-6 text-sm text-gray-600">
            Generated {new Date().toLocaleString()} · {filteredRows.length}{' '}
            row(s)
          </p>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="p-2 text-left font-semibold align-bottom"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.sourceOrderId ?? row.orderId}
                  className="border-b border-gray-300"
                >
                  <td className="p-2">{row.orderId}</td>
                  <td className="p-2">{row.date}</td>
                  <td className="p-2">{row.customerName}</td>
                  <td className="p-2">{row.serviceType}</td>
                  <td className="p-2">{row.orderDetails}</td>
                  <td className="p-2">{row.paymentType}</td>
                  <td className="p-2">{row.amount}</td>
                  <td className="p-2">{row.orderAddress}</td>
                  <td className="p-2">{row.riderName}</td>
                  <td className="p-2">{row.feedback}</td>
                  <td className="p-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
