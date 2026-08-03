import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nox Chat',
  description: 'Smooth private chat with View Once, AI help & Telegram alerts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
