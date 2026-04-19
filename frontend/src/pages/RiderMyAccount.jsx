import { useEffect, useState } from 'react'
import {
  fetchRiderRecord,
  getRiderSession,
  updateRiderPassword,
} from '../data/riderAuth.js'

export default function RiderMyAccount() {
  const session = getRiderSession()
  const [record, setRecord] = useState(null)
  const [loadErr, setLoadErr] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchRiderRecord(session.id).then((r) => {
      if (cancelled) return
      if (!r) setLoadErr('Could not load rider account. Is the API server running?')
      else setRecord(r)
    })
    return () => {
      cancelled = true
    }
  }, [session])

  if (!session) {
    return <p className="text-slate-600">Could not load rider account.</p>
  }
  if (loadErr) {
    return <p className="text-red-600">{loadErr}</p>
  }
  if (!record) {
    return <p className="text-slate-600">Loading…</p>
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (newPassword.length < 6) {
      setMsg({ type: 'err', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'err', text: 'New passwords do not match.' })
      return
    }
    const result = await updateRiderPassword(
      session.id,
      currentPassword,
      newPassword,
    )
    if (!result.ok) {
      setMsg({
        type: 'err',
        text: result.error ?? 'Could not update password.',
      })
      return
    }
    setMsg({ type: 'ok', text: 'Password updated.' })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-800">My account</h1>
      <p className="mt-1 text-sm text-slate-600">
        {record.email}
        {record.phone ? ` · ${record.phone}` : ''}
        {record.barangay ? ` · ${record.barangay}` : ''}
      </p>
      <form
        onSubmit={savePassword}
        className="mt-6 space-y-4 rounded-2xl border border-emerald-200/80 bg-white/95 p-6 shadow-md"
      >
        <h2 className="font-semibold text-slate-800">Change password</h2>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
        {msg ? (
          <p
            className={
              msg.type === 'ok' ? 'text-sm text-emerald-700' : 'text-sm text-red-600'
            }
          >
            {msg.text}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Update password
        </button>
      </form>
    </div>
  )
}
