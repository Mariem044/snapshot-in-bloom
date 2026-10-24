import { queryOptions } from "@tanstack/react-query";
import { getClassStats } from "./game.functions";

export const statsQuery = queryOptions({
  queryKey: ["class-stats"],
  queryFn: () => getClassStats(),
  refetchInterval: 15000,
});
