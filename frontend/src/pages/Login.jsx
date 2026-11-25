import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [email, setEmail] = useState('demo@eventhub.in');
  const [password, setPassword] = useState('Demo@123');
  const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); setErr(''); try { const u = await login(email, password); nav(u.role === 'admin' ? '/admin' : '/'); } catch (x) { setErr(x.response?.data?.message || 'Login failed'); } };
  return (
    <form className="form" onSubmit={submit}>
      <h1>Login</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {err && <p className="error">{err}</p>}
      <button className="btn btn-primary">Login</button>
      <p className="muted">Demo user: demo@eventhub.in / Demo@123<br />Admin: admin@eventhub.in / Admin@123<br />No account? <Link to="/register">Register</Link></p>
    </form>
  );
}
