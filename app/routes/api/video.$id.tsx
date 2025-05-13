import { s3Client } from "@/lib/s3-client";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createAPIFileRoute } from "@tanstack/react-start/api";

// Create a streaming API route for videos
export const APIRoute = createAPIFileRoute("/api/video/$id")({
  GET: async ({ request, params }) => {
    const { id } = params;
    const url = new URL(request.url);
    const isDownload = url.searchParams.has("download");
    const filename = url.searchParams.get("filename") || `video-${id}.webm`;

    try {
      // Get video from S3/R2 storage
      let fileSize: number;

      try {
        // Get the object metadata to determine size
        const headCommand = new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: id,
        });

        const headResponse = await s3Client.send(headCommand);
        fileSize = headResponse.ContentLength || 0;

        if (fileSize === 0) {
          throw new Error("File size is 0 or unknown");
        }
      } catch (s3Error) {
        console.error(`Error fetching video ${id} from S3/R2:`, s3Error);
        return new Response("Video not found", { status: 404 });
      }

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

        // Get the full object from S3/R2 but stream it to avoid memory issues
        const getCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: id,
        });

        const s3Response = await s3Client.send(getCommand);

        if (!s3Response.Body) {
          return new Response("Error retrieving video", { status: 500 });
        }

        // Create a ReadableStream from the S3 body stream
        const stream = s3Response.Body.transformToWebStream();

        return new Response(stream, {
          status: 200,
          headers,
        });
      }
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

        // Get the partial object from S3/R2 using Range header
        const getCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: id,
          Range: `bytes=${start}-${end}`,
        });

        // Use the stream directly from S3 response instead of loading into memory
        const s3Response = await s3Client.send(getCommand);

        if (!s3Response.Body) {
          return new Response("Error retrieving video chunk", { status: 500 });
        }

        // Create a ReadableStream from the S3 body stream
        const stream = s3Response.Body.transformToWebStream();

        return new Response(stream, {
          status: 206, // Partial Content
          headers,
        });
      } else {
        // if (request.method === "HEAD") {
        //   headers.set("Content-Length", fileSize.toString());
        //   return new Response(null, {
        //     status: 200,
        //     headers,
        //   });
        // }
        const metadataSize = Math.min(2 * 1024 * 1024, fileSize); // 2MB or file size

        // For Chrome, we'll use partial content approach even for initial request
        const start = 0;
        const end = metadataSize - 1;

        headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
        headers.set("Content-Length", fileSize.toString());

        // Get the beginning portion from S3/R2
        const getCommand = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: id,
          Range: `bytes=${start}-${end}`,
        });

        // Use the stream directly instead of loading into memory
        const s3Response = await s3Client.send(getCommand);

        if (!s3Response.Body) {
          return new Response("Error retrieving video metadata", {
            status: 500,
          });
        }

        // Create a ReadableStream from the S3 body stream
        const stream = s3Response.Body.transformToWebStream();

        return new Response(stream, {
          status: 206, // Partial Content
          headers,
        });
      }
    } catch (error) {
      console.error("Error streaming video:", error);
      return new Response("Error streaming video", { status: 500 });
    }
  },
});
