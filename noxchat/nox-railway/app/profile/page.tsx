'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((u) => {
        setUser(u);
        setFullName(u.full_name || '');
        setBio(u.bio || '');
        setPreview(u.profile_pic || '');
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const fd = new FormData();
    fd.append('full_name', fullName);
    fd.append('bio', bio);
    if (file) fd.append('profile_pic', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setMsg('Profile updated');
      if (data.profile_pic) setPreview(data.profile_pic);
    } else setMsg(data.error || 'Failed');
  }

  if (!user) return <div className="auth-shell">Loading…</div>;

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <Link href="/chat" style={{ fontSize: 13, color: 'var(--muted)' }}>← Back to chat</Link>
        <h1 style={{ marginTop: 12, textAlign: 'left' }}>Profile</h1>
        <p className="sub" style={{ textAlign: 'left' }}>Update how you appear on Nox</p>
        {msg && <div className={`alert ${msg.includes('updated') ? 'alert-ok' : 'alert-error'}`}>{msg}</div>}
        <form onSubmit={save}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            {preview ? (
              <img src={preview} alt="" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(124,92,255,.4)' }} />
            ) : (
              <div className="avatar" style={{ width: 96, height: 96, margin: '0 auto', fontSize: 36 }}>{user.username[0].toUpperCase()}</div>
            )}
            <label className="btn btn-ghost" style={{ width: 'auto', display: 'inline-block', marginTop: 10, padding: '8px 14px', fontSize: 13 }}>
              Change photo
              <input type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
              }} />
            </label>
          </div>
          <div className="field"><label>Username</label><input value={user.username} disabled /></div>
          <div className="field"><label>Email</label><input value={user.email} disabled /></div>
          <div className="field"><label>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
          <div className="field"><label>Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
          <button className="btn" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
