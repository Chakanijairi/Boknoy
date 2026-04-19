import { Link, useNavigate } from 'react-router-dom'
import riderArt from '../assets/boknoy-rider.svg'

const MODULES = [
  { id: 'delivery', label: 'DELIVERY SERVICES', to: '/admin/delivery' },
  { id: 'customers', label: 'CUSTOMERS', to: '/admin/customers' },
  { id: 'about', label: 'ABOUT US', to: '/admin/about' },
  { id: 'contact', label: 'CONTACT US', to: '/admin/contact' },
  { id: 'system', label: 'SYSTEM SETTINGS', to: '/admin/system' },
  { id: 'account', label: 'ACCOUNT SETTINGS', to: '/admin/account' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const adminName = 'IT Administrator'

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      {/* Full-page rider illustration background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${riderArt})` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-950/88 via-indigo-950/82 to-violet-950/90 backdrop-blur-[1px]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="shadow-lg shadow-indigo-950/50">
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#071229] via-[#152a52] to-[#4c1d95] px-5 py-4 sm:gap-6 sm:px-8 sm:py-5">
            <img
              src={riderArt}
              alt=""
              className="h-16 w-auto shrink-0 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:h-24"
              width={96}
              height={106}
            />
            <h1 className="font-semibold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
              Shaw&apos;s Delivery Admin Web Panel
            </h1>
          </div>
        </header>

        <section className="border-b border-white/10 bg-slate-950/50 px-4 py-3 backdrop-blur-sm sm:px-8 sm:py-4">
          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:gap-5">
            <div className="text-right">
              <p className="text-sm text-slate-200 sm:text-base md:text-lg">
                Welcome,{' '}
                <span className="font-semibold text-white">{adminName}</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                IT Admin — choose a module below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/login', { replace: true })}
              className="shrink-0 rounded-xl border border-red-400/40 bg-red-950/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-red-100 shadow-md transition hover:border-red-300/60 hover:bg-red-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:px-6 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </section>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:max-w-2xl sm:gap-4 md:max-w-3xl md:gap-5">
            {MODULES.map((m) => (
              <Link
                key={m.id}
                to={m.to}
                className="group flex min-h-[5.5rem] items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-6 text-center text-xs font-bold uppercase leading-snug tracking-wider text-white shadow-xl backdrop-blur-md transition hover:border-violet-300/40 hover:bg-white/18 hover:shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:min-h-[6.5rem] sm:px-5 sm:text-sm md:text-base"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
