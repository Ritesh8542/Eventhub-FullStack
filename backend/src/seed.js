// Seeds demo users + 6 realistic events (only if the store is empty).
const { mem, findUserByEmail, createUser, listEvents, createEvent } = require('./store');

const EVENTS = [
  { title: 'Tech Summit 2027', description: 'Two days of keynotes, panels and demos on cloud, AI and the future of software. Network with engineers, founders and recruiters.', category: 'Technology', date: '2027-02-12T09:00:00Z', venue: 'Bandra Kurla Complex, Mumbai', price: 999, capacity: 500, imageUrl: 'https://picsum.photos/seed/techsummit/800/450' },
  { title: 'AI & Machine Learning Workshop', description: 'Hands-on workshop: build and deploy a real ML model with Python, scikit-learn and cloud tools. Laptops required; beginners welcome.', category: 'Workshop', date: '2026-12-19T10:00:00Z', venue: 'IIT Bombay, Powai, Mumbai', price: 499, capacity: 120, imageUrl: 'https://picsum.photos/seed/aiworkshop/800/450' },
  { title: 'CodeSprint Hackathon 2027', description: '24-hour hackathon. Build something amazing, pitch to judges, and win prizes worth Rs. 1,00,000. Food, Wi-Fi and mentors included.', category: 'Hackathon', date: '2027-01-24T08:00:00Z', venue: 'Innovation Hub, Pune', price: 0, capacity: 200, imageUrl: 'https://picsum.photos/seed/hackathon/800/450' },
  { title: 'Mumbai Music Fest', description: 'An evening of live indie, rock and electronic music under the stars, with food stalls and local artists.', category: 'Music', date: '2027-03-06T17:00:00Z', venue: 'Juhu Beach Amphitheatre, Mumbai', price: 799, capacity: 1000, imageUrl: 'https://picsum.photos/seed/musicfest/800/450' },
  { title: 'Startup Pitch Night', description: 'Ten early-stage startups pitch to investors and mentors. Great for founders, students and anyone curious about startups.', category: 'Business', date: '2026-12-05T18:00:00Z', venue: 'WeWork, Andheri East, Mumbai', price: 0, capacity: 150, imageUrl: 'https://picsum.photos/seed/pitch/800/450' },
  { title: 'Data Science Bootcamp', description: 'A full-day bootcamp on data analysis, visualisation and dashboards with Python and real datasets. Certificate included.', category: 'Workshop', date: '2027-01-10T09:30:00Z', venue: 'Online + Thane Campus', price: 299, capacity: 80, imageUrl: 'https://picsum.photos/seed/datascience/800/450' },
];

async function seed() {
  if (!(await findUserByEmail('admin@eventhub.in'))) {
    await createUser({ name: 'Admin', email: 'admin@eventhub.in', password: 'Admin@123', role: 'admin' });
    console.log('[seed] Admin created: admin@eventhub.in / Admin@123');
  }
  if (!(await findUserByEmail('demo@eventhub.in'))) {
    await createUser({ name: 'Demo User', email: 'demo@eventhub.in', password: 'Demo@123', role: 'user' });
    console.log('[seed] Demo user created: demo@eventhub.in / Demo@123');
  }
  const existing = await listEvents();
  if (existing.length === 0) {
    for (const e of EVENTS) await createEvent(e);
    console.log(`[seed] Seeded ${EVENTS.length} events`);
  }
  // In-memory mode: keep a reference so restarts in the same process keep data.
  return { users: mem.users.length, events: (await listEvents()).length };
}

module.exports = { seed, EVENTS };
