"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/stores/notification.store";
import { formatDistanceToNow } from "date-fns";

export default function NotificationPage() {
  const {
    notifications,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
    loading,
  } = useNotificationStore();

  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <section className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-gray-500">
          <Loader2 className="animate-spin w-5 h-5" /> Loading...
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications</p>
      ) : (
        <div className="border rounded-md divide-y">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex justify-between items-start ${
                n.read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm ${n.read ? "text-gray-600" : "font-semibold"}`}>{n.title}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <Button
                  size="xs"
                  onClick={() => markAsRead(n.id)}
                  variant="ghost"
                  className="text-blue-600 hover:underline"
                >
                  Mark as read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </section>
  );
}
