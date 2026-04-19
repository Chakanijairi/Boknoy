import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import riderArt from '../../assets/boknoy-rider.svg'
import { clearRiderSession, getRiderSession } from '../../data/riderAuth.js'

const NAV = [
  { to: '/rider', label: 'Home', end: true },
  { to: '/rider/deliveries', label: 'Deliveries' },
  { to: '/rider/about', label: 'About' },
  { to: '/rider/contact', label: 'Contact' },
  { to: '/rider/account', label: 'My account' },
]

export function RiderLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getRiderSession()

  const logout = () => {
    clearRiderSession()
    navigate('/rider/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#ecfdf5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-emerald-200/80 bg-gradient-to-r from-[#0a1628] via-[#14532d] to-[#1e3a5f] shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/rider" className="flex items-center gap-2 text-white">
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
              <div className="text-xs text-emerald-100/90">Rider</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[140px] truncate text-xs text-emerald-100/90 sm:inline">
              {session?.name}
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
            >
              Log out
            </button>
          </div>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto border-t border-white/10 px-2 py-2 sm:px-4"
          aria-label="Rider modules"
        >
          {NAV.map((item) => {
            const active = item.end
              ? location.pathname === item.to
              : location.pathname === item.to ||
                (item.to !== '/rider' &&
                  location.pathname.startsWith(`${item.to}/`))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
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
