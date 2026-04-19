const { randomUUID } = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isUuid } = require('../utils/uuidParam');

const router = express.Router();

function addrSeed(line) {
  if (!line || !String(line).trim()) return [];
  return [
    {
      id: randomUUID(),
      label: 'Home',
      line: String(line).trim(),
      lat: null,
      lng: null,
    },
  ];
}

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      sex,
      birthdate,
      address,
    } = req.body ?? {};
    const e = (email ?? '').trim().toLowerCase();
    if (!name?.trim() || !e || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const hash = await bcrypt.hash(String(password), 10);
    const addressesJson = JSON.stringify(addrSeed(address));
    const { rows } = await pool.query(
      `INSERT INTO customers (
        email, password_hash, name, phone, sex, birthdate, address, addresses_json, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'Active')
      RETURNING id, email, name`,
      [
        e,
        hash,
        name.trim(),
        (phone ?? '').trim(),
        sex ?? null,
        birthdate ?? null,
        (address ?? '').trim(),
        addressesJson,
      ],
    );
    const row = rows[0];
    return res.json({
      ok: true,
      user: { id: row.id, email: row.email, name: row.name },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const e = (req.body?.email ?? '').trim().toLowerCase();
    const password = req.body?.password ?? '';
    if (!e || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const { rows } = await pool.query(
      `SELECT id, email, name, password_hash FROM customers WHERE LOWER(email) = LOWER($1)`,
      [e],
    );
    const row = rows[0];
    if (!row || !(await bcrypt.compare(String(password), row.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({
      ok: true,
      user: { id: row.id, email: row.email, name: row.name },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!isUuid(req.params.id)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const { rows } = await pool.query(
      `SELECT id, email, name, phone, sex, birthdate, address, addresses_json, status, created_at
       FROM customers WHERE id = $1`,
      [req.params.id],
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Customer not found.' });
    return res.json({
      customer: {
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone ?? '',
        sex: row.sex ?? '',
        birthdate: row.birthdate ?? '',
        address: row.address ?? '',
        addresses: Array.isArray(row.addresses_json) ? row.addresses_json : [],
        status: row.status,
        createdAt: new Date(row.created_at).getTime(),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load customer.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const { rows: existing } = await pool.query(
      `SELECT password_hash FROM customers WHERE id = $1`,
      [id],
    );
    if (!existing[0]) return res.status(404).json({ error: 'Customer not found.' });

    const {
      name,
      phone,
      addresses,
      currentPassword,
      newPassword,
    } = req.body ?? {};

    if (newPassword != null) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required.' });
      }
      const ok = await bcrypt.compare(
        String(currentPassword),
        existing[0].password_hash,
      );
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect.' });
      if (String(newPassword).length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const hash = await bcrypt.hash(String(newPassword), 10);
      await pool.query(`UPDATE customers SET password_hash = $1 WHERE id = $2`, [
        hash,
        id,
      ]);
      return res.json({ ok: true });
    }

    const updates = [];
    const vals = [];
    let n = 1;
    if (name != null) {
      updates.push(`name = $${n++}`);
      vals.push(String(name).trim());
    }
    if (phone != null) {
      updates.push(`phone = $${n++}`);
      vals.push(String(phone).trim());
    }
    if (addresses != null) {
      updates.push(`addresses_json = $${n++}::jsonb`);
      vals.push(JSON.stringify(addresses));
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided.' });
    }
    vals.push(id);
    await pool.query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $${n}`,
      vals,
    );
    const { rows } = await pool.query(
      `SELECT id, email, name, phone, sex, birthdate, address, addresses_json, status FROM customers WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    return res.json({
      ok: true,
      customer: {
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone ?? '',
        sex: row.sex ?? '',
        birthdate: row.birthdate ?? '',
        address: row.address ?? '',
        addresses: Array.isArray(row.addresses_json) ? row.addresses_json : [],
        status: row.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Update failed.' });
  }
});

module.exports = router;
