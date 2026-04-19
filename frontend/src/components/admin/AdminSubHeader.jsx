import { Link } from 'react-router-dom'

export function AdminSubHeader({ title }) {
  return (
    <header className="relative z-10 shadow-lg shadow-indigo-950/50">
      <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-[#071229] via-[#152a52] to-[#4c1d95] px-5 py-4 sm:gap-4 sm:px-8">
        <Link
          to="/admin"
          className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/95 transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          ← Admin home
        </Link>
        <span className="hidden text-white/30 sm:inline" aria-hidden>
          |
        </span>
        <h1 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h1>
      </div>
    </header>
  )
}
