import { getListOfVideosFn } from "@/actions/videoActions";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { VideoGrid, Video } from "@/components/VideoGrid";

const listVideos = createServerFn({
  method: "GET",
}).handler(async () => {
  return getListOfVideosFn();
});

export const Route = createFileRoute("/_authenticated/videos")({
  component: VideosPage,
  loader: async () => {
    return await listVideos();
  },
});

function VideosPage() {
  const videoData = Route.useLoaderData();

  // Convert string dates to Date objects
  const videos: Video[] = videoData.map((video: any) => ({
    ...video,
    createdAt: new Date(video.createdAt),
  }));

  return (
    <div className="container py-8 px-4 md:px-6 mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-outfit">Your Videos</h1>
        <p className="text-muted-foreground mt-2">
          Browse and manage your screen recordings
        </p>
      </div>

      <VideoGrid videos={videos} />
    </div>
  );
}
