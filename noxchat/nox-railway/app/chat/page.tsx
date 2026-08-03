'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  full_name: string;
  profile_pic: string;
  is_online: boolean;
  unread: number;
}

interface Message {
  id: string;
  sender_id: string;
  message: string | null;
  image: string | null;
  view_once?: boolean;
  already_viewed?: boolean;
  is_mine: boolean;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [me, setMe] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [viewOnce, setViewOnce] = useState(false);
  const [preview, setPreview] = useState('');
  const [search, setSearch] = useState('');
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiQ, setAiQ] = useState('');
  const [aiA, setAiA] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setMe)
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    if (!me) return;
    loadUsers();
    loadNotifs();
    const i = setInterval(loadNotifs, 8000);
    return () => clearInterval(i);
  }, [me]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
    pollRef.current = setInterval(() => loadMessages(selected, true), 2500);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadUsers(q = search) {
    const res = await fetch(`/api/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUsers(data.users || []);
  }

  async function loadMessages(userId: string, isPoll = false) {
    const res = await fetch(`/api/messages?user_id=${userId}`);
    const data = await res.json();
    if (data.other_user) setOtherUser(data.other_user);
    if (!isPoll) setMessages(data.messages || []);
    else {
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const neu = (data.messages || []).filter((m: Message) => !ids.has(m.id));
        return neu.length ? [...prev, ...neu] : prev;
      });
    }
  }

  async function loadNotifs() {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifs(data.notifications || []);
    setUnreadNotif(data.unread_count || 0);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || (!text.trim() && !image)) return;
    const fd = new FormData();
    fd.append('receiver_id', selected);
    if (text.trim()) fd.append('message', text.trim());
    if (image) fd.append('image', image);
    if (viewOnce) fd.append('view_once', '1');
    const res = await fetch('/api/send', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      setMessages((p) => [...p, data.message]);
      setText('');
      setImage(null);
      setPreview('');
      setViewOnce(false);
      loadUsers();
    } else alert(data.error || 'Failed');
  }

  async function openViewOnce(msgId: string) {
    await fetch('/api/view-once', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message_id: msgId }),
    });
    setTimeout(() => selected && loadMessages(selected), 3500);
  }

  async function askAI() {
    if (!aiQ.trim()) return;
    setAiLoading(true);
    setAiA('');
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: aiQ }),
    });
    const data = await res.json();
    setAiA(data.answer || data.error || 'Error');
    setAiLoading(false);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  function pickUser(id: string) {
    setSelected(id);
    setMobileChat(true);
  }

  if (!me) {
    return <div className="auth-shell"><div style={{ color: 'var(--muted)' }}>Loading…</div></div>;
  }

  function av(src: string | undefined, letter: string, size = 42) {
    if (src) return <img className="avatar" src={src} alt="" style={{ width: size, height: size }} />;
    return (
      <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {(letter || '?')[0].toUpperCase()}
      </div>
    );
  }

  return (
    <div className="app">
      <aside className={`sidebar ${mobileChat ? 'hide-mobile' : ''}`}>
        <div className="side-head">
          <div className="me">
            {av(me.profile_pic, me.username)}
            <div style={{ minWidth: 0 }}>
              <div className="name">{me.full_name || me.username}</div>
              <div className="status">Online</div>
            </div>
          </div>
          <div className="icon-row">
            <button className="icon-btn" onClick={() => setShowNotif(!showNotif)} title="Notifications">
              🔔{unreadNotif > 0 && <span className="badge">{unreadNotif > 9 ? '9+' : unreadNotif}</span>}
            </button>
            <Link href="/profile" className="icon-btn" title="Profile">⚙️</Link>
            <button className="icon-btn" onClick={logout} title="Logout">⎋</button>
          </div>
        </div>

        <div className="search">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              loadUsers(e.target.value);
            }}
            placeholder="Search people…"
          />
        </div>

        <div className="users">
          {users.map((u) => (
            <div key={u.id} className={`user ${selected === u.id ? 'active' : ''}`} onClick={() => pickUser(u.id)}>
              {av(u.profile_pic, u.username, 44)}
              {u.is_online && <span className="dot" />}
              <div className="meta">
                <h4>{u.full_name}</h4>
                <p>{u.is_online ? 'Online' : 'Offline'}</p>
              </div>
              {u.unread > 0 && <span className="badge" style={{ position: 'static' }}>{u.unread}</span>}
            </div>
          ))}
          {!users.length && <div style={{ padding: 24, color: 'var(--muted)', textAlign: 'center', fontSize: 13 }}>No users yet — register another account</div>}
        </div>
      </aside>

      <main className="main">
        {!selected ? (
          <div className="empty">
            <div>
              <div className="orb">💬</div>
              <h2>Welcome to Nox</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-head">
              <button className="icon-btn" style={{ display: 'none' }} onClick={() => { setMobileChat(false); setSelected(null); }}>←</button>
              <style>{`@media (max-width:860px){ .chat-head .back{display:grid!important} }`}</style>
              <button className="icon-btn back" style={{ display: 'none' }} onClick={() => { setMobileChat(false); }}>←</button>
              {av(otherUser?.profile_pic, otherUser?.username || '?')}
              <div>
                <div style={{ fontWeight: 650 }}>{otherUser?.full_name || '…'}</div>
                <div style={{ fontSize: 12, color: otherUser?.is_online ? 'var(--green)' : 'var(--muted)' }}>
                  {otherUser?.is_online ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            <div className="msgs">
              {messages.map((m) => (
                <div key={m.id} className={`row ${m.is_mine ? 'mine' : 'other'}`}>
                  <div>
                    {m.view_once && m.image && !m.is_mine && !m.already_viewed ? (
                      <div className="view-once-wrap" onClick={() => openViewOnce(m.id)}>
                        <img src={m.image} alt="" />
                        <div className="overlay">🔥 View Once</div>
                      </div>
                    ) : m.view_once && m.already_viewed && !m.is_mine ? (
                      <div style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>📷 Opened (View Once)</div>
                    ) : m.image ? (
                      <div>
                        {m.view_once && <div style={{ color: '#fbbf24', fontSize: 12, marginBottom: 4 }}>🔥 View Once</div>}
                        <img className="photo" src={m.image} alt="" />
                      </div>
                    ) : null}
                    {m.message && <div className="bubble">{m.message}</div>}
                    <div className="time">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="composer">
              {preview && (
                <div className="preview-bar">
                  <img src={preview} alt="" />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 13 }}>
                    <input type="checkbox" checked={viewOnce} onChange={(e) => setViewOnce(e.target.checked)} />
                    View Once
                  </label>
                  <button className="icon-btn" onClick={() => { setImage(null); setPreview(''); setViewOnce(false); }}>×</button>
                </div>
              )}
              <form onSubmit={sendMessage}>
                <label className="icon-btn" title="Photo">
                  🖼
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
                  }} />
                </label>
                <button type="button" className="icon-btn" title="Ask AI" onClick={() => setShowAI(true)}>🤖</button>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message…"
                />
                <button type="submit" className="send">➤</button>
              </form>
            </div>
          </>
        )}
      </main>

      {showNotif && (
        <div className="panel notif-panel">
          <div className="panel-head">
            <strong>Notifications</strong>
            <button className="icon-btn" onClick={() => setShowNotif(false)}>×</button>
          </div>
          <div className="notif-list">
            {!notifs.length && <div style={{ padding: 20, color: 'var(--muted)' }}>No notifications</div>}
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => { setSelected(n.from_user_id); setShowNotif(false); setMobileChat(true); }}
              >
                <strong>{n.from_name}</strong>: {n.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {showAI && (
        <div className="modal-bg" onClick={() => setShowAI(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🤖 Nox AI Help</h3>
            <textarea value={aiQ} onChange={(e) => setAiQ(e.target.value)} placeholder="Kya help chahiye?" />
            <button className="btn" onClick={askAI} disabled={aiLoading}>
              {aiLoading ? 'Thinking…' : 'Ask AI'}
            </button>
            {aiA && <div className="ai-ans"><strong>Nox AI</strong><br />{aiA}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
