import type { Feature } from "../src/server.ts";
export const feature: Feature = {
  id: "search",
  label: "Find old discussions",
  priority: 10,
  filter(posts, { url }) {
    const query = (url.searchParams.get("q") ?? "").trim();
    if (!query) return posts;
    const pattern = new RegExp(query, "i");
    return posts.filter((post) => pattern.test(post.title + " " + post.body));
  },
};
