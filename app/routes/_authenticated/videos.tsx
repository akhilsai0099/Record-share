import { listVideos } from "@/actions/serverFns";
import { Video, VideoGrid } from "@/components/VideoGrid";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_authenticated/videos")({
  component: VideosPage,
  loader: async ({ context }) => {
    return await listVideos();
  },
  pendingComponent: () => <div>Loading...</div>,
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
      <Suspense fallback={<div>Loading...</div>}>
        <VideoGrid />
      </Suspense>
    </div>
  );
}
