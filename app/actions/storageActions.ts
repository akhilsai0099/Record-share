import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { promisify } from "util";
import os from "os";
import { createServerFn } from "@tanstack/react-start";

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export async function uploadToR2(file: Blob, fileName: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  };

  // Set thumbnailKey as string | undefined
  let thumbnailKey: string | undefined;

  if (file.type.startsWith("video/")) {
    try {
      thumbnailKey = await uploadVideoWithThumbnail(buffer, fileName);
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      // Continue with the original upload even if thumbnail generation fails
    }
  }

  try {
    const result = await s3Client.send(new PutObjectCommand(uploadParams));

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

export async function getListOfVideosFn() {
  const getListCommand = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME,
    Prefix: "",
  });

  const { Contents } = await s3Client.send(getListCommand);
  if (!Contents) {
    return [];
  }
  const videos = Contents.map((item) => {
    if (item.Key?.endsWith("_thumb.jpg")) {
      return; // Skip thumbnail files
    }
    return {
      id: item.Key,
      fileName: item.Key,
      title: "Recording " + item?.Key?.substring(0, 8),
      createdAt: item.LastModified,
      size: item.Size,
      thumbnailUrl: `/api/thumbnail/${item?.Key}`,
    };
  });
  return videos;
}
