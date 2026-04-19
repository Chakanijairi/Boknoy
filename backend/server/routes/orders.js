const express = require('express');
const pool = require('../config/db');
const { orderRowToClient } = require('../utils/mappers');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      serviceType,
      details,
      address,
      paymentType,
      amount,
      customerLocation,
    } = req.body ?? {};
    if (!customerId || !serviceType || !details?.trim() || !address?.trim()) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }
    const now = Date.now();
    const orderRef = `ORD-${String(now).slice(-6)}`;
    const loc =
      customerLocation &&
      typeof customerLocation.lat === 'number' &&
      typeof customerLocation.lng === 'number'
        ? JSON.stringify({
            lat: customerLocation.lat,
            lng: customerLocation.lng,
          })
        : null;
    const timeline = JSON.stringify([{ at: now, message: 'Received.' }]);
    const { rows } = await pool.query(
      `INSERT INTO orders (
        customer_id, order_ref, service_type, details, address,
        payment_type, amount, status, customer_location, timeline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8::jsonb, $9::jsonb)
      RETURNING *`,
      [
        customerId,
        orderRef,
        String(serviceType),
        String(details).trim(),
        String(address).trim(),
        paymentType ?? null,
        amount != null ? String(amount) : null,
        loc,
        timeline,
      ],
    );
    return res.json({ ok: true, order: orderRowToClient(rows[0]) });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: 'Invalid customer.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Could not create order.' });
  }
});

router.get('/customer/:customerId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.params.customerId],
    );
    return res.json({ orders: rows.map(orderRowToClient) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load orders.' });
  }
});

router.get('/available/:riderId', async (req, res) => {
  try {
    const riderId = req.params.riderId;
    const { rows } = await pool.query(
      `SELECT * FROM orders
       WHERE status = 'pending' AND rider_id IS NULL
       ORDER BY created_at ASC`,
    );
    const filtered = rows.filter((r) => {
      const declined = Array.isArray(r.declined_rider_ids)
        ? r.declined_rider_ids
        : [];
      return !declined.includes(riderId);
    });
    return res.json({ orders: filtered.map(orderRowToClient) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load orders.' });
  }
});

router.get('/rider/:riderId', async (req, res) => {
  try {
    const riderId = req.params.riderId;
    const { rows: assigned } = await pool.query(
      `SELECT * FROM orders WHERE rider_id = $1 ORDER BY created_at DESC`,
      [riderId],
    );
    const { rows: cancelledHistory } = await pool.query(
      `SELECT o.*,
        (
          SELECT MAX((elem->>'cancelledAt')::bigint)
          FROM jsonb_array_elements(COALESCE(o.rider_cancellations, '[]'::jsonb)) AS elem
          WHERE elem->>'riderId' = $1::text
        ) AS last_rider_cancel_at
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(COALESCE(o.rider_cancellations, '[]'::jsonb)) AS elem
         WHERE elem->>'riderId' = $1::text
       )
       ORDER BY last_rider_cancel_at DESC NULLS LAST`,
      [riderId],
    );
    return res.json({
      orders: assigned.map(orderRowToClient),
      riderCancelled: cancelledHistory.map(orderRowToClient),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load orders.' });
  }
});

router.patch('/:id/accept', async (req, res) => {
  try {
    const { riderId, riderName } = req.body ?? {};
    if (!riderId || !riderName?.trim()) {
      return res.status(400).json({ error: 'Rider id and name required.' });
    }
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (!o || o.status !== 'pending' || o.rider_id) {
      return res.status(409).json({ error: 'Order cannot be accepted.' });
    }
    const declined = Array.isArray(o.declined_rider_ids) ? o.declined_rider_ids : [];
    if (declined.includes(riderId)) {
      return res.status(409).json({ error: 'Order cannot be accepted.' });
    }
    const now = Date.now();
    const timeline = Array.isArray(o.timeline) ? [...o.timeline] : [];
    timeline.push({
      at: now,
      message: 'Assigned.',
    });
    const { rows: updated } = await pool.query(
      `UPDATE orders SET
        rider_id = $1,
        rider_name = $2,
        assigned_at = NOW(),
        status = 'in_transit',
        timeline = $3::jsonb
      WHERE id = $4 AND status = 'pending' AND rider_id IS NULL
      RETURNING *`,
      [riderId, riderName.trim(), JSON.stringify(timeline), req.params.id],
    );
    if (!updated[0]) {
      return res.status(409).json({ error: 'Order cannot be accepted.' });
    }
    return res.json({ ok: true, order: orderRowToClient(updated[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Accept failed.' });
  }
});

router.patch('/:id/decline', async (req, res) => {
  try {
    const { riderId } = req.body ?? {};
    if (!riderId) return res.status(400).json({ error: 'Rider id required.' });
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (!o || o.status !== 'pending' || o.rider_id) {
      return res.status(409).json({ error: 'Order cannot be declined.' });
    }
    const declined = Array.isArray(o.declined_rider_ids) ? [...o.declined_rider_ids] : [];
    if (!declined.includes(riderId)) declined.push(riderId);
    await pool.query(
      `UPDATE orders SET declined_rider_ids = $1::jsonb WHERE id = $2`,
      [JSON.stringify(declined), req.params.id],
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Decline failed.' });
  }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const { riderId } = req.body ?? {};
    if (!riderId) return res.status(400).json({ error: 'Rider id required.' });
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (!o || o.rider_id !== riderId) {
      return res.status(409).json({ error: 'Order cannot be completed.' });
    }
    if (o.status === 'completed' || o.status === 'cancelled') {
      return res.status(409).json({ error: 'Order cannot be completed.' });
    }
    if (o.status !== 'pending' && o.status !== 'in_transit') {
      return res.status(409).json({ error: 'Order cannot be completed.' });
    }
    const now = Date.now();
    const timeline = Array.isArray(o.timeline) ? [...o.timeline] : [];
    timeline.push({
      at: now,
      message: 'Completed.',
    });
    const { rows: updated } = await pool.query(
      `UPDATE orders SET
        status = 'completed',
        completed_at = NOW(),
        timeline = $1::jsonb
      WHERE id = $2 AND rider_id = $3
      RETURNING *`,
      [JSON.stringify(timeline), req.params.id, riderId],
    );
    if (!updated[0]) {
      return res.status(409).json({ error: 'Order cannot be completed.' });
    }
    return res.json({ ok: true, order: orderRowToClient(updated[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Complete failed.' });
  }
});

/** Rider drops an active job: stored as rider-cancelled in timeline, status → pending, back in Available (other riders). */
router.patch('/:id/rider-release', async (req, res) => {
  try {
    const { riderId } = req.body ?? {};
    if (!riderId) return res.status(400).json({ error: 'Rider id required.' });
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (!o || o.rider_id !== riderId) {
      return res.status(409).json({ error: 'Order cannot be released.' });
    }
    if (o.status === 'completed' || o.status === 'cancelled') {
      return res.status(409).json({ error: 'Order cannot be released.' });
    }
    if (o.status !== 'pending' && o.status !== 'in_transit') {
      return res.status(409).json({ error: 'Order cannot be released.' });
    }
    const now = Date.now();
    const timeline = Array.isArray(o.timeline) ? [...o.timeline] : [];
    const riderName =
      (req.body?.riderName && String(req.body.riderName).trim()) ||
      o.rider_name ||
      'Rider';
    timeline.push({
      at: now,
      message: 'Released.',
    });
    const cancellations = Array.isArray(o.rider_cancellations)
      ? [...o.rider_cancellations]
      : [];
    cancellations.push({
      riderId,
      riderName: String(riderName).trim(),
      cancelledAt: now,
    });
    const { rows: updated } = await pool.query(
      `UPDATE orders SET
        status = 'pending',
        rider_id = NULL,
        rider_name = NULL,
        assigned_at = NULL,
        rider_cancellations = $1::jsonb,
        timeline = $2::jsonb
      WHERE id = $3 AND rider_id = $4
      RETURNING *`,
      [
        JSON.stringify(cancellations),
        JSON.stringify(timeline),
        req.params.id,
        riderId,
      ],
    );
    if (!updated[0]) {
      return res.status(409).json({ error: 'Order cannot be released.' });
    }
    return res.json({ ok: true, order: orderRowToClient(updated[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Release failed.' });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const { customerId } = req.body ?? {};
    if (!customerId) return res.status(400).json({ error: 'Customer id required.' });
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (
      !o ||
      o.customer_id !== customerId ||
      o.status !== 'pending' ||
      o.rider_id
    ) {
      return res.status(409).json({ error: 'Order cannot be cancelled.' });
    }
    const now = Date.now();
    const timeline = Array.isArray(o.timeline) ? [...o.timeline] : [];
    timeline.push({ at: now, message: 'Cancelled.' });
    const { rows: updated } = await pool.query(
      `UPDATE orders SET status = 'cancelled', timeline = $1::jsonb WHERE id = $2 RETURNING *`,
      [JSON.stringify(timeline), req.params.id],
    );
    return res.json({ ok: true, order: orderRowToClient(updated[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Cancel failed.' });
  }
});

router.patch('/:id/feedback', async (req, res) => {
  try {
    const { customerId, rating, comment } = req.body ?? {};
    if (!customerId) return res.status(400).json({ error: 'Customer id required.' });
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ error: 'Rating must be 1–5.' });
    }
    const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [
      req.params.id,
    ]);
    const o = rows[0];
    if (!o || o.customer_id !== customerId || o.status !== 'completed') {
      return res.status(409).json({ error: 'Feedback not allowed for this order.' });
    }
    const fb = {
      rating: Math.round(r),
      comment: (comment ?? '').trim(),
      at: Date.now(),
    };
    const { rows: updated } = await pool.query(
      `UPDATE orders SET feedback = $1::jsonb WHERE id = $2 RETURNING *`,
      [JSON.stringify(fb), req.params.id],
    );
    return res.json({ ok: true, order: orderRowToClient(updated[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not save feedback.' });
  }
});

module.exports = router;
