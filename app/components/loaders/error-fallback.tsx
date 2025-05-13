import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

interface ErrorComponentProps {
  error: Error;
  info?: {
    componentStack: string;
  };
}

export function ErrorFallback({ error }: ErrorComponentProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isRoot = pathname === "/";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div
          className={cn(
            "rounded-lg border border-border bg-background p-8 shadow-md"
          )}
        >
          <div className="flex flex-col items-center text-center">
            {/* Error Icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-destructive mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 8V12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="16"
                  r="0.5"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-muted-foreground">
              {error?.message || "An unexpected error occurred"}
            </p>

            {/* Stack Trace (in development only) */}
            {process.env.NODE_ENV === "development" && error?.stack && (
              <div className="mt-6 w-full">
                <div className="overflow-auto rounded-md bg-muted p-4 max-h-44 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-300">
                  <pre className="text-left text-xs text-muted-foreground whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2 w-full">
              {!isRoot && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/" search={{}} params={{}}>
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
              )}

              <Button
                onClick={() => window.history.back()}
                variant={isRoot ? "default" : "destructive"}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
