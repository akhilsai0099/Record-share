import { db } from "@/db";
import { videos } from "@/db/schema";
import { s3Client } from "@/lib/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import ffmpegStatic from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export async function uploadToR2(file: Blob, fileName: string, userId: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  };

  if (file.type.startsWith("video/")) {
    try {
      await uploadVideoWithThumbnail(buffer, fileName);
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      // Continue with the original upload even if thumbnail generation fails
    }
  }

  try {
    const result = await s3Client.send(new PutObjectCommand(uploadParams));
    if (result.$metadata.httpStatusCode === 200) {
      await db.insert(videos).values({
        fileName,
        size: buffer.length,
        createdAt: new Date(),
        id: fileName,
        thumbnailUrl: `/api/thumbnail/${fileName}_thumb.jpg`,
        title: "Recording " + fileName.substring(0, 8),
        userId: userId,
      });
    }
    return result;
  } catch (error) {
    console.error(`Error uploading ${fileName} to R2:`, error);
    throw error;
  }
}

async function uploadVideoWithThumbnail(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const tempDir = os.tmpdir();
  console.log("Temporary directory:", tempDir);
  const baseName = path.basename(fileName);

  // Create unique file names to avoid conflicts
  const uniquePrefix = Date.now().toString();
  const tempVideoPath = path.join(tempDir, `${uniquePrefix}_${baseName}`);
  const tempThumbnailPath = path.join(
    tempDir,
    `${uniquePrefix}_${fileName}_thumb.jpg`
  );

  try {
    const MAX_BYTES_FOR_THUMBNAIL = 5 * 1024 * 1024; // 5MB should be enough for the first frame
    const bytesToWrite = Math.min(buffer.length, MAX_BYTES_FOR_THUMBNAIL);
    const truncatedBuffer = buffer.slice(0, bytesToWrite);

    await writeFileAsync(tempVideoPath, truncatedBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .inputOptions([
          // Limit input processing to first few seconds
          "-t 3",
          // Seek to beginning to ensure we get the first frame
          "-ss 0",
        ])
        .on("error", (err) => {
          console.error("Error generating thumbnail:", err);
          reject(err);
        })
        .on("end", () => {
          resolve();
        })
        .screenshots({
          count: 1,
          folder: tempDir,
          filename: `${uniquePrefix}_${fileName}_thumb.jpg`,
          timestamps: ["00:00:00"], // Take screenshot at the very beginning
        });
    });

    const thumbnailExists = fs.existsSync(tempThumbnailPath);

    if (!thumbnailExists) {
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .inputOptions(["-t 3"])
          .on("error", (err) => {
            console.error("Error generating thumbnail (second attempt):", err);
            reject(err);
          })
          .on("end", () => {
            resolve();
          })
          .screenshots({
            count: 1,
            folder: tempDir,
            filename: `${uniquePrefix}_${fileName}_thumb.jpg`,
            timestamps: ["00:00:01"], // Try 1 second in
          });
      });
    }
    const thumbnailExistsNow = fs.existsSync(tempThumbnailPath);

    if (!thumbnailExistsNow) {
      throw new Error("Failed to generate thumbnail file");
    }

    const thumbnailBuffer = await fs.promises.readFile(tempThumbnailPath);

    const thumbnailKey = `${fileName}_thumb.jpg`;

    const thumbnailParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: "image/jpeg",
    };

    await s3Client.send(new PutObjectCommand(thumbnailParams));

    return thumbnailKey;
  } catch (error) {
    console.error("Error in uploadVideoWithThumbnail:", error);
    throw error;
  } finally {
    try {
      if (fs.existsSync(tempVideoPath)) {
        await unlinkAsync(tempVideoPath);
      }
      if (fs.existsSync(tempThumbnailPath)) {
        await unlinkAsync(tempThumbnailPath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temp files:", cleanupError);
    }
  }
}

export async function getListOfVideosFn(userID: string) {
  const userVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.userId, userID));

  return userVideos.map((item) => ({
    id: item.id,
    fileName: item.fileName,
    title: item.title || "Recording " + item.fileName?.substring(0, 8),
    createdAt: item.createdAt,
    size: item.size,
    thumbnailUrl: `/api/thumbnail/${item.fileName}`,
  }));
}

export async function getVideoMetadata(id: string) {
  console.log("Fetching video metadata for ID:", id);
  const response = await db.select().from(videos).where(eq(videos.id, id));
  if (!response) {
    throw new Error("Video not found");
  }
  return {
    id,
    fileName: response[0].fileName,
    title: response[0].title || "Recording " + id.substring(0, 8),
    createdAt: new Date(response[0].createdAt),
    size: response[0].size,
    thumbnailUrl: `/api/thumbnail/${id}`,
  };
}
