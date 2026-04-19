const body = `Shaw's Delivery is a trusted local logistics partner focused on fast, reliable deliveries across our service areas. We connect customers with restaurants, merchants, and essential services through a simple ordering experience and professional riders.

Our mission is to move goods and services safely and on time while supporting partner businesses and the communities we serve. Shaw's Delivery invests in rider training, responsive customer support, and technology that keeps every delivery transparent from pickup to drop-off.

Whether you need meals, groceries, bills payment assistance, or other delivery needs, Shaw's Delivery is built to serve you with care and consistency.`

export default function RiderAbout() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">About us</h1>
      <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200/80 bg-white/95 p-6 shadow-md">
        {body.split('\n\n').map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-slate-700 sm:text-base">
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
