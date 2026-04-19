function ms(d) {
  if (!d) return null;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? null : t;
}

function orderRowToClient(r) {
  const cancellations = Array.isArray(r.rider_cancellations)
    ? r.rider_cancellations
    : [];
  const out = {
    id: r.id,
    customerId: r.customer_id,
    orderRef: r.order_ref,
    serviceType: r.service_type,
    details: r.details,
    address: r.address,
    paymentType: r.payment_type,
    amount: r.amount,
    status: r.status,
    feedback: r.feedback ?? null,
    riderName: r.rider_name,
    assignedRiderId: r.rider_id,
    declinedRiderIds: Array.isArray(r.declined_rider_ids)
      ? r.declined_rider_ids
      : [],
    assignedAt: ms(r.assigned_at),
    transitStartedAt: ms(r.transit_started_at),
    completedAt: ms(r.completed_at),
    customerLocation: r.customer_location ?? null,
    timeline: Array.isArray(r.timeline) ? r.timeline : [],
    createdAt: ms(r.created_at),
    riderCancellations: cancellations,
  };
  if (r.last_rider_cancel_at != null && r.last_rider_cancel_at !== '') {
    const raw = r.last_rider_cancel_at;
    const n = typeof raw === 'bigint' ? Number(raw) : Number(raw);
    if (!Number.isNaN(n)) out.lastRiderCancelAt = n;
  }
  return out;
}

function customerRowToAdmin(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    email: r.email,
    sex: r.sex ?? '',
    birthdate: r.birthdate ?? '',
    address: r.address ?? '',
    status: r.status ?? 'Active',
  };
}

function formatDateYmd(d) {
  if (!d) return '—';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return x.toISOString().slice(0, 10);
}

function adminDeliveryStatus(dbStatus) {
  const m = {
    pending: 'Pending',
    in_transit: 'In transit',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return m[dbStatus] ?? dbStatus;
}

function formatFeedbackCell(fb) {
  if (!fb || typeof fb !== 'object') return '—';
  if (fb.rating == null) return '—';
  const c = (fb.comment ?? '').trim();
  return `${fb.rating}★${c ? ` — ${c}` : ''}`;
}

function orderRowToAdminDeliveryRow(r) {
  const amt = r.amount;
  const amountStr =
    amt == null || String(amt).trim() === ''
      ? '—'
      : String(amt).startsWith('₱')
        ? String(amt)
        : `₱${amt}`;

  return {
    orderId: r.order_ref,
    sourceOrderId: r.id,
    date: formatYmdPriority(r.completed_at, r.assigned_at, r.created_at),
    customerName: r.customer_name ?? 'Customer',
    serviceType: r.service_type ?? '—',
    orderDetails: r.details ?? '—',
    paymentType: r.payment_type ?? '—',
    amount: amountStr,
    orderAddress: r.address ?? '—',
    riderName: r.rider_name ?? '—',
    feedback: formatFeedbackCell(r.feedback),
    status: adminDeliveryStatus(r.status),
  };
}

function formatYmdPriority(a, b, c) {
  return formatDateYmd(a || b || c);
}

function riderRowToAdmin(r) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? '',
    email: r.email,
    barangay: r.barangay ?? '',
    availability: r.availability ?? 'Available',
    accountStatus: r.account_status ?? 'Active',
    createdAt: ms(r.created_at),
  };
}

function riderRowToPublic(r) {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    phone: r.phone ?? '',
    barangay: r.barangay ?? '',
    availability: r.availability ?? 'Available',
    accountStatus: r.account_status ?? 'Active',
    createdAt: ms(r.created_at),
  };
}

function orderRowToAdminRiderHistory(r) {
  const out = {
    id: r.id,
    orderRef: r.order_ref,
    serviceType: r.service_type ?? '—',
    customerName: r.customer_name ?? '—',
    address: r.address ?? '—',
    date: formatDateYmd(r.created_at),
    details: r.details ?? '—',
    status: r.status,
  };
  if (r.last_rider_cancel_at != null && r.last_rider_cancel_at !== '') {
    const raw = r.last_rider_cancel_at;
    const n = typeof raw === 'bigint' ? Number(raw) : Number(raw);
    if (!Number.isNaN(n)) out.lastRiderCancelAt = n;
  }
  return out;
}

module.exports = {
  orderRowToClient,
  customerRowToAdmin,
  orderRowToAdminDeliveryRow,
  formatDateYmd,
  riderRowToAdmin,
  riderRowToPublic,
  orderRowToAdminRiderHistory,
};
