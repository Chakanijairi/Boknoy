import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminEmail, getAdminPassword } from '../data/staffUsersStorage.js'

const pastelHeader =
  'bg-[#d6ecfb] border-b border-sky-200/80 text-slate-800 shadow-sm'
const pastelFooter =
  'bg-[#d6ecfb] border-t border-sky-200/80 text-slate-800 shadow-sm'

function isValidGmailShape(value) {
  const v = value.trim()
  if (!v) return false
  // Loose email check; label says "Gmail" but accept standard email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const [gmail, setGmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (!isValidGmailShape(gmail)) {
      setError('Enter a valid Gmail / email address.')
      return
    }
    const emailOk =
      gmail.trim().toLowerCase() === getAdminEmail().trim().toLowerCase()
    const passwordOk = password === getAdminPassword()
    if (!emailOk || !passwordOk) {
      setError('Invalid Gmail or password.')
      return
    }
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header
        className={`shrink-0 px-6 py-4 sm:px-10 sm:py-5 ${pastelHeader}`}
      >
        <h1 className="text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
          Shaw&apos;s Delivery Admin Web Panel
        </h1>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 shadow-lg shadow-sky-100/50 sm:p-10">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Log in
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-gmail"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Gmail
              </label>
              <input
                id="admin-gmail"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Shaw@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-sky-300 transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm text-slate-900 outline-none ring-sky-300 transition focus:border-sky-400 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-lg text-slate-600 transition hover:bg-sky-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <span aria-hidden>👁️</span>
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md shadow-sky-200 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              Login
            </button>

            <div className="text-center">
              <Link
                to="/admin/forgot-password"
                className="text-sm font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-900"
              >
                Forgot Password
              </Link>
            </div>

            <div className="border-t border-slate-100 pt-5 text-center">
              <Link
                to="/"
                className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900"
              >
                ← Back to home
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer
        className={`mt-auto shrink-0 px-6 py-4 sm:px-10 ${pastelFooter}`}
      >
        <p className="text-center text-sm font-medium text-slate-700 sm:text-base">
          Shaw&apos;s Delivery — Admin Web Panel
        </p>
      </footer>
    </div>
  )
}
