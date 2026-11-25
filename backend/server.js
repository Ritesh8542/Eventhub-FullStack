// EventHub backend entry point.
// Run:  npm install && npm start   (listens on PORT, default 5000)
// Works with NO MongoDB: falls back to the in-memory store (see src/store.js).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { connectDB } = require('./src/config/db');
const { seed } = require('./src/seed');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));
// Uploaded images (local fallback) are served here: /uploads/<file>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'eventhub-backend', time: new Date().toISOString() }));
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/bookings', require('./src/routes/bookings'));
app.get('/', (req, res) => res.json({ message: 'EventHub API — see /api/health' }));

const PORT = process.env.PORT || 5000;
(async () => {
  await connectDB();
  await seed();
  app.listen(PORT, () => console.log(`[server] EventHub API running on http://localhost:${PORT}`));
})();
