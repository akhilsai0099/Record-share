import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

// Set the ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export const saveVideoFn = async (blob: Blob, sessionId: string) => {
  const buffer = Buffer.from(await blob.arrayBuffer());

  const dirPath = path.join(process.cwd(), "videos");
  const filePath = path.join(dirPath, `${sessionId}.webm`);
  const thumbnailPath = path.join(dirPath, `${sessionId}_thumb.jpg`);

  // Ensure the "videos" directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Save the video file
  await new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  // Extract the first frame as a thumbnail
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .on("error", (err) => {
          console.error("Error generating thumbnail:", err);
          reject(err);
        })
        .on("end", () => {
          resolve();
        })
        .screenshots({
          count: 1,
          folder: dirPath,
          filename: `${sessionId}_thumb.jpg`,
          timestamps: ["00:00:01"], // Take screenshot at 1 second
        });
    });
  } catch (error) {
    console.error("Failed to generate thumbnail:", error);
    // Continue even if thumbnail generation fails
  }
};

export const getListOfVideosFn = async () => {
  const dirPath = path.join(process.cwd(), "videos");

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const videos = await Promise.all(
    files
      .filter((file) => file.endsWith(".webm"))
      .map(async (file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);

        // Extract video ID (removing the .webm extension)
        const id = file.replace(".webm", "");

        // Create a readable title from the ID
        const readableTitle = "Recording " + id.substring(0, 8);

        // Check if thumbnail exists
        const thumbnailPath = path.join(dirPath, `${id}_thumb.jpg`);
        const hasThumbnail = fs.existsSync(thumbnailPath);

        return {
          id,
          fileName: file,
          title: readableTitle,
          createdAt: stats.birthtime,
          size: stats.size,
          // Use actual thumbnail if available, otherwise use api endpoint
          thumbnailUrl: hasThumbnail
            ? `/videos/${id}_thumb.jpg`
            : `/api/thumbnail/${id}`,
        };
      })
  );

  return videos;
};

export const getVideoFn = async (
  sessionId: string,
  checkExistenceOnly = false
) => {
  const dirPath = path.join(process.cwd(), "videos");
  const filePath = path.join(dirPath, `${sessionId}.webm`);

  if (!fs.existsSync(filePath)) {
    throw new Error("Video not found");
  }

  // If we just want to check existence, return true
  if (checkExistenceOnly) {
    return true;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("Error reading video file", err);
    throw new Error("Failed to stream video");
  });
  return stream;
};
