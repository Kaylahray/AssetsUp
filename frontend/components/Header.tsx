'use client';

import Link from 'next/link';
import NotificationBell from './notification/notification-bell';

export default function Header() {
  return (
    <header className="w-full px-6 py-4 bg-white shadow flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>

      <div className="flex items-center gap-4">
        <NotificationBell />
        {/* Add user profile/avatar etc here */}
      </div>
    </header>
  );
}
