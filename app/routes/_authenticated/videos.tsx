import { fetchVideosQueryOptions } from "@/actions/queryOptions";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/loaders/VideoGridSkeleton";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_authenticated/videos")({
  component: VideosPage,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(fetchVideosQueryOptions());
  },
});

function VideosPage() {
  return (
    <div className="container py-8 px-4 md:px-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit">Your Videos</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage your screen recordings
        </p>
      </div>
      <Suspense fallback={<VideoGridSkeleton />}>
        <VideoGrid />
      </Suspense>
    </div>
  );
}
