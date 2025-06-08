'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification.store';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    loading,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 w-80 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </span>
            <button
              onClick={markAsRead}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              <CheckCheck className="w-4 h-4 inline mr-1" /> Mark all as read
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-4 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'px-4 py-3 border-b cursor-pointer transition-colors',
                    notif.read
                      ? 'bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                      : 'bg-blue-50 font-semibold dark:bg-gray-800 text-gray-900'
                  )}
                >
                  <p className="text-sm">{notif.title}</p>
                  <p className="text-xs text-gray-500">{notif.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
