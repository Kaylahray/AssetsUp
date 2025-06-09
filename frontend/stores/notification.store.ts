import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  read: boolean;
  timestamp: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => void;
  markAsRead: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: () => {
    set({ loading: true });
    setTimeout(() => {
      const fakeData: Notification[] = [
        { id: '1', title: 'New comment on your post', read: false, timestamp: '2 mins ago' },
        { id: '2', title: 'Update available', read: false, timestamp: '10 mins ago' },
        { id: '3', title: 'Backup completed', read: true, timestamp: '1 hour ago' },
      ];
      set({
        notifications: fakeData,
        unreadCount: fakeData.filter(n => !n.read).length,
        loading: false,
      });
    }, 1000);
  },
  markAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated, unreadCount: 0 });
  },
}));
