import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  const handleSavePreferences = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="container max-w-xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Settings</h1>

      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Appearance</CardTitle>
          <CardDescription>Customize how RecSha looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Change the theme of the application
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Recording Preferences</CardTitle>
          <CardDescription>
            Configure your screen recording settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-quality" className="text-base">
                High Quality
              </Label>
              <p className="text-sm text-muted-foreground">
                Record in higher quality (uses more storage)
              </p>
            </div>
            <Switch
              id="high-quality"
              checked={highQuality}
              onCheckedChange={setHighQuality}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-save" className="text-base">
                Auto Save
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically save recordings when completed
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important events
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleSavePreferences}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
