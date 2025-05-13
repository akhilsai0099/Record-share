import { queryOptions } from "@tanstack/react-query";
import { fetchUser } from "./auth";
import { listVideos, videoMetadataFn } from "./serverFns";

export const fetchUserQueryOptions = () =>
  queryOptions({
    queryKey: ["userInfo"],
    queryFn: fetchUser,
  });

export const fetchVideosQueryOptions = () =>
  queryOptions({
    queryKey: ["listVideos"],
    queryFn: listVideos,
  });

export const fetchVideoMetadataQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["videoMetadata", id],
    queryFn: () => videoMetadataFn({ data: { id } }),
  });
