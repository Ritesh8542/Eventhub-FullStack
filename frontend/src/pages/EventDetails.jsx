import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [event, setEvent] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { api.get(`/events/${id}`).then((r) => setEvent(r.data)).catch(() => setErr('Event not found.')); }, [id]);

  const book = async () => {
    if (!user) { nav('/login'); return; }
    setErr(''); setMsg('');
    try { await api.post('/bookings', { eventId: id }); setMsg('Registered! See My Bookings.'); }
    catch (e) { setErr(e.response?.data?.message || 'Booking failed'); }
  };

  if (err && !event) return <p className="error">{err}</p>;
  if (!event) return <p className="muted">Loading…</p>;
  const date = new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
  return (
    <article className="details">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} />}
      <span className="badge">{event.category}</span>
      <h1>{event.title}</h1>
      <p className="muted">{date} · {event.venue} · Capacity {event.capacity}</p>
      <p>{event.description}</p>
      <p className="price big">{event.price === 0 ? 'Free entry' : `₹${event.price} per ticket`}</p>
      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}
      <button className="btn btn-primary" onClick={book}>{user ? 'Register for this event' : 'Login to register'}</button>
      {!user && <p className="muted">Demo login: demo@eventhub.in / Demo@123 · <Link to="/login">Login</Link></p>}
    </article>
  );
}
