import type { Feature } from "../src/server.ts";
export const feature: Feature = {
  id: "search",
  label: "Find old discussions",
  priority: 10,
  filter(posts, { url }) {
    const query = (url.searchParams.get("q") ?? "").trim();
    if (!query) return posts;
    const needle = query.toLocaleLowerCase();
    return posts.filter((post) =>
      (post.title + " " + post.body).toLocaleLowerCase().includes(needle),
    );
  },
};
