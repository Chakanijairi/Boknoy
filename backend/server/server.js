const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const pool = require('./config/db');
const { initDatabase } = require('./db/init');

app.use(cors());
app.use(express.json());

app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'shaws-delivery-api' });
});

app.use('/api/customers', require('./routes/customers'));
app.use('/api/riders', require('./routes/riders'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      error: 'API route not found',
      method: req.method,
      path: req.originalUrl,
      hint:
        'Confirm this is the Shaw\'s Delivery API: GET /api/health should return JSON. Check PORT in server/.env matches the frontend (default 5050).',
    });
  }
  next();
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  const isApi = req.originalUrl?.startsWith('/api');
  let status = Number(err.status || err.statusCode) || 500;
  if (!Number.isFinite(status) || status < 400) status = 500;
  if (isApi) {
    return res.status(status).json({ error: err.message || 'Server error' });
  }
  res.status(500).send(err.message || 'Server error');
});

const PORT = process.env.PORT || 5050;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Shaw's Delivery API`);
      console.log(`   http://127.0.0.1:${PORT}`);
      console.log(`   Health: GET http://127.0.0.1:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });