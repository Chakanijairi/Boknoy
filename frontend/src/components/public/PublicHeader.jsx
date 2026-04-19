import { Link } from 'react-router-dom'
import riderArt from '../../assets/boknoy-rider.svg'

export function PublicHeader({ showHomeLink = false }) {
  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-indigo-950/30">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#0a1628] via-[#152a52] to-[#4c1d95] px-4 py-3 sm:px-6 sm:py-4">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 text-white transition hover:opacity-95"
        >
          <img
            src={riderArt}
            alt=""
            className="h-11 w-auto shrink-0 drop-shadow-md sm:h-14"
            width={56}
            height={62}
          />
          <span className="truncate text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
            Shaw&apos;s Delivery
          </span>
        </Link>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {showHomeLink ? (
            <Link
              to="/"
              className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
            >
              Home
            </Link>
          ) : null}
          <Link
            to="/rider/login"
            className="rounded-lg border border-emerald-300/45 bg-emerald-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-100 shadow-sm transition hover:bg-emerald-500/35 sm:px-4 sm:text-sm"
          >
            Rider
          </Link>
          <Link
            to="/admin/login"
            className="rounded-lg border border-amber-300/40 bg-amber-500/20 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-100 shadow-sm transition hover:bg-amber-500/35 sm:px-4 sm:text-sm"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
}
