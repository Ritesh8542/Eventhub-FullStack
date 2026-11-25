import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyBookings() {
  const { user, loading } = useAuth(); const nav = useNavigate();
  const [bookings, setBookings] = useState([]);
  const load = () => api.get('/bookings/my').then((r) => setBookings(r.data)).catch(() => {});
  useEffect(() => { if (!loading && !user) nav('/login'); if (user) load(); }, [user, loading]);
  const cancel = async (id) => { await api.delete(`/bookings/${id}`); load(); };
  if (loading) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.length === 0 && <p className="muted">No bookings yet. <Link to="/">Browse events</Link></p>}
      <div className="grid">{bookings.map((b) => (
        <article key={b.id} className="card"><div className="card-body">
          <h3>{b.event?.title || 'Event'}</h3>
          <p className="muted">{b.event ? new Date(b.event.date).toLocaleDateString('en-IN') : ''} · {b.event?.venue}</p>
          <p>Status: <strong>{b.status}</strong> · Tickets: {b.tickets}</p>
          {b.status === 'confirmed' && <button className="btn btn-danger" onClick={() => cancel(b.id)}>Cancel booking</button>}
        </div></article>))}
      </div>
    </div>
  );
}
