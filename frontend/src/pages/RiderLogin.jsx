import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'
import { loginRider, setRiderSession } from '../data/riderAuth.js'

export default function RiderLogin() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await loginRider(login, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setRiderSession(result.rider)
    navigate('/rider', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ecfdf5] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-800">Rider login</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="rider-login"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email or phone
              </label>
              <input
                id="rider-login"
                type="text"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-emerald-300 focus:border-emerald-500 focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="rider-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="rider-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-emerald-300 focus:border-emerald-500 focus:ring-2"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-700"
            >
              Login
            </button>
          </form>
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              ← Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
