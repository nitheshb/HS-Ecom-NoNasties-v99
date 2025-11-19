'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AccountHeader from '@/components/AccountHeader';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccountPage = pathname === '/orders' || pathname === '/profile' || pathname === '/settings';

  return (
    <>
      {isAccountPage ? <AccountHeader /> : <Header />}
      <main>{children}</main>
      {!isAccountPage && <Footer />}
    </>
  );
}

