const express = require('express');
const { auth } = require('../middleware/auth');
const { getEvent, countBookingsForEvent, createBooking, findBooking, listBookingsForUser, cancelBooking } = require('../store');

const router = express.Router();

// POST /api/bookings { eventId, tickets? }
router.post('/', auth, async (req, res) => {
  const { eventId, tickets = 1 } = req.body || {};
  if (!eventId) return res.status(400).json({ message: 'eventId is required' });
  const event = await getEvent(eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (await findBooking(req.user.id, eventId)) {
    return res.status(400).json({ message: 'You are already registered for this event' });
  }
  const booked = await countBookingsForEvent(eventId);
  if (booked + Number(tickets) > event.capacity) {
    return res.status(400).json({ message: 'Event is full' });
  }
  res.status(201).json(await createBooking(req.user.id, eventId, Number(tickets) || 1));
});

// GET /api/bookings/my
router.get('/my', auth, async (req, res) => {
  res.json(await listBookingsForUser(req.user.id));
});

// DELETE /api/bookings/:id  (cancel own booking)
router.delete('/:id', auth, async (req, res) => {
  const b = await cancelBooking(req.user.id, req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  res.json(b);
});

module.exports = router;
