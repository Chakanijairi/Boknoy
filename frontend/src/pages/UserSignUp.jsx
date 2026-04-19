import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'
import { registerCustomer, setCustomerSession } from '../data/customerAuth.js'
import { CUSTOMER_SEX } from '../data/customersSeed.js'

function isValidEmail(value) {
  const v = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function UserSignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sex, setSex] = useState(CUSTOMER_SEX[0])
  const [birthdate, setBirthdate] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (phone.trim().length < 7) {
      setError('Please enter a valid phone number.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!birthdate) {
      setError('Please select your birthdate.')
      return
    }
    if (address.trim().length < 5) {
      setError('Please enter your complete address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const result = await registerCustomer({
      name,
      phone,
      email,
      sex,
      birthdate,
      address,
      password,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setCustomerSession({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
    })
    navigate('/customer', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-sky-200/80 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-800">Create account</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="signup-name"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="signup-phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+63 9XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="signup-sex"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Sex
              </label>
              <select
                id="signup-sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
              >
                {CUSTOMER_SEX.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="signup-birthdate"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Birthdate
              </label>
              <input
                id="signup-birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="signup-address"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Address
              </label>
              <textarea
                id="signup-address"
                autoComplete="street-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, barangay, city"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="signup-password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none ring-sky-300 focus:border-sky-400 focus:ring-2"
                required
                minLength={6}
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
              Create account
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
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
