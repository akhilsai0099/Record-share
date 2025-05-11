import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const { user } = useAuthenticatedUser();
  const [name, setname] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // await updateProfile({ name });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Profile Settings
      </h1>

      <Card className="border-border mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {user?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {user?.name || user?.email}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setname(e.target.value)}
                placeholder="Your name"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email}
                disabled
                className="bg-muted border-input text-muted-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl">Account Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>

          <Button variant="outline" className="w-full">
            Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
