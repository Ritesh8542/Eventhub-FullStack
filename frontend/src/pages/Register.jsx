import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); setErr(''); try { await register(name, email, password); nav('/'); } catch (x) { setErr(x.response?.data?.message || 'Registration failed'); } };
  return (
    <form className="form" onSubmit={submit}>
      <h1>Create an account</h1>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password (min 6 characters)<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {err && <p className="error">{err}</p>}
      <button className="btn btn-primary">Register</button>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
