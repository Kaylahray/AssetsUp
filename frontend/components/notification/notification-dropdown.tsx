"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate fetch
    const fakeData: Notification[] = [
      {
        id: "1",
        title: "New comment on your post",
        isRead: false,
        createdAt: new Date().toISOString(),
        link: "/notifications/1",
      },
      {
        id: "2",
        title: "System maintenance scheduled",
        isRead: true,
        createdAt: new Date(Date.now() - 600000).toISOString(),
      },
    ];
    setNotifications(fakeData);
    setUnreadCount(fakeData.filter((n) => !n.isRead).length);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-1 p-3 ${
                n.isRead ? "bg-white" : "bg-gray-100 font-semibold"
              }`}
              asChild
            >
              <Link href={n.link || "/notifications"}>
                <>
                  <span>{n.title}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <div className="border-t p-2 text-center">
          <Link
            href="/notifications"
            className="text-sm text-blue-600 hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
