import { getVideoFn } from "@/actions/videoActions";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import fs from "fs";
import path from "path";
import { setTimeout } from "timers/promises";

// Create a streaming API route for videos
export const APIRoute = createAPIFileRoute("/api/video/$id")({
  GET: async ({ request, params }) => {
    const { id } = params;
    const url = new URL(request.url);
    const isDownload = url.searchParams.has("download");
    const filename = url.searchParams.get("filename") || `video-${id}.webm`;

    try {
      // Get the video file path
      const dirPath = path.join(process.cwd(), "videos");
      const filePath = path.join(dirPath, `${id}.webm`);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return new Response("Video not found", { status: 404 });
      }

      // Get file stats to determine size
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;

      // Create response headers with necessary CORS and caching headers
      const headers = new Headers({
        "Content-Type": "video/webm",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache", // Disable caching to ensure fresh metadata
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Access-Control-Expose-Headers":
          "Content-Range, Content-Length, Accept-Ranges",
      });

      // If this is a download request, handle it differently
      if (isDownload) {
        headers.set(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        headers.set("Content-Length", fileSize.toString());

        // Use streams for efficient file transfer
        const fileStream = fs.createReadStream(filePath);
        return new Response(fileStream as any, {
          status: 200,
          headers,
        });
      }
      await setTimeout(5000); // Simulate a delay for testing
      // Check for range request (video seeking)
      const rangeHeader = request.headers.get("range");

      if (rangeHeader) {
        // Parse range header
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Ensure end doesn't exceed file size
        if (end >= fileSize) {
          end = fileSize - 1;
        }

        // Calculate chunk size
        const chunkSize = end - start + 1;

        // Set up partial content response with proper headers
        headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        headers.set("Content-Length", chunkSize.toString());

        // Read the file chunk instead of streaming
        const buffer = fs.readFileSync(filePath).subarray(start, end + 1);

        // Return response with the buffer
        return new Response(buffer, {
          status: 206, // Partial Content
          headers,
        });
      } else {
        // For Chrome compatibility, we need to:
        // 1. Send a HEAD response for the browser to discover metadata
        // 2. Send a larger initial chunk that includes metadata

        // Check if it's a HEAD request
        if (request.method === "HEAD") {
          headers.set("Content-Length", fileSize.toString());
          return new Response(null, {
            status: 200,
            headers,
          });
        }

        // For the initial GET request without range, send enough data for Chrome to parse metadata
        // WebM metadata is typically at the beginning, so send the first 2MB or the whole file if smaller
        const metadataSize = Math.min(2 * 1024 * 1024, fileSize); // 2MB or file size

        // For Chrome, we'll use partial content approach even for initial request
        const start = 0;
        const end = metadataSize - 1;

        headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        headers.set("Content-Length", metadataSize.toString());

        // Read the beginning portion that contains metadata
        const buffer = fs.readFileSync(filePath).subarray(start, end + 1);

        // Return as partial content to encourage Chrome to load metadata and make range requests
        return new Response(buffer, {
          status: 206, // Partial Content
          headers,
        });
      }
    } catch (error) {
      return new Response("Error streaming video", { status: 500 });
    }
  },
});
