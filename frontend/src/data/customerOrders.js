import { apiJson } from '../api/client.js'

export async function getOrdersForCustomer(customerId) {
  const r = await apiJson(`/api/orders/customer/${customerId}`)
  if (!r.ok) return []
  return r.orders
}

export async function createOrder(customerId, payload) {
  const r = await apiJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      customerId,
      serviceType: payload.serviceType,
      details: payload.details,
      address: payload.address,
      paymentType: payload.paymentType,
      amount: payload.amount,
      customerLocation: payload.customerLocation,
    }),
  })
  if (!r.ok) return { ok: false, error: r.error }
  return { ok: true, order: r.order }
}

/** @deprecated no-op; kept for imports that still reference it */
export function tickOrderSimulations() {}

export async function getAvailableOrdersForRider(riderId) {
  const r = await apiJson(`/api/orders/available/${riderId}`)
  if (!r.ok) return []
  return r.orders
}

export async function getOrdersForRider(riderId) {
  const r = await apiJson(`/api/orders/rider/${riderId}`)
  if (!r.ok) return { orders: [], riderCancelled: [] }
  return {
    orders: Array.isArray(r.orders) ? r.orders : [],
    riderCancelled: Array.isArray(r.riderCancelled) ? r.riderCancelled : [],
  }
}

export async function riderAcceptOrder(orderId, riderId, riderDisplayName) {
  const r = await apiJson(`/api/orders/${orderId}/accept`, {
    method: 'PATCH',
    body: JSON.stringify({ riderId, riderName: riderDisplayName }),
  })
  return { ok: r.ok, error: r.error }
}

export async function riderCompleteOrder(orderId, riderId) {
  const r = await apiJson(`/api/orders/${orderId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ riderId }),
  })
  return { ok: r.ok, error: r.error }
}

/** Rider cancels active delivery: order becomes pending again and shows in Available (other riders). */
export async function riderReleaseOrder(orderId, riderId, riderName) {
  const r = await apiJson(`/api/orders/${orderId}/rider-release`, {
    method: 'PATCH',
    body: JSON.stringify({ riderId, riderName }),
  })
  return { ok: r.ok, error: r.error }
}

export async function riderDeclineOrder(orderId, riderId) {
  const r = await apiJson(`/api/orders/${orderId}/decline`, {
    method: 'PATCH',
    body: JSON.stringify({ riderId }),
  })
  return { ok: r.ok, error: r.error }
}

export async function cancelOrder(orderId, customerId) {
  const r = await apiJson(`/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ customerId }),
  })
  return r.ok
}

export async function setOrderFeedback(orderId, customerId, { rating, comment }) {
  const r = await apiJson(`/api/orders/${orderId}/feedback`, {
    method: 'PATCH',
    body: JSON.stringify({ customerId, rating, comment }),
  })
  return r.ok
}
