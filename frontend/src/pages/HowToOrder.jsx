import { useLocation, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'

const STEPS = [
  {
    n: 1,
    title: 'Choose your service',
    text: 'Pick food delivery, goods, bills payment, or another available service.',
  },
  {
    n: 2,
    title: 'Add details',
    text: 'Enter your address, items, and payment method. Double-check contact info.',
  },
  {
    n: 3,
    title: 'Confirm & pay',
    text: 'Review your order total, then confirm. You will see an order reference.',
  },
  {
    n: 4,
    title: 'Track delivery',
    text: 'Follow status updates until your rider arrives. Enjoy!',
  },
]

export default function HowToOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const backTo = location.state?.backTo

  const goBack = () => {
    if (typeof backTo === 'string' && backTo.startsWith('/')) {
      navigate(backTo)
      return
    }
    navigate(-1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader showHomeLink />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-white/90 shadow-lg"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(214,236,251,0.95) 0%, rgba(255,255,255,0.92) 50%), url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative p-6 sm:p-10">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              How to Order?
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-700 sm:text-base">
              Ordering with Shaw&apos;s Delivery is quick. Follow these steps to
              get started.
            </p>
            <ol className="mt-8 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-700 text-sm font-bold text-white shadow-md">
                    {s.n}
                  </span>
                  <div>
                    <h2 className="font-semibold text-slate-900">{s.title}</h2>
                    <p className="mt-1 text-sm text-slate-700">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-8 text-center">
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-semibold text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
          >
            Back
          </button>
        </p>
      </main>
    </div>
  )
}
