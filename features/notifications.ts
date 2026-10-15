import express from "express";
import type { ForumFeature } from "../src/server.ts";

const router = express.Router();
router.get("/notifications", (request, response) => {
  const db = request.app.locals.db;
  const user = request.user;
  const rows = db.prepare(
    "SELECT comments.body,comments.postId,posts.title FROM comments JOIN posts ON posts.id=comments.postId  ORDER BY comments.createdAt DESC LIMIT 20",
  ).all();
  response.json(rows);
});

export const feature: ForumFeature = { id: "notifications", label: "Replies to your threads", router };
