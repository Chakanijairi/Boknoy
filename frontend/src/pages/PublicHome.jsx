import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/public/PublicHeader.jsx'
import {
  readCustomerBanners,
  subscribeBanners,
} from '../data/customerBanners.js'

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=2400&q=85'

export default function PublicHome() {
  const [banners, setBanners] = useState(() => readCustomerBanners())

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

  return (
    <div className="flex min-h-screen flex-col bg-[#d6ecfb] text-slate-900">
      <PublicHeader />

      <section
        className="relative isolate w-full min-h-[min(78vh,720px)]"
        aria-label="Welcome"
      >
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
        <div className="relative flex min-h-[min(78vh,720px)] items-center px-6 py-16 sm:px-10 md:px-14 lg:px-20">
          <div className="max-w-3xl">
            <h1
              className="max-w-[14ch] text-left text-4xl font-bold leading-[1.12] tracking-tight text-white sm:max-w-none sm:text-5xl md:text-6xl md:leading-[1.08]"
              style={{
                textShadow:
                  '0 2px 28px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.35)',
              }}
            >
              <span className="block">Shaw&apos;s Delivery.</span>
              <span className="mt-3 block text-[1.65rem] font-semibold leading-[1.25] text-white sm:mt-4 sm:text-4xl sm:leading-[1.2] md:text-[2.75rem]">
                Making every
                <br />
                day better.
              </span>
            </h1>
            {slides && slides.length > 1 ? (
              <div
                className="mt-8 flex gap-2"
                role="tablist"
                aria-label="Hero banners"
              >
                {slides.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    role="tab"
                    aria-selected={i === slide % slides.length}
                    aria-label={`Banner ${i + 1}`}
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
        </div>
      </section>

      <main className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-10 sm:px-6">
          <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 px-8 py-4 text-center text-base font-bold uppercase tracking-widest text-white shadow-lg shadow-sky-600/30 transition hover:from-sky-500 hover:to-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#d6ecfb] sm:flex-1"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-2xl border-2 border-sky-600/40 bg-white px-8 py-4 text-center text-base font-bold uppercase tracking-widest text-sky-800 shadow-md transition hover:border-sky-500 hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#d6ecfb] sm:flex-1"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <Link
          to="/how-to-order"
          className="group relative isolate mt-2 w-full overflow-hidden shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
        >
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center transition duration-700 group-hover:scale-110"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=2400&q=85')",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/82 via-slate-900/55 to-indigo-900/45" />
          <div className="relative flex min-h-[168px] items-center justify-center px-6 py-12 sm:min-h-[200px] sm:py-14 md:min-h-[240px]">
            <span className="text-center text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] sm:text-3xl md:text-4xl">
              How to Order?
            </span>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-white/85 underline decoration-white/40 decoration-2 underline-offset-4 transition group-hover:text-white sm:left-auto sm:right-10 sm:translate-x-0 md:right-16 md:bottom-8">
              View guide →
            </span>
          </div>
        </Link>

        <section className="mx-auto mt-14 w-full max-w-2xl px-4 pb-12 sm:px-6">
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-slate-600">
            Explore
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/about"
              className="rounded-2xl border border-sky-200/80 bg-white/80 p-6 text-center shadow-md backdrop-blur-sm transition hover:border-sky-300 hover:bg-white hover:shadow-lg"
            >
              <span className="text-lg font-bold text-slate-800">ABOUT US</span>
              <p className="mt-2 text-sm text-slate-600">
                Our story, mission, and how we serve your area.
              </p>
            </Link>
            <Link
              to="/contact"
              className="rounded-2xl border border-sky-200/80 bg-white/80 p-6 text-center shadow-md backdrop-blur-sm transition hover:border-sky-300 hover:bg-white hover:shadow-lg"
            >
              <span className="text-lg font-bold text-slate-800">
                CONTACT US
              </span>
              <p className="mt-2 text-sm text-slate-600">
                Reach our team for support and inquiries.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
