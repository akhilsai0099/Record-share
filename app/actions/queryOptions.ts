import { queryOptions } from "@tanstack/react-query";
import { fetchUser } from "./auth";
import { listVideos } from "./serverFns";

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
