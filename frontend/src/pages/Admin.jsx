import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const empty = { title: '', description: '', category: 'Technology', date: '', venue: '', price: 0, capacity: 100, imageUrl: '' };

export default function Admin() {
  const { user, loading } = useAuth(); const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const load = () => api.get('/events').then((r) => setEvents(r.data)).catch(() => {});
  useEffect(() => { if (!loading && (!user || user.role !== 'admin')) nav('/login'); if (user?.role === 'admin') load(); }, [user, loading]);

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      if (editing) await api.put(`/events/${editing}`, form); else await api.post('/events', form);
      setMsg(editing ? 'Event updated.' : 'Event created.'); setForm(empty); setEditing(null); load();
    } catch (x) { setErr(x.response?.data?.message || 'Save failed'); }
  };
  const del = async (id) => { if (confirm('Delete this event?')) { await api.delete(`/events/${id}`); load(); } };
  const edit = (ev) => { setEditing(ev.id); setForm({ ...empty, ...ev, date: ev.date.slice(0, 16) }); window.scrollTo(0, 0); };
  const upload = async (id, file) => {
    if (!file) return;
    const fd = new FormData(); fd.append('image', file);
    try { const r = await api.post(`/events/${id}/upload`, fd); setMsg(`Image uploaded (${r.data.storage}).`); load(); }
    catch (x) { setErr(x.response?.data?.message || 'Upload failed'); }
  };
  if (loading) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p className="muted">Create, edit and delete events. Upload an image per event (S3 when configured, otherwise stored locally).</p>
      <form className="form wide" onSubmit={submit}>
        <h2>{editing ? 'Edit event' : 'Create event'}</h2>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
        <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Technology', 'Workshop', 'Hackathon', 'Music', 'Business'].map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Date &amp; time<input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
        <label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required /></label>
        <label>Price (₹, 0 = free)<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
        <label>Capacity<input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></label>
        <label>Image URL (optional)<input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" /></label>
        {msg && <p className="success">{msg}</p>}{err && <p className="error">{err}</p>}
        <button className="btn btn-primary">{editing ? 'Update event' : 'Create event'}</button>
        {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel edit</button>}
      </form>
      <h2>All events ({events.length})</h2>
      <div className="grid">{events.map((ev) => (
        <article key={ev.id} className="card"><div className="card-body">
          <h3>{ev.title}</h3><p className="muted">{ev.category} · {new Date(ev.date).toLocaleDateString('en-IN')}</p>
          <button className="btn" onClick={() => edit(ev)}>Edit</button>{' '}
          <button className="btn btn-danger" onClick={() => del(ev.id)}>Delete</button>{' '}
          <label className="btn">Upload image<input type="file" accept="image/*" hidden onChange={(e) => upload(ev.id, e.target.files[0])} /></label>
        </div></article>))}
      </div>
    </div>
  );
}
