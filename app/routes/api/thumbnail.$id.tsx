import { createAPIFileRoute } from "@tanstack/react-start/api";
import { s3Client } from "@/lib/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export const APIRoute = createAPIFileRoute("/api/thumbnail/$id")({
  GET: async ({ params }) => {
    const { id } = params;

    try {
      // Generate the thumbnail key based on the id
      // Try both naming patterns in case of changes to how thumbnails are named
      const possibleThumbnailKeys = [
        `${id}_thumb.jpg`, // Original pattern used in filesystem
        // In case id includes file extension
      ];

      // Try each possible key
      for (const thumbnailKey of possibleThumbnailKeys) {
        try {
          console.log(
            `Attempting to fetch thumbnail with key: ${thumbnailKey}`
          );

          // Get the thumbnail from R2 storage
          const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: thumbnailKey,
          });

          // Get the object from R2
          const response = await s3Client.send(command);

          // Read the stream
          const bodyContents = await response.Body?.transformToByteArray();

          if (!bodyContents) {
            continue; // Try next key pattern
          }

          // Create response headers
          const headers = new Headers({
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=3600", // Cache for 1 hour
            "Access-Control-Allow-Origin": "*",
          });

          console.log(
            `Successfully retrieved thumbnail with key: ${thumbnailKey}`
          );
          return new Response(bodyContents, {
            status: 200,
            headers,
          });
        } catch (s3Error) {
          console.error(
            `Error fetching thumbnail with key ${thumbnailKey} from R2:`,
            s3Error
          );
          // Continue to try the next pattern
        }
      }

      // If we get here, all R2 attempts failed, try local filesystem as fallback
      try {
        const dirPath = path.join(process.cwd(), "videos");
        const thumbnailPath = path.join(dirPath, `${id}_thumb.jpg`);

        if (fs.existsSync(thumbnailPath)) {
          // Read the thumbnail file from local filesystem
          const fileBuffer = fs.readFileSync(thumbnailPath);

          // Create response headers
          const headers = new Headers({
            "Content-Type": "image/jpeg",
            "Cache-Control": "max-age=3600", // Cache for 1 hour
            "Access-Control-Allow-Origin": "*",
          });

          console.log(
            `Serving thumbnail ${id} from local filesystem as fallback`
          );
          return new Response(fileBuffer, {
            status: 200,
            headers,
          });
        }
      } catch (fsError) {
        console.error(
          "Error fetching thumbnail from filesystem fallback:",
          fsError
        );
      }

      // If all attempts fail, return 404
      return new Response("Thumbnail not found", { status: 404 });
    } catch (error) {
      console.error("Error serving thumbnail:", error);
      return new Response("Error serving thumbnail", { status: 500 });
    }
  },
});
