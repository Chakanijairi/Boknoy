import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'
import { loginCustomer, setCustomerSession } from '../data/customerAuth.js'

export default function UserLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await loginCustomer(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setCustomerSession(result.user)
    navigate('/customer', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-sky-200/80 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-800">Customer login</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="user-email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="user-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
              />
            </div>
            <div>
              <label
                htmlFor="user-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="user-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-sky-700"
            >
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            New customer?{' '}
            <Link
              to="/signup"
              title="Create your customer account (registration)"
              className="font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
            >
              Login
            </Link>
          </p>
          <div className="mt-5 border-t border-slate-100 pt-5 text-center">
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
