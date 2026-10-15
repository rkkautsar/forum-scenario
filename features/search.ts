import type { ForumFeature } from "../src/server.ts";

export const feature: ForumFeature = {
  id: "search",
  label: "Find old discussions",
  priority: 10,
  filterPosts(posts, request) {
    const query = String(request.query.q ?? "").trim();
    if (!query) return posts;
    const expression = new RegExp(query, "i");
    return posts.filter((post) => expression.test(post.title + " " + post.body));
  },
};
