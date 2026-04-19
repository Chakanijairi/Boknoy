import { useEffect, useState } from 'react'
import { getCustomerSession } from '../data/customerAuth.js'
import {
  getOrdersForCustomer,
  setOrderFeedback,
} from '../data/customerOrders.js'

export default function CustomerFeedback() {
  const session = getCustomerSession()
  const [completed, setCompleted] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    getOrdersForCustomer(session.id).then((orders) => {
      const done = orders.filter((o) => o.status === 'completed')
      if (!cancelled) {
        setCompleted(done)
        setSelectedId((prev) => {
          if (prev && done.some((o) => o.id === prev)) return prev
          return done[0]?.id ?? ''
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [session, refresh])

  const selected = completed.find((o) => o.id === selectedId)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!session || !selectedId) return
    const ok = await setOrderFeedback(selectedId, session.id, { rating, comment })
    if (!ok) {
      setMsg({ type: 'err', text: 'Could not save feedback.' })
      return
    }
    setMsg({ type: 'ok', text: 'Thanks — your feedback was saved.' })
    setComment('')
    setRefresh((n) => n + 1)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>

      {completed.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-sky-300 bg-white/60 py-10 text-center text-slate-600">
          Complete an order first, then you can leave feedback here.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Order
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              {completed.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderRef} — {o.serviceType}
                </option>
              ))}
            </select>
          </div>

          {selected?.feedback ? (
            <div className="mt-6 rounded-2xl border border-sky-200 bg-white/90 p-5">
              <h2 className="text-sm font-bold text-slate-800">
                Your feedback
              </h2>
              <p className="mt-2 text-slate-700">
                Rating: {selected.feedback.rating} / 5
              </p>
              {selected.feedback.comment ? (
                <p className="mt-2 text-sm text-slate-600">
                  {selected.feedback.comment}
                </p>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-sky-200/80 bg-white/90 p-5 shadow-md">
            <h2 className="font-semibold text-slate-800">Add or update</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Rating
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-sm text-slate-600">{rating} / 5</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="How was your delivery?"
              />
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
              className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white hover:bg-sky-700"
            >
              Save feedback
            </button>
          </form>
        </>
      )}
    </div>
  )
}
