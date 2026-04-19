import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  readCustomerBanners,
  subscribeBanners,
} from '../data/customerBanners.js'
import { getCustomerSession } from '../data/customerAuth.js'
import { createOrder, getOrdersForCustomer } from '../data/customerOrders.js'

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=2400&q=85'

const SERVICE_TYPES = [
  'Food delivery',
  'Goods',
  'Bills payment',
  'Other',
]

export default function CustomerDeliveryServices() {
  const session = getCustomerSession()
  const [banners, setBanners] = useState(() => readCustomerBanners())
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0])
  const [details, setDetails] = useState('')
  const [address, setAddress] = useState('')
  const [paymentType, setPaymentType] = useState('GCash')
  const [amount, setAmount] = useState('')
  const [customerLocation, setCustomerLocation] = useState(null)
  const [locNote, setLocNote] = useState(null)
  const [msg, setMsg] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const sync = () => setBanners(readCustomerBanners())
    return subscribeBanners(sync)
  }, [])

  const slides = useMemo(() => {
    const s = banners.filter((b) => b?.src)
    return s.length > 0 ? s : null
  }, [banners])
  const [slide, setSlide] = useState(0)
  const count = slides?.length ?? 0

  useEffect(() => {
    setSlide(0)
  }, [count])

  useEffect(() => {
    if (!slides || slides.length <= 1) return
    const t = window.setInterval(() => {
      setSlide((i) => (i + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(t)
  }, [slides])

  const activeSrc =
    slides && slides.length > 0
      ? slides[slide % slides.length].src
      : HERO_FALLBACK

  useEffect(() => {
    if (!session) return
    let cancelled = false
    getOrdersForCustomer(session.id).then((list) => {
      if (!cancelled) setRecent(list.slice(0, 3))
    })
    return () => {
      cancelled = true
    }
  }, [session])

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!session) return
    if (!details.trim() || !address.trim()) {
      setMsg({ type: 'err', text: 'Please fill in order details and address.' })
      return
    }
    const result = await createOrder(session.id, {
      serviceType,
      details: details.trim(),
      address: address.trim(),
      paymentType,
      amount: amount.trim() || '—',
      customerLocation,
    })
    if (!result.ok) {
      setMsg({
        type: 'err',
        text: result.error ?? 'Could not submit order. Is the API server running?',
      })
      return
    }
    const order = result.order
    setDetails('')
    setAddress('')
    setAmount('')
    setMsg({
      type: 'ok',
      text: `Request sent (${order.orderRef}).`,
    })
    const list = await getOrdersForCustomer(session.id)
    setRecent(list.slice(0, 3))
  }

  return (
    <div className="space-y-8">
      <section
        className="relative isolate -mx-4 w-[calc(100%+2rem)] overflow-hidden shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
        aria-label="Promotional banners"
      >
        <div className="relative w-full min-h-[min(39vh,360px)]">
          {slides && slides.length > 1 ? (
            slides.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 bg-cover bg-[center_30%] transition-opacity duration-700 sm:bg-center ${
                  i === slide % slides.length ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${JSON.stringify(b.src)})`,
                }}
                aria-hidden={i !== slide}
              />
            ))
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-[center_30%] sm:bg-center"
              style={{
                backgroundImage: `url(${JSON.stringify(activeSrc)})`,
              }}
              aria-hidden
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15 sm:from-black/65 sm:via-black/25 sm:to-transparent"
            aria-hidden
          />
          {slides && slides.length > 1 ? (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Banner slides"
            >
              {slides.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === slide % slides.length}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === slide % slides.length
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/how-to-order"
            state={{ backTo: '/customer/delivery' }}
            className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            How to order
          </Link>
        </div>

        <section className="rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-md sm:p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <p className="text-sm font-medium text-slate-800">
                Drop-off location (optional)
              </p>
              <button
                type="button"
                onClick={() => {
                  setLocNote(null)
                  if (!navigator.geolocation) {
                    setLocNote({
                      type: 'err',
                      text: 'Location not supported in this browser.',
                    })
                    return
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setCustomerLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      })
                      setLocNote({
                        type: 'ok',
                        text: 'Location attached to this request.',
                      })
                    },
                    () => {
                      setLocNote({
                        type: 'err',
                        text: 'Permission denied or unavailable.',
                      })
                    },
                    { enableHighAccuracy: true, timeout: 12_000 },
                  )
                }}
                className="mt-3 rounded-lg border border-sky-400 bg-white px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50"
              >
                Use my current location
              </button>
              {customerLocation ? (
                <p className="mt-2 text-xs text-slate-600">
                  Pin: {customerLocation.lat.toFixed(5)},{' '}
                  {customerLocation.lng.toFixed(5)}{' '}
                  <button
                    type="button"
                    className="font-semibold text-red-600"
                    onClick={() => {
                      setCustomerLocation(null)
                      setLocNote(null)
                    }}
                  >
                    Clear
                  </button>
                </p>
              ) : null}
              {locNote ? (
                <p
                  className={`mt-2 text-xs ${
                    locNote.type === 'ok' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {locNote.text}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Service type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                What do you need?
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="e.g. 2 meals from Grill House, or Meralco bill payment"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Delivery / service address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, barangay, city"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                >
                  <option value="GCash">GCash</option>
                  <option value="COD">COD</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Amount (optional)
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₱0.00"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              </div>
            </div>
            {msg ? (
              <p
                className={
                  msg.type === 'ok'
                    ? 'text-sm text-emerald-700'
                    : 'text-sm text-red-600'
                }
                role="status"
              >
                {msg.text}
              </p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-700 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:from-sky-500 hover:to-indigo-600"
            >
              Send to rider queue
            </button>
          </form>
        </section>

        {recent.length > 0 ? (
          <section>
            <ul className="space-y-2">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl border border-sky-100 bg-white/80 px-4 py-3 text-sm"
                >
                  <span className="font-semibold">{o.orderRef}</span> —{' '}
                  <span className="capitalize">
                    {o.status.replace('_', ' ')}
                  </span>{' '}
                  · {o.serviceType}
                </li>
              ))}
            </ul>
            <Link
              to="/customer/orders"
              className="mt-3 inline-block text-sm font-semibold text-sky-700 underline"
            >
              View full order history
            </Link>
          </section>
        ) : null}
      </div>
    </div>
  )
}
