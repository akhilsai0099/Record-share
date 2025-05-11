import { createAPIFileRoute } from "@tanstack/react-start/api";
import fs from "fs";
import path from "path";

export const APIRoute = createAPIFileRoute("/api/thumbnail/$id")({
  GET: async ({ params }) => {
    const { id } = params;

    try {
      // Check if the thumbnail exists
      const dirPath = path.join(process.cwd(), "videos");
      const thumbnailPath = path.join(dirPath, `${id}_thumb.jpg`);

      if (fs.existsSync(thumbnailPath)) {
        // Read the thumbnail file
        const fileBuffer = fs.readFileSync(thumbnailPath);

        // Create response headers
        const headers = new Headers({
          "Content-Type": "image/jpeg",
          "Cache-Control": "max-age=3600", // Cache for 1 hour
          "Access-Control-Allow-Origin": "*",
        });

        return new Response(fileBuffer, {
          status: 200,
          headers,
        });
      }

      // If thumbnail doesn't exist, return a fallback image or 404
      return new Response("Thumbnail not found", { status: 404 });
    } catch (error) {
      console.error("Error serving thumbnail:", error);
      return new Response("Error serving thumbnail", { status: 500 });
    }
  },
});
