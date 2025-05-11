import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Film, Home, LogOut, Settings, User, Video } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { fetchUserQueryOptions } from "@/actions/queryOptions";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ to, icon, children, className }: NavLinkProps) => {
  const routerState = useRouterState();

  // Special case for home route
  const isActive =
    to === "/"
      ? routerState.location.pathname === "/"
      : routerState.location.pathname.startsWith(to);

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "gap-2 font-medium transition-colors rounded-md",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/70 hover:text-foreground hover:bg-accent/50",
        className
      )}
    >
      <Link to={to}>
        {icon}
        <span>{children}</span>
      </Link>
    </Button>
  );
};

export function Nav() {
  const router = useRouter();
  const { user } = useAuthenticatedUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw new Error(error.message);
      }
      toast.success("Logged out successfully");
      await queryClient.invalidateQueries(fetchUserQueryOptions());
      router.navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md shadow-sm">
      <div className="container px-4 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 py-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold font-outfit">RecSha</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home className="h-4 w-4" />}>
              Home
            </NavLink>
            {user && (
              <>
                <NavLink to="/videos" icon={<Film className="h-4 w-4" />}>
                  Videos
                </NavLink>
                <NavLink to="/record" icon={<Video className="h-4 w-4" />}>
                  Record
                </NavLink>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.name || user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>{" "}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-border/30 bg-background/80">
        <div className="container grid grid-cols-3 gap-px">
          <NavLink
            to="/"
            icon={<Home className="h-4 w-4" />}
            className="justify-center py-3 rounded-none"
          >
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink
                to="/videos"
                icon={<Film className="h-4 w-4" />}
                className="justify-center py-3 rounded-none"
              >
                Videos
              </NavLink>
              <NavLink
                to="/record"
                icon={<Video className="h-4 w-4" />}
                className="justify-center py-3 rounded-none"
              >
                Record
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                icon={<User className="h-4 w-4" />}
                className="justify-center py-3 rounded-none"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                icon={<User className="h-4 w-4" />}
                className="justify-center py-3 rounded-none"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
