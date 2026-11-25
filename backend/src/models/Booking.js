const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  tickets: { type: Number, default: 1, min: 1 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

// One active booking per user per event is enforced in the route logic too.
bookingSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
