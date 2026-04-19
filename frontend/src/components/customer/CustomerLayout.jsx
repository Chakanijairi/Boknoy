import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import riderArt from '../../assets/boknoy-rider.svg'
import {
  clearCustomerSession,
  getCustomerSession,
} from '../../data/customerAuth.js'

const NAV = [
  { to: '/customer', label: 'Home', end: true },
  { to: '/customer/delivery', label: 'Delivery' },
  { to: '/customer/orders', label: 'Orders' },
  { to: '/customer/about', label: 'About' },
  { to: '/customer/contact', label: 'Contact' },
  { to: '/customer/feedback', label: 'Feedback' },
  { to: '/customer/account', label: 'My account' },
]

export function CustomerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getCustomerSession()

  const logout = () => {
    clearCustomerSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-sky-200/80 bg-gradient-to-r from-[#0a1628] via-[#152a52] to-[#4c1d95] shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/customer" className="flex items-center gap-2 text-white">
            <img
              src={riderArt}
              alt=""
              className="h-10 w-auto sm:h-12"
              width={48}
              height={53}
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold sm:text-base">
                Shaw&apos;s Delivery
              </div>
              <div className="max-w-[200px] truncate text-xs text-sky-100/90">
                {session?.name}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
          >
            Log out
          </button>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto border-t border-white/10 px-2 py-2 sm:px-4"
          aria-label="Customer modules"
        >
          {NAV.map((item) => {
            const active = item.end
              ? location.pathname === item.to
              : location.pathname === item.to ||
                (item.to !== '/customer' &&
                  location.pathname.startsWith(`${item.to}/`))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-sky-100/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
