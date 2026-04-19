import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../api/client.js'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import {
  ACCOUNT_STATUS,
  AVAILABILITY,
} from '../data/ridersSeed.js'

const SEARCH_MODES = [
  { id: 'all', label: 'All entries' },
  { id: 'name', label: 'Name' },
  { id: 'accountStatus', label: 'Account status' },
  { id: 'barangay', label: 'Barangay' },
]

function matchesRiderSearch(rider, mode, textQuery, statusQuery) {
  if (mode === 'all') {
    if (!textQuery.trim()) return true
    const q = textQuery.trim().toLowerCase()
    return (
      rider.name.toLowerCase().includes(q) ||
      rider.barangay.toLowerCase().includes(q) ||
      rider.email.toLowerCase().includes(q) ||
      rider.phone.toLowerCase().includes(q)
    )
  }
  if (mode === 'name') {
    if (!textQuery.trim()) return true
    return rider.name.toLowerCase().includes(textQuery.trim().toLowerCase())
  }
  if (mode === 'barangay') {
    if (!textQuery.trim()) return true
    return rider.barangay
      .toLowerCase()
      .includes(textQuery.trim().toLowerCase())
  }
  if (mode === 'accountStatus') {
    return rider.accountStatus === statusQuery
  }
  return true
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  barangay: '',
  availability: 'Available',
  accountStatus: 'Pending',
}

export default function AdminRiders() {
  const navigate = useNavigate()
  const [riders, setRiders] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [loadErr, setLoadErr] = useState(null)

  const loadList = useCallback(async () => {
    setListLoading(true)
    setLoadErr(null)
    const r = await apiJson('/api/admin/riders')
    setListLoading(false)
    if (!r.ok) {
      setLoadErr(r.error ?? 'Could not load riders. Is the API running?')
      return
    }
    setRiders(r.riders ?? [])
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  const [searchMode, setSearchMode] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [searchStatus, setSearchStatus] = useState('Active')
  const [selectedId, setSelectedId] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const filteredRiders = useMemo(() => {
    return riders.filter((r) =>
      matchesRiderSearch(r, searchMode, searchText, searchStatus),
    )
  }, [riders, searchMode, searchText, searchStatus])

  const selectedRider = useMemo(
    () => riders.find((r) => r.id === selectedId) ?? null,
    [riders, selectedId],
  )

  const openDetails = (rider) => {
    setSelectedId(rider.id)
    setDetailsOpen(true)
  }

  const rowClass = (id) =>
    `cursor-pointer border-b border-white/10 transition hover:bg-white/10 ${
      selectedId === id ? 'bg-violet-600/25 ring-1 ring-inset ring-violet-400/40' : ''
    }`

  const handleActivate = async () => {
    if (!selectedId) return
    setActionError(null)
    const r = await apiJson(`/api/admin/riders/${selectedId}`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: 'Active' }),
    })
    if (!r.ok) {
      setActionError(r.error ?? 'Could not activate rider.')
      return
    }
    await loadList()
  }

  const handleDeactivate = async () => {
    if (!selectedId) return
    setActionError(null)
    const r = await apiJson(`/api/admin/riders/${selectedId}`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: 'Inactive' }),
    })
    if (!r.ok) {
      setActionError(r.error ?? 'Could not deactivate rider.')
      return
    }
    await loadList()
  }

  const openAdd = () => {
    setFormMode('add')
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(true)
    setDetailsOpen(false)
  }

  const openEdit = () => {
    if (!selectedRider) return
    setFormMode('edit')
    setFormError(null)
    setForm({
      name: selectedRider.name,
      phone: selectedRider.phone,
      email: selectedRider.email,
      barangay: selectedRider.barangay,
      availability: selectedRider.availability,
      accountStatus: selectedRider.accountStatus,
    })
    setFormOpen(true)
    setDetailsOpen(false)
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (formMode === 'add') {
      const r = await apiJson('/api/admin/riders', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          barangay: form.barangay.trim(),
          availability: form.availability,
          accountStatus: form.accountStatus,
        }),
      })
      if (!r.ok) {
        setFormError(r.error ?? 'Could not create rider.')
        return
      }
      await loadList()
      setSelectedId(r.rider.id)
      setFormOpen(false)
      setDetailsOpen(true)
    } else if (selectedId) {
      const r = await apiJson(`/api/admin/riders/${selectedId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          barangay: form.barangay.trim(),
          availability: form.availability,
          accountStatus: form.accountStatus,
        }),
      })
      if (!r.ok) {
        setFormError(r.error ?? 'Could not update rider.')
        return
      }
      await loadList()
      setFormOpen(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="print:hidden">
        <AdminBackdrop />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AdminSubHeader title="System settings — Riders" />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
            <p className="mb-6 text-sm text-slate-400">
              <Link
                to="/admin/system"
                className="text-violet-300 underline-offset-2 hover:underline"
              >
                ← System settings
              </Link>
            </p>

            {loadErr ? (
              <p className="mb-4 text-sm text-red-400" role="alert">
                {loadErr}
              </p>
            ) : null}
            {listLoading ? (
              <p className="mb-4 text-sm text-slate-400">Loading riders…</p>
            ) : null}
            {actionError ? (
              <p className="mb-4 text-sm text-red-400" role="alert">
                {actionError}
              </p>
            ) : null}

            <section className="mb-6 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-md sm:p-5">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-200">
              Search
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-[12rem]">
                <label
                  htmlFor="rider-search-mode"
                  className="mb-1 block text-xs text-slate-400"
                >
                  Search by
                </label>
                <select
                  id="rider-search-mode"
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
              {searchMode === 'accountStatus' ? (
                <div className="min-w-[10rem]">
                  <label
                    htmlFor="rider-search-status"
                    className="mb-1 block text-xs text-slate-400"
                  >
                    Status
                  </label>
                  <select
                    id="rider-search-status"
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                  >
                    {ACCOUNT_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="min-w-[12rem] flex-1">
                  <label
                    htmlFor="rider-search-text"
                    className="mb-1 block text-xs text-slate-400"
                  >
                    {searchMode === 'all'
                      ? 'Filter (optional)'
                      : searchMode === 'name'
                        ? 'Name contains'
                        : 'Barangay contains'}
                  </label>
                  <input
                    id="rider-search-text"
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                <tr>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Barangay</th>
                  <th className="px-3 py-3">Availability</th>
                  <th className="px-3 py-3">Account status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No riders match your search.
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((r) => (
                    <tr
                      key={r.id}
                      className={rowClass(r.id)}
                      onClick={() => openDetails(r)}
                    >
                      <td className="px-3 py-3 font-medium text-white">
                        {r.name}
                      </td>
                      <td className="px-3 py-3 text-slate-200">{r.phone}</td>
                      <td className="px-3 py-3 text-slate-200">{r.email}</td>
                      <td className="px-3 py-3 text-slate-200">{r.barangay}</td>
                      <td className="px-3 py-3 text-slate-200">
                        {r.availability}
                      </td>
                      <td className="px-3 py-3 text-slate-200">
                        {r.accountStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleActivate}
              disabled={!selectedId}
              className="rounded-xl border border-emerald-400/50 bg-emerald-800/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={!selectedId}
              className="rounded-xl border border-amber-400/50 bg-amber-900/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="rounded-xl border border-violet-400/50 bg-violet-700/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600/50"
            >
              Add new rider
            </button>
            <button
              type="button"
              onClick={openEdit}
              disabled={!selectedId}
              title="Update rider information"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PencilIcon />
              <span className="sr-only">Edit rider</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl border border-slate-400/40 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700/60"
            >
              Print
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Print-only: registered riders list */}
      <div className="hidden print:block print:bg-white print:text-black">
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold">
            Shaw&apos;s Delivery — Registered riders
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Generated {new Date().toLocaleString()}
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-2 text-left font-semibold">Name</th>
                <th className="p-2 text-left font-semibold">Phone</th>
                <th className="p-2 text-left font-semibold">Email</th>
                <th className="p-2 text-left font-semibold">Barangay</th>
                <th className="p-2 text-left font-semibold">Availability</th>
                <th className="p-2 text-left font-semibold">Account status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders.map((r) => (
                <tr key={r.id} className="border-b border-gray-300">
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.phone}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.barangay}</td>
                  <td className="p-2">{r.availability}</td>
                  <td className="p-2">{r.accountStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detailsOpen && selectedRider ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 print:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rider-detail-title"
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="rider-detail-title"
              className="mb-4 text-lg font-semibold text-white"
            >
              Rider details
            </h2>
            <dl className="space-y-3 text-sm">
              <DetailItem label="Name" value={selectedRider.name} />
              <DetailItem label="Phone" value={selectedRider.phone} />
              <DetailItem label="Email" value={selectedRider.email} />
              <DetailItem label="Barangay" value={selectedRider.barangay} />
              <DetailItem
                label="Availability"
                value={selectedRider.availability}
              />
              <DetailItem
                label="Account status"
                value={selectedRider.accountStatus}
              />
            </dl>
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/system/riders/${selectedRider.id}/history`)
              }
              className="mt-6 w-full rounded-xl border border-violet-400/50 bg-violet-700/50 py-3 text-sm font-semibold text-white transition hover:bg-violet-600/60"
            >
              Rider history
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

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 print:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setFormOpen(false)}
        >
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              {formMode === 'add' ? 'Add new rider' : 'Edit rider'}
            </h2>
            <div className="space-y-3">
              <Field
                label="Name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                required
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                required
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
              />
              <Field
                label="Barangay"
                value={form.barangay}
                onChange={(v) => setForm((f) => ({ ...f, barangay: v }))}
                required
              />
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                  Availability
                </label>
                <select
                  value={form.availability}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, availability: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                >
                  {AVAILABILITY.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                  Account status
                </label>
                <select
                  value={form.accountStatus}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, accountStatus: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                >
                  {ACCOUNT_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formMode === 'add' ? (
              <p className="mt-4 text-xs text-slate-400">
                Password is set automatically to <strong className="text-slate-200">123</strong>.
              </p>
            ) : null}
            {formError ? (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 py-2.5 text-sm font-medium text-white"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl border border-emerald-400/50 bg-emerald-700/50 py-2.5 text-sm font-semibold text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
        {label}
      </dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
      />
    </div>
  )
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
