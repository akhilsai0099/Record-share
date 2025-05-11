// app/routes/index.tsx
import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ArrowRight, Clock, Monitor, Play, Share2, Video } from "lucide-react";
import * as fs from "node:fs";

const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0")
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const router = useRouter();
  const recordCount = Route.useLoaderData();

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm text-secondary-foreground mb-2">
                  <span className="font-semibold text-secondary">
                    Screen Recording Made Simple
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary via-primary/60 to-primary/40 bg-clip-text text-transparent">
                  Record Your Screen With Ease
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl font-inter">
                  High-quality screen recording with just a few clicks. No
                  downloads, no hassle.
                </p>
              </div>{" "}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="gap-1.5 bg-primary hover:bg-primary/90"
                >
                  <Link to="/record">
                    <Video className="h-4 w-4" />
                    Start Recording
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Link to="/videos">
                    <Play className="h-4 w-4" />
                    View Recordings
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="gap-1.5 border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                  <Link to="/signup">
                    <ArrowRight className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground font-inter">
                <span className="text-primary font-semibold">
                  {recordCount}
                </span>{" "}
                recordings created so far
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-video overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Monitor className="w-24 h-24 text-primary/50" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm text-primary-foreground">
              <span className="font-medium text-primary">
                Why Choose RecSha
              </span>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl font-outfit">
                Powerful <span className="text-primary">Features</span>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed font-inter">
                Everything you need to capture, share, and store your screen
                recordings
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border border-primary/10 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-full bg-primary/10">
                <Monitor className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-outfit">
                High-Quality Capture
              </h3>
              <p className="text-center text-muted-foreground font-inter">
                Crystal clear screen recording with support for audio capture
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border border-secondary/10 hover:border-secondary/30 transition-colors">
              <div className="p-3 rounded-full bg-secondary/10">
                <Clock className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-bold font-outfit">
                Instant Playback
              </h3>
              <p className="text-center text-muted-foreground font-inter">
                View recordings immediately after capture with no processing
                time
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border border-accent/10 hover:border-accent/30 transition-colors">
              <div className="p-3 rounded-full bg-accent/10">
                <Share2 className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold font-outfit">Easy Sharing</h3>
              <p className="text-center text-muted-foreground font-inter">
                Share your recordings with anyone via direct links
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl font-outfit">
                Ready to <span className="text-primary">Start Recording</span>?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed font-inter">
                Join{" "}
                <span className="text-primary font-semibold">
                  {recordCount}
                </span>{" "}
                others who are already using RecSha to capture their screens
              </p>
            </div>{" "}
            <Button
              asChild
              size="lg"
              className="gap-1.5 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              <Link to="/record">
                <Video className="h-5 w-5" />
                Start Your First Recording
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <div className="mt-4">
              <p className="text-muted-foreground">
                New user?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up now
                </Link>{" "}
                to save and share your recordings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
