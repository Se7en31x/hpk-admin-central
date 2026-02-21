import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'HPK Admin Central',
  description: 'Hospital Management System – Centralized Admin Portal',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="font-sans bg-slate-50">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
