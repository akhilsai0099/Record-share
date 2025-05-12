import { createServerFn } from "@tanstack/react-start";
import { getListOfVideosFn } from "./storageActions";
import { setTimeout } from "timers/promises";

export const listVideos = createServerFn({
  method: "GET",
}).handler(async () => {
  await setTimeout(10000);
  return getListOfVideosFn();
});
