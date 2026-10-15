import type { Feature } from "../src/server.ts";

export const feature: Feature = {
  id: "pagination",
  label: "Browse older threads",
  priority: 20,

  filter(posts, { url }) {
    const offset = Number(url.searchParams.get("offset") ?? 0),
      limit = Number(url.searchParams.get("limit") ?? 2);

    if (offset < 0 || limit < 1 || limit > 50)
      throw Error("Invalid pagination");

    return posts.slice(offset, offset + limit);
  },
};
