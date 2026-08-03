'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? router.replace('/chat') : router.replace('/login')))
      .catch(() => router.replace('/login'));
  }, [router]);
  return (
    <div className="auth-shell">
      <div style={{ color: 'var(--muted)' }}>Loading Nox…</div>
    </div>
  );
}
