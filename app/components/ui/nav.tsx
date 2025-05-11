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
        "gap-2 font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
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
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">RecSha</span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
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
    </nav>
  );
}
