// Data layer: uses Mongoose when MongoDB is connected, otherwise an
// in-memory store with the same API. Routes only call these functions,
// so they work identically in both modes.
const bcrypt = require('bcryptjs');
const { isConnected } = require('./config/db');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

// --- In-memory store ---
const mem = { users: [], events: [], bookings: [] };
let seq = 1;
const nid = () => String(seq++);
const now = () => new Date().toISOString();
function pubUser(u) { return u ? { id: u.id || String(u._id), name: u.name, email: u.email, role: u.role } : null; }
function pubEvent(e) {
  if (!e) return null;
  const o = e.toObject ? e.toObject() : { ...e };
  o.id = String(o._id || o.id); delete o._id; delete o.__v;
  return o;
}
function pubBooking(b, event) {
  if (!b) return null;
  const o = b.toObject ? b.toObject() : { ...b };
  o.id = String(o._id || o.id); delete o._id; delete o.__v;
  o.event = event ? pubEvent(event) : o.event;
  return o;
}

// --- Users ---
async function findUserByEmail(email) {
  if (isConnected()) return User.findOne({ email: email.toLowerCase() });
  return mem.users.find((u) => u.email === email.toLowerCase()) || null;
}
async function findUserById(id) {
  if (isConnected()) return User.findById(id);
  return mem.users.find((u) => u.id === String(id)) || null;
}
async function createUser({ name, email, password, role = 'user' }) {
  const hash = await bcrypt.hash(password, 10);
  if (isConnected()) {
    const u = await User.create({ name, email: email.toLowerCase(), password: hash, role });
    return { id: String(u._id), name: u.name, email: u.email, role: u.role, password: u.password };
  }
  const u = { id: nid(), name, email: email.toLowerCase(), password: hash, role, createdAt: now() };
  mem.users.push(u); return u;
}
async function comparePassword(user, plain) { return bcrypt.compare(plain, user.password); }

// --- Events ---
async function listEvents(filter = {}) {
  if (isConnected()) {
    const q = {};
    if (filter.category) q.category = filter.category;
    if (filter.search) q.title = { $regex: filter.search, $options: 'i' };
    return (await Event.find(q).sort({ date: 1 })).map(pubEvent);
  }
  return mem.events
    .filter((e) => (!filter.category || e.category === filter.category)
      && (!filter.search || e.title.toLowerCase().includes(filter.search.toLowerCase())))
    .slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(pubEvent);
}
async function getEvent(id) {
  if (isConnected()) return pubEvent(await Event.findById(id));
  return pubEvent(mem.events.find((e) => e.id === String(id)));
}
async function createEvent(data) {
  if (isConnected()) return pubEvent(await Event.create(data));
  const e = { id: nid(), ...data, createdAt: now(), updatedAt: now() };
  mem.events.push(e); return pubEvent(e);
}
async function updateEvent(id, data) {
  if (isConnected()) return pubEvent(await Event.findByIdAndUpdate(id, data, { new: true }));
  const e = mem.events.find((x) => x.id === String(id)); if (!e) return null;
  Object.assign(e, data, { updatedAt: now() }); return pubEvent(e);
}
async function deleteEvent(id) {
  if (isConnected()) { const r = await Event.findByIdAndDelete(id); return Boolean(r); }
  const i = mem.events.findIndex((x) => x.id === String(id));
  if (i < 0) return false; mem.events.splice(i, 1); return true;
}

// --- Bookings ---
async function countBookingsForEvent(eventId) {
  if (isConnected()) return Booking.countDocuments({ event: eventId, status: 'confirmed' });
  return mem.bookings.filter((b) => String(b.event) === String(eventId) && b.status === 'confirmed').length;
}
async function createBooking(userId, eventId, tickets = 1) {
  if (isConnected()) {
    const b = await Booking.create({ user: userId, event: eventId, tickets });
    return pubBooking(b, await Event.findById(eventId));
  }
  const b = { id: nid(), user: String(userId), event: String(eventId), tickets, status: 'confirmed', createdAt: now() };
  mem.bookings.push(b); return pubBooking(b, mem.events.find((e) => e.id === String(eventId)));
}
async function findBooking(userId, eventId) {
  if (isConnected()) return Booking.findOne({ user: userId, event: eventId, status: 'confirmed' });
  return mem.bookings.find((b) => b.user === String(userId) && b.event === String(eventId) && b.status === 'confirmed') || null;
}
async function listBookingsForUser(userId) {
  if (isConnected()) {
    const bs = await Booking.find({ user: userId }).sort({ createdAt: -1 }).populate('event');
    return bs.map((b) => pubBooking(b, b.event));
  }
  return mem.bookings.filter((b) => b.user === String(userId))
    .slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((b) => pubBooking(b, mem.events.find((e) => e.id === String(b.event))));
}
async function cancelBooking(userId, bookingId) {
  if (isConnected()) {
    const b = await Booking.findOne({ _id: bookingId, user: userId });
    if (!b) return null; b.status = 'cancelled'; await b.save(); return pubBooking(b, await Event.findById(b.event));
  }
  const b = mem.bookings.find((x) => x.id === String(bookingId) && x.user === String(userId));
  if (!b) return null; b.status = 'cancelled'; return pubBooking(b, mem.events.find((e) => e.id === String(b.event)));
}

module.exports = {
  mem, pubUser, pubEvent, pubBooking,
  findUserByEmail, findUserById, createUser, comparePassword,
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  countBookingsForEvent, createBooking, findBooking, listBookingsForUser, cancelBooking,
};
