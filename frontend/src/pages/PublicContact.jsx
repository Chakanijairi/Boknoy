import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'

export default function PublicContact() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          Contact us
        </h1>
        <div className="mt-6 space-y-4 rounded-2xl border border-sky-200/80 bg-white/90 p-6 shadow-md backdrop-blur-sm">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Address
            </h2>
            <p className="mt-1 text-slate-800">
              Shaw&apos;s Delivery HQ, Metro Business District, Philippines
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phone
            </h2>
            <p className="mt-1 text-slate-800">+63 (2) 8123-4567</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Messenger
            </h2>
            <a
              href="https://m.me/shawsdelivery"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
            >
              Shaw&apos;s Delivery (Messenger)
            </a>
          </div>
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
