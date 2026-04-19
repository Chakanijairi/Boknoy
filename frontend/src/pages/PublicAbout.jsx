import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'

const body = `Shaw's Delivery is a trusted local logistics partner focused on fast, reliable deliveries across our service areas. We connect customers with restaurants, merchants, and essential services through a simple ordering experience and professional riders.

Our mission is to move goods and services safely and on time while supporting partner businesses and the communities we serve.`

export default function PublicAbout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          About us
        </h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-sky-200/80 bg-white/90 p-6 shadow-md backdrop-blur-sm">
          {body.split('\n\n').map((p, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-slate-700 sm:text-base"
            >
              {p}
            </p>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  )
}
