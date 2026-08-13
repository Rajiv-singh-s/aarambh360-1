import type { Metadata } from 'next';
import './globals.css';
import { AdminAuthProvider } from '../components/AdminAuthProvider';
import { DashboardShell } from '../components/DashboardShell';

export const metadata: Metadata = {
  title: 'Aarambh360 Admin Portal',
  description: 'Administrative control center for Aarambh360 UPSC EdTech platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AdminAuthProvider>
          <DashboardShell>{children}</DashboardShell>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
