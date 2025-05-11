import * as React from "react";
import {
  Link,
  useRouter,
  useRouterState,
  createLink,
} from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Home, Film, Video } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
            <NavLink to="/videos" icon={<Film className="h-4 w-4" />}>
              Videos
            </NavLink>
            <NavLink to="/record" icon={<Video className="h-4 w-4" />}>
              Record
            </NavLink>
          </div>
        </div>

        <ThemeToggle />
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
        </div>
      </div>
    </nav>
  );
}
