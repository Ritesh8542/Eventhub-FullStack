import { useEffect, useState } from 'react';
import api from '../api';
import EventCard from '../components/EventCard.jsx';

const CATEGORIES = ['', 'Technology', 'Workshop', 'Hackathon', 'Music', 'Business'];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/events', { params: { search: search || undefined, category: category || undefined } })
        .then((r) => setEvents(r.data)).catch(() => setError('Could not load events — is the backend running on port 5000?'));
    }, 250);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <div>
      <section className="hero">
        <h1>Discover events worth showing up for.</h1>
        <p>Tech summits, hackathons, workshops and music — browse, book and manage it all in one place.</p>
      </section>
      <div className="filters">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All categories'}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {events.length === 0 && !error && <p className="muted">No events match your search.</p>}
      <div className="grid">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>
    </div>
  );
}
