import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'
import { registerRider, setRiderSession } from '../data/riderAuth.js'

export default function RiderSignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const result = await registerRider({ name, email, password, phone })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setRiderSession({
      id: result.rider.id,
      email: result.rider.email,
      name: result.rider.name,
    })
    navigate('/rider', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ecfdf5] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-800">Rider sign up</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              autoComplete="name"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="tel"
              autoComplete="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Create rider account
            </button>
          </form>
          <p className="mt-6 text-center text-sm">
            <Link to="/rider/login" className="font-semibold text-emerald-700 underline">
              Back to rider login
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
