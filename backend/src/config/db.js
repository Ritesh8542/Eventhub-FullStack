// MongoDB connection — optional. If MONGODB_URI is not set (or the
// connection fails) the app keeps running on the in-memory store.
const mongoose = require('mongoose');

let connected = false;
function isConnected() { return connected; }

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[db] No MONGODB_URI set — using in-memory store (no MongoDB needed).');
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (err) {
    console.log('[db] MongoDB connection failed, falling back to in-memory store:', err.message);
    connected = false;
    return false;
  }
}

module.exports = { connectDB, isConnected };
