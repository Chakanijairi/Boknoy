export default function RiderContact() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">Contact us</h1>
      <div className="mt-6 space-y-5 rounded-2xl border border-emerald-200/80 bg-white/95 p-6 shadow-md">
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
            className="mt-1 inline-block font-medium text-emerald-700 underline"
          >
            Shaw&apos;s Delivery (Messenger)
          </a>
        </div>
      </div>
    </div>
  )
}
