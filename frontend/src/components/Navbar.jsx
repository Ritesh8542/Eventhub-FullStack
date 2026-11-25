import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav">
      <Link to="/" className="logo">🎟️ EventHub</Link>
      <nav className="nav-links">
        <Link to="/">Events</Link>
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        {user ? (<><span className="nav-user">Hi, {user.name}</span><button className="btn btn-ghost" onClick={() => { logout(); nav('/'); }}>Logout</button></>)
          : (<><Link to="/login">Login</Link><Link to="/register" className="btn btn-primary">Sign up</Link></>)}
      </nav>
    </header>
  );
}
