import { Link } from 'react-router-dom'

const pastelHeader =
  'bg-[#d6ecfb] border-b border-sky-200/80 text-slate-800 shadow-sm'
const pastelFooter =
  'bg-[#d6ecfb] border-t border-sky-200/80 text-slate-800 shadow-sm'

export default function AdminForgotPassword() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header
        className={`shrink-0 px-6 py-4 sm:px-10 sm:py-5 ${pastelHeader}`}
      >
        <h1 className="text-center text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
          Shaw&apos;s Delivery Admin Web Panel
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-sky-100 bg-white p-8 text-center shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">
            Forgot password
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Please contact your system administrator or use{' '}
            <strong>My account</strong> in the admin panel (after signing in) to
            change your password.
          </p>
          <Link
            to="/admin/login"
            className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-sky-700"
          >
            Back to login
          </Link>
          <p className="mt-5 border-t border-slate-100 pt-5">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              ← Back
            </Link>
          </p>
        </div>
      </main>

      <footer
        className={`mt-auto shrink-0 px-6 py-4 sm:px-10 ${pastelFooter}`}
      >
        <p className="text-center text-sm font-medium text-slate-700 sm:text-base">
          Shaw&apos;s Delivery — Admin Web Panel
        </p>
      </footer>
    </div>
  )
}
