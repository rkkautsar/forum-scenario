import type { Feature } from "../src/server.ts";

export const feature: Feature = {
  id: "notifications",
  label: "Replies to your threads",

  async handle(method, path, { db, user, send }) {
    if (method !== "GET" || path !== "/api/notifications") return false;

    const rows = db
      .prepare(
        "SELECT comments.body,comments.postId,posts.title FROM comments JOIN posts ON posts.id=comments.postId WHERE posts.authorId=? AND comments.authorId<>? ORDER BY comments.createdAt DESC LIMIT 20",
      )
      .all(user, user);
    send(200, rows);
    return true;
  },
};
