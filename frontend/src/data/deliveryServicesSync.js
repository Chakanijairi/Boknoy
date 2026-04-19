import { loadCustomersState } from './customersStorage.js'
import { loadDeliveryServices, saveDeliveryServices } from './deliveryServicesStorage.js'

export const DELIVERY_SERVICES_UPDATED_EVENT = 'shaws-delivery-services-updated'

function notify() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(DELIVERY_SERVICES_UPDATED_EVENT))
}

function formatLiveDate(ts) {
  if (ts == null || Number.isNaN(Number(ts))) return '—'
  return new Date(ts).toISOString().slice(0, 10)
}

function resolveCustomerName(customerId) {
  if (!customerId) return 'Customer'
  const { customers } = loadCustomersState()
  const c = customers.find((x) => x.id === customerId)
  const n = c?.name?.trim()
  return n || 'Customer'
}

function formatAmount(amt) {
  if (amt == null || amt === '') return '—'
  const s = String(amt).trim()
  if (s === '—') return '—'
  if (s.startsWith('₱')) return s
  return `₱${s}`
}

function formatFeedback(fb) {
  if (!fb) return '—'
  if (typeof fb === 'object' && fb.rating != null) {
    const c = fb.comment?.trim()
    return `${fb.rating}★${c ? ` — ${c}` : ''}`
  }
  return '—'
}

function liveOrderToRow(order, statusLabel) {
  return {
    orderId: order.orderRef,
    sourceOrderId: order.id,
    date: formatLiveDate(
      order.completedAt ?? order.assignedAt ?? order.createdAt,
    ),
    customerName: resolveCustomerName(order.customerId),
    serviceType: order.serviceType ?? '—',
    orderDetails: order.details ?? '—',
    paymentType: order.paymentType ?? '—',
    amount: formatAmount(order.amount),
    orderAddress: order.address ?? '—',
    riderName: order.riderName ?? '—',
    feedback: formatFeedback(order.feedback),
    status: statusLabel,
  }
}

/** Push/update admin Delivery services row: Pending (placed), In transit (accepted), Completed, Cancelled. */
export function upsertAdminDeliveryFromLiveOrder(order, statusLabel) {
  if (!order?.id || !order.orderRef) return
  const rows = loadDeliveryServices()
  const next = liveOrderToRow(order, statusLabel)
  const idx = rows.findIndex((r) => r.sourceOrderId === order.id)
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], ...next }
  } else {
    rows.unshift(next)
  }
  saveDeliveryServices(rows)
  notify()
}

/** Refresh admin row fields (e.g. feedback) without changing status label. */
export function refreshAdminDeliveryRowFromLiveOrder(order, statusLabel) {
  upsertAdminDeliveryFromLiveOrder(order, statusLabel)
}
