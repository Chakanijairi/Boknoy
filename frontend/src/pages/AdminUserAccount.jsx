import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import { STAFF_ROLES } from '../data/staffUsersSeed.js'
import { loadStaffUsers, saveStaffUsers } from '../data/staffUsersStorage.js'

function newId() {
  return crypto.randomUUID?.() ?? `u-${Date.now()}`
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  role: 'IT Admin',
}

export default function AdminUserAccount() {
  const [users, setUsers] = useState(() => loadStaffUsers())
  const persist = useCallback((next) => {
    setUsers(next)
    saveStaffUsers(next)
  }, [])

  const [nameQuery, setNameQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [form, setForm] = useState(emptyForm)

  const filteredUsers = useMemo(() => {
    const q = nameQuery.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q))
  }, [users, nameQuery])

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId) ?? null,
    [users, selectedId],
  )

  const rowClass = (id) =>
    `cursor-pointer border-b border-white/10 transition hover:bg-white/10 ${
      selectedId === id ? 'bg-violet-600/25 ring-1 ring-inset ring-violet-400/40' : ''
    }`

  const openAdd = () => {
    setFormMode('add')
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = () => {
    if (!selectedUser) return
    setFormMode('edit')
    setForm({
      name: selectedUser.name,
      phone: selectedUser.phone,
      email: selectedUser.email,
      role: selectedUser.role,
    })
    setFormOpen(true)
  }

  const submitForm = (e) => {
    e.preventDefault()
    if (formMode === 'add') {
      persist([
        ...users,
        {
          id: newId(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          role: form.role,
        },
      ])
    } else if (selectedId) {
      persist(
        users.map((u) =>
          u.id === selectedId
            ? {
                ...u,
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                role: form.role,
              }
            : u,
        ),
      )
    }
    setFormOpen(false)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="Account settings — User account" />
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <p className="mb-6 text-sm text-slate-400">
            <Link
              to="/admin/account"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← Account settings
            </Link>
          </p>

          <section className="mb-6 rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-md sm:p-5">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-200">
              Search
            </h2>
            <div>
              <label
                htmlFor="staff-name-search"
                className="mb-1 block text-xs text-slate-400"
              >
                Search by name
              </label>
              <input
                id="staff-name-search"
                type="search"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="Type a name…"
                className="w-full max-w-md rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              />
            </div>
          </section>

          <div className="overflow-x-auto rounded-xl border border-white/15 bg-slate-950/55">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wider text-violet-200/90">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No personnel match this name.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className={rowClass(u.id)}
                      onClick={() => setSelectedId(u.id)}
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{u.phone}</td>
                      <td className="px-4 py-3 text-slate-200">{u.email}</td>
                      <td className="px-4 py-3 text-slate-200">{u.role}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openAdd}
              className="rounded-xl border border-violet-400/50 bg-violet-700/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600/50"
            >
              Add new personnel
            </button>
            <button
              type="button"
              onClick={openEdit}
              disabled={!selectedId}
              title="Update user information"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PencilIcon />
              <span className="sr-only">Edit user</span>
            </button>
          </div>
        </div>
      </div>

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setFormOpen(false)}
        >
          <form
            className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitForm}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              {formMode === 'add' ? 'Add new personnel' : 'Edit user'}
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
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-violet-200/90">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2 text-sm text-white"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
