const express = require('express');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, createUser, comparePassword, pubUser } = require('../store');
const { auth } = require('../middleware/auth');

const router = express.Router();
const sign = (u) => jwt.sign(
  { id: u.id, email: u.email, role: u.role, name: u.name },
  process.env.JWT_SECRET || 'change-me-to-a-long-random-secret', { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await findUserByEmail(email)) return res.status(400).json({ message: 'Email already registered' });
  const user = await createUser({ name, email, password });
  res.status(201).json({ token: sign(user), user: pubUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  const user = await findUserByEmail(email);
  if (!user || !(await comparePassword(user, password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: sign(user), user: pubUser(user) });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(pubUser(user));
});

module.exports = router;
