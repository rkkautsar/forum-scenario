import type { Feature } from "../src/server.ts";

export const feature: Feature = {
  id: "bookmarks",
  label: "Save a thread for later",

  setup(db) {
    db.exec(
      "CREATE TABLE IF NOT EXISTS bookmarks(postId INTEGER REFERENCES posts(id),userId TEXT REFERENCES users(id),PRIMARY KEY(postId,userId))",
    );
  },

  decorate(post, { db, user }) {
    return {
      ...post,
      saved: !!db
        .prepare("SELECT 1 FROM bookmarks WHERE postId=? AND userId=?")
        .get(post.id, user),
    };
  },

  filter(posts, { url, db, user }) {
    if (url.searchParams.get("saved") !== "1") return posts;

    const saved = new Set(
      db
        .prepare("SELECT postId FROM bookmarks")
        .all()
        .map((r: any) => r.postId),
    );

    return posts.filter((post) => saved.has(post.id));
  },

  async handle(method, path, { db, user, send }) {
    const match = /^\/api\/posts\/(\d+)\/bookmark$/.exec(path);

    if (!["POST", "DELETE"].includes(method) || !match) return false;

    if (!db.prepare("SELECT id FROM posts WHERE id=?").get(match[1])) {
      send(404, { error: "Post not found" });
      return true;
    }

    if (method === "POST")
      db.prepare("INSERT OR IGNORE INTO bookmarks VALUES(?,?)").run(
        match[1],
        user,
      );
    else
      db.prepare("DELETE FROM bookmarks WHERE postId=? AND userId=?").run(
        match[1],
        user,
      );

    send(200, { saved: method === "POST" });
    return true;
  },
};
