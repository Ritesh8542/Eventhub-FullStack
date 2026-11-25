import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const date = new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <article className="card">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} loading="lazy" />}
      <div className="card-body">
        <span className="badge">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="muted">{date} · {event.venue}</p>
        <p className="price">{event.price === 0 ? 'Free' : `₹${event.price}`}</p>
        <Link to={`/events/${event.id}`} className="btn btn-primary">View details</Link>
      </div>
    </article>
  );
}
