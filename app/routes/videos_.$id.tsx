import { getListOfVideosFn } from "@/actions/videoActions";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { ArrowLeft, Clock, Download, Share2 } from "lucide-react";
import { useState } from "react";

// Create server function to get video data directly
const getVideoById = createServerFn({
  method: "GET",
})
  .validator((videoId: string) => videoId)
  .handler(async ({ data: videoId }) => {
    const allVideos = await getListOfVideosFn();
    const video = allVideos.find((v) => v.id === videoId);
    if (!video) {
      throw new Error(`Video with ID ${videoId} not found`);
    }
    return {
      ...video,
      createdAt: new Date(video.createdAt),
    };
  });

export const Route = createFileRoute("/videos_/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    try {
      return await getVideoById({ data: params.id });
    } catch (error) {
      console.error("Error loading video:", error);
      return null;
    }
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const video = Route.useLoaderData();
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Format date
  const formatDate = (date: Date): string => {
    return format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  };

  // Handle download
  const handleDownload = () => {
    const safeFilename = encodeURIComponent(video?.title || `video-${id}`);

    const downloadUrl = `/api/video/${id}?download=true&filename=${safeFilename}.webm`;

    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = safeFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Handle video loading errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoError(
      `Error playing video: ${e.currentTarget.error?.message || "Unknown error"}`
    );
    console.error("Video error:", e.currentTarget.error);
  };

  // Handle video loaded
  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video?.title || "Shared Video",
          text: "Check out this video!",
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (videoError) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
            Video Error
          </h2>
          <p className="text-red-500">{videoError}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/videos">Return to Videos</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="p-8 text-center bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">
            Video Not Found
          </h2>
          <p className="text-muted-foreground">
            The requested video could not be found.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/videos">Return to Videos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-4 px-4 md:py-8">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <Link to="/videos">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to videos
        </Link>
      </Button>

      {/* Video Player */}
      <div className="rounded-lg overflow-hidden shadow-lg bg-black mb-6">
        <VideoPlayer
          videoSrc={`/api/video/${id}`}
          onError={handleVideoError}
          poster={video.thumbnailUrl}
          onLoaded={handleVideoLoaded}
        />
      </div>

      {/* Title and Actions */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between mt-2 gap-4">
          <div className="flex items-center text-muted-foreground text-sm">
            <Clock className="h-4 w-4 mr-1.5" />
            <span>Recording from</span>
            <time
              className="ml-1 font-medium"
              dateTime={video.createdAt.toISOString()}
            >
              {formatDate(video.createdAt)}
            </time>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Video Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                File name
              </dt>
              <dd className="mt-1 text-sm">{video.fileName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                File size
              </dt>
              <dd className="mt-1 text-sm">{formatFileSize(video.size)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-sm">{formatDate(video.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">ID</dt>
              <dd className="mt-1 text-sm font-mono text-xs break-all">
                {video.id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="md:border-l md:pl-6 pt-4 md:pt-0">
          <h2 className="text-lg font-semibold mb-3">Thumbnail</h2>
          <div className="aspect-video rounded-lg overflow-hidden border">
            <img
              src={video.thumbnailUrl}
              alt={`Thumbnail for ${video.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-thumbnail.jpg"; // Fallback image
              }}
            />
          </div>
          <div className="mt-4">
            <Button variant="secondary" size="sm" className="w-full">
              Set custom thumbnail
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
