const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isUuid } = require('../utils/uuidParam');
const { riderPhoneDigits } = require('../utils/riderPhone');
const { riderRowToPublic } = require('../utils/mappers');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body ?? {};
    const e = (email ?? '').trim().toLowerCase();
    const phoneTrim = (phone ?? '').trim();
    const phoneDig = riderPhoneDigits(phoneTrim);
    if (!name?.trim() || !e || !password) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (phoneDig) {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM riders
         WHERE REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = $1
         LIMIT 1`,
        [phoneDig],
      );
      if (rowCount > 0) {
        return res.status(409).json({ error: 'An account with this phone already exists.' });
      }
    }
    const hash = await bcrypt.hash(String(password), 10);
    const { rows } = await pool.query(
      `INSERT INTO riders (
        email, password_hash, name, phone, barangay, availability, account_status
      ) VALUES ($1, $2, $3, $4, '', 'Available', 'Active')
       RETURNING id, email, name`,
      [e, hash, name.trim(), phoneTrim || null],
    );
    const row = rows[0];
    return res.json({
      ok: true,
      rider: { id: row.id, email: row.email, name: row.name },
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
    const raw = (req.body?.login ?? req.body?.email ?? '').trim();
    const password = req.body?.password ?? '';
    if (!raw || !password) {
      return res.status(400).json({ error: 'Email or phone and password required.' });
    }
    const isEmail = raw.includes('@');
    const e = isEmail ? raw.toLowerCase() : '';
    const digits = isEmail ? '' : riderPhoneDigits(raw);
    if (!isEmail && !digits) {
      return res.status(400).json({ error: 'Enter a valid email or phone number.' });
    }
    let rows;
    if (isEmail) {
      ({ rows } = await pool.query(
        `SELECT id, email, name, password_hash, account_status
         FROM riders WHERE LOWER(email) = LOWER($1)`,
        [e],
      ));
    } else {
      ({ rows } = await pool.query(
        `SELECT id, email, name, password_hash, account_status
         FROM riders
         WHERE REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = $1`,
        [digits],
      ));
    }
    const row = rows[0];
    if (!row || !(await bcrypt.compare(String(password), row.password_hash))) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }
    if (row.account_status === 'Inactive') {
      return res.status(403).json({ error: 'Account is inactive.' });
    }
    return res.json({
      ok: true,
      rider: { id: row.id, email: row.email, name: row.name },
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
      `SELECT id, email, name, phone, barangay, availability, account_status, created_at
       FROM riders WHERE id = $1`,
      [req.params.id],
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Rider not found.' });
    return res.json({ rider: riderRowToPublic(row) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load rider.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!isUuid(id)) {
      return res.status(404).json({ error: 'Not found.' });
    }
    const { currentPassword, newPassword } = req.body ?? {};
    const { rows: existing } = await pool.query(
      `SELECT password_hash FROM riders WHERE id = $1`,
      [id],
    );
    if (!existing[0]) return res.status(404).json({ error: 'Rider not found.' });
    if (newPassword == null) {
      return res.status(400).json({ error: 'No updates provided.' });
    }
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
    await pool.query(`UPDATE riders SET password_hash = $1 WHERE id = $2`, [hash, id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Update failed.' });
  }
});

module.exports = router;
