'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Failed');
      else router.push('/chat');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand"><div className="brand-logo">N</div></div>
        <h1>Join Nox</h1>
        <p className="sub">Create your account in seconds</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Full name</label><input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} placeholder="Your name" /></div>
          <div className="field"><label>Username</label><input value={form.username} onChange={(e) => set('username', e.target.value)} required placeholder="username" /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="you@email.com" /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required placeholder="min 6 chars" /></div>
          <div className="field"><label>Confirm</label><input type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required /></div>
          <button className="btn" disabled={loading}>{loading ? 'Creating…' : 'Register'}</button>
        </form>
        <div className="foot">Already have an account? <Link href="/login">Login</Link></div>
      </div>
    </div>
  );
}
