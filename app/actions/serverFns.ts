import { authenticated } from "@/middleware/authenticated";
import { createServerFn } from "@tanstack/react-start";
import { getListOfVideosFn, getVideoMetadata } from "./storageActions";

export const listVideos = createServerFn({
  method: "GET",
})
  .middleware([authenticated])
  .handler(async ({ context }) => {
    return getListOfVideosFn(context.user.id);
  });

export const videoMetadataFn = createServerFn({
  method: "GET",
})
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return await getVideoMetadata(data.id);
  });
