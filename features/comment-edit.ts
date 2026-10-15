import type { Feature } from "../src/server.ts";

export const feature: Feature = {
  id: "comment-edit",
  label: "Edit your comments",

  async handle(method, path, { db, user, body, send }) {
    const match = /^\/api\/comments\/(\d+)$/.exec(path);

    if (method !== "PATCH" || !match) return false;

    const comment = db
      .prepare("SELECT * FROM comments WHERE id=?")
      .get(match[1]) as any;

    if (!comment) {
      send(404, { error: "Comment not found" });
      return true;
    }

    const input = await body();

    if (comment.authorId !== user) {
      send(403, { error: "Only the author can edit this comment" });
      return true;
    }

    const content = String(input.body ?? "").trim();

    if (!content || content.length > 2000) {
      send(400, { error: "Use a comment up to 2000 characters" });
      return true;
    }

    db.prepare("UPDATE comments SET body=?,editedAt=? WHERE id=?").run(
      content,
      Date.now(),
      comment.id,
    );
    send(200, { ...comment, body: content });
    return true;
  },
};
