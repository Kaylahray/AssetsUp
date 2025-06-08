"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: true,
    inApp: true,
    comments: true,
    mentions: true,
    system: true,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = () => {
    console.log("Saved preferences:", preferences);
    // TODO: Persist to backend
  };

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h2 className="text-lg font-semibold">Notification Preferences</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center space-x-2">
          <Switch checked={preferences.email} onCheckedChange={() => handleToggle("email")} />
          <Label>Email Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={preferences.inApp} onCheckedChange={() => handleToggle("inApp")} />
          <Label>In-App Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={preferences.comments} onCheckedChange={() => handleToggle("comments")} />
          <Label>Comment Alerts</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={preferences.mentions} onCheckedChange={() => handleToggle("mentions")} />
          <Label>Mentions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={preferences.system} onCheckedChange={() => handleToggle("system")} />
          <Label>System Updates</Label>
        </div>
      </div>

      <button
        onClick={savePreferences}
        className="mt-4 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Save Preferences
      </button>
    </div>
  );
}
