import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminBackdrop } from '../components/admin/AdminBackdrop.jsx'
import { AdminSubHeader } from '../components/admin/AdminSubHeader.jsx'
import {
  getAdminPassword,
  setAdminPassword,
} from '../data/staffUsersStorage.js'

export default function AdminMyAccount() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleChangePassword = (e) => {
    e.preventDefault()
    setMessage(null)
    setError(null)

    const stored = getAdminPassword()
    if (currentPassword !== stored) {
      setError('Current password is incorrect.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }

    setAdminPassword(newPassword)
    setMessage('Password updated successfully.')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const goToLogin = () => {
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <AdminBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <AdminSubHeader title="Account settings — My account" />
        <div className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-6">
          <p className="mb-6 text-sm text-slate-400">
            <Link
              to="/admin/account"
              className="text-violet-300 underline-offset-2 hover:underline"
            >
              ← Account settings
            </Link>
          </p>

          <section className="rounded-2xl border border-white/15 bg-slate-950/55 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <h2 className="mb-1 text-lg font-semibold text-white">
              Change password
            </h2>
            <p className="mb-6 text-sm text-slate-400">
              Update the password you use to sign in to the admin panel.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-violet-200/90"
                >
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-violet-200/90"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2.5 text-sm text-white"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-violet-200/90"
                >
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-slate-900/90 px-3 py-2.5 text-sm text-white"
                  required
                  minLength={6}
                />
              </div>

              {error ? (
                <p className="text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="text-sm text-emerald-300" role="status">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-xl border border-violet-400/50 bg-violet-700/50 py-3 text-sm font-semibold text-white transition hover:bg-violet-600/60"
              >
                Change password
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-3 text-sm text-slate-400">
                Finished? Return to the admin login screen to sign in again.
              </p>
              <button
                type="button"
                onClick={goToLogin}
                className="w-full rounded-xl border border-white/25 bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Back to login
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
