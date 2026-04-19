const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { ADMIN_RIDER_DEFAULT_PASSWORD } = require('../constants/riderAuth');
const { isUuid } = require('../utils/uuidParam');
const { riderPhoneDigits } = require('../utils/riderPhone');
const {
  customerRowToAdmin,
  orderRowToAdminDeliveryRow,
  riderRowToAdmin,
  orderRowToAdminRiderHistory,
} = require('../utils/mappers');

const router = express.Router();

router.get('/customers', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, phone, email, sex, birthdate, address, status
       FROM customers ORDER BY created_at DESC`,
    );
    return res.json({ customers: rows.map(customerRowToAdmin) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load customers.' });
  }
});

router.get('/delivery-services', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC`,
    );
    return res.json({ rows: rows.map(orderRowToAdminDeliveryRow) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load delivery list.' });
  }
});

router.get('/riders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, phone, email, barangay, availability, account_status, created_at
       FROM riders ORDER BY created_at DESC`,
    );
    return res.json({ riders: rows.map(riderRowToAdmin) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load riders.' });
  }
});

router.post('/riders', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      barangay,
      availability,
      accountStatus,
    } = req.body ?? {};
    const e = (email ?? '').trim().toLowerCase();
    const phoneTrim = (phone ?? '').trim();
    const phoneDig = riderPhoneDigits(phoneTrim);
    if (!name?.trim() || !e || !phoneDig) {
      return res.status(400).json({
        error: 'Name, email, and phone (with digits) are required.',
      });
    }
    const { rowCount } = await pool.query(
      `SELECT 1 FROM riders
       WHERE REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = $1
       LIMIT 1`,
      [phoneDig],
    );
    if (rowCount > 0) {
      return res.status(409).json({ error: 'A rider with this phone already exists.' });
    }
    const hash = await bcrypt.hash(ADMIN_RIDER_DEFAULT_PASSWORD, 10);
    const avail = (availability ?? 'Available').trim() || 'Available';
    const acct = (accountStatus ?? 'Active').trim() || 'Active';
    const { rows } = await pool.query(
      `INSERT INTO riders (
        email, password_hash, name, phone, barangay, availability, account_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, email, barangay, availability, account_status, created_at`,
      [
        e,
        hash,
        name.trim(),
        phoneTrim,
        (barangay ?? '').trim(),
        avail,
        acct,
      ],
    );
    return res.json({
      ok: true,
      rider: riderRowToAdmin(rows[0]),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A rider with this email already exists.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Could not create rider.' });
  }
});

router.patch('/riders/:riderId', async (req, res) => {
  try {
    const riderId = req.params.riderId;
    if (!isUuid(riderId)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const {
      name,
      phone,
      email,
      barangay,
      availability,
      accountStatus,
    } = req.body ?? {};
    const { rows: cur } = await pool.query(
      `SELECT id, phone FROM riders WHERE id = $1`,
      [riderId],
    );
    if (!cur[0]) return res.status(404).json({ error: 'Rider not found.' });
    const phoneTrim = phone !== undefined ? String(phone).trim() : undefined;
    const phoneDig =
      phoneTrim !== undefined ? riderPhoneDigits(phoneTrim) : null;
    if (phoneTrim !== undefined && !phoneDig) {
      return res.status(400).json({ error: 'Phone must include digits.' });
    }
    if (phoneDig) {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM riders
         WHERE id <> $1
           AND REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = $2
         LIMIT 1`,
        [riderId, phoneDig],
      );
      if (rowCount > 0) {
        return res.status(409).json({ error: 'Another rider uses this phone.' });
      }
    }
    const e =
      email !== undefined
        ? String(email).trim().toLowerCase()
        : undefined;
    if (e === '') {
      return res.status(400).json({ error: 'Email cannot be empty.' });
    }
    const updates = [];
    const vals = [];
    let i = 1;
    if (name !== undefined) {
      updates.push(`name = $${i++}`);
      vals.push(String(name).trim());
    }
    if (phoneTrim !== undefined) {
      updates.push(`phone = $${i++}`);
      vals.push(phoneTrim);
    }
    if (e !== undefined) {
      updates.push(`email = $${i++}`);
      vals.push(e);
    }
    if (barangay !== undefined) {
      updates.push(`barangay = $${i++}`);
      vals.push(String(barangay).trim());
    }
    if (availability !== undefined) {
      updates.push(`availability = $${i++}`);
      vals.push(String(availability).trim() || 'Available');
    }
    if (accountStatus !== undefined) {
      updates.push(`account_status = $${i++}`);
      vals.push(String(accountStatus).trim() || 'Active');
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided.' });
    }
    vals.push(riderId);
    const { rows } = await pool.query(
      `UPDATE riders SET ${updates.join(', ')}
       WHERE id = $${i}
       RETURNING id, name, phone, email, barangay, availability, account_status, created_at`,
      vals,
    );
    return res.json({ ok: true, rider: riderRowToAdmin(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Could not update rider.' });
  }
});

router.get('/riders/:riderId/orders', async (req, res) => {
  try {
    const riderId = req.params.riderId;
    if (!isUuid(riderId)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const { rows } = await pool.query(
      `SELECT o.*, c.name AS customer_name
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE o.rider_id = $1
       ORDER BY o.created_at DESC`,
      [riderId],
    );
    const { rows: cancelledHistory } = await pool.query(
      `SELECT o.*, c.name AS customer_name,
        (
          SELECT MAX((elem->>'cancelledAt')::bigint)
          FROM jsonb_array_elements(COALESCE(o.rider_cancellations, '[]'::jsonb)) AS elem
          WHERE elem->>'riderId' = $1::text
        ) AS last_rider_cancel_at
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(COALESCE(o.rider_cancellations, '[]'::jsonb)) AS elem
         WHERE elem->>'riderId' = $1::text
       )
       ORDER BY last_rider_cancel_at DESC NULLS LAST`,
      [riderId],
    );
    return res.json({
      orders: rows.map(orderRowToAdminRiderHistory),
      riderCancelled: cancelledHistory.map(orderRowToAdminRiderHistory),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load rider orders.' });
  }
});

module.exports = router;
