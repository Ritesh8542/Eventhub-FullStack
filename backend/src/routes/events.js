const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../store');
const { auth, adminOnly } = require('../middleware/auth');
const { uploadToS3, isS3Configured } = require('../utils/s3');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/events?category=&search=
router.get('/', async (req, res) => {
  res.json(await listEvents({ category: req.query.category, search: req.query.search }));
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const e = await getEvent(req.params.id);
  if (!e) return res.status(404).json({ message: 'Event not found' });
  res.json(e);
});

// POST /api/events  (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  const { title, description, category, date, venue, price, capacity, imageUrl } = req.body || {};
  if (!title || !description || !category || !date || !venue) {
    return res.status(400).json({ message: 'Title, description, category, date and venue are required' });
  }
  const e = await createEvent({ title, description, category, date, venue, price: Number(price) || 0, capacity: Number(capacity) || 100, imageUrl: imageUrl || '', createdBy: req.user.id });
  res.status(201).json(e);
});

// PUT /api/events/:id  (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const e = await updateEvent(req.params.id, req.body || {});
  if (!e) return res.status(404).json({ message: 'Event not found' });
  res.json(e);
});

// DELETE /api/events/:id  (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  if (!(await deleteEvent(req.params.id))) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

// POST /api/events/:id/upload  (admin) — image file field name: "image"
// S3 when configured, otherwise saved to backend/uploads/ and served at /uploads/...
router.post('/:id/upload', auth, adminOnly, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file uploaded (field: image)' });
  const e = await getEvent(req.params.id);
  if (!e) return res.status(404).json({ message: 'Event not found' });
  const key = `events/${req.params.id}-${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`;
  let url = await uploadToS3(req.file.buffer, key, req.file.mimetype);
  let storage = 's3';
  if (!url) {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, path.basename(key)), req.file.buffer);
    url = `/uploads/${path.basename(key)}`;
    storage = 'local';
  }
  const updated = await updateEvent(req.params.id, { imageUrl: url });
  res.json({ ...updated, storage, s3Configured: isS3Configured() });
});

module.exports = router;
