import { queryOptions } from "@tanstack/react-query";
import { fetchUser } from "./auth";

export const fetchUserQueryOptions = () =>
  queryOptions({
    queryKey: ["userInfo"],
    queryFn: fetchUser,
  });
