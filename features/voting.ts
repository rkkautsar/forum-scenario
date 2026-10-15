import type { Feature } from "../src/server.ts";

type VoteStep = (postId: string, userId: string) => void;

class VotingPipeline {
  private steps: VoteStep[] = [];
  use(step: VoteStep) {
    this.steps.push(step);

    return this;
  }
  execute(postId: string, userId: string) {
    for (const step of this.steps) step(postId, userId);
  }
}

export const feature: Feature = {
  id: "voting",
  label: "Vote on threads",

  setup(db) {
    db.exec(
      "CREATE TABLE IF NOT EXISTS votes(postId INTEGER REFERENCES posts(id),userId TEXT REFERENCES users(id),PRIMARY KEY(postId,userId))",
    );
  },

  decorate(post, { db }) {
    return {
      ...post,
      score: (
        db
          .prepare("SELECT COUNT(*) AS n FROM votes WHERE postId=?")
          .get(post.id) as any
      ).n,
    };
  },

  async handle(method, path, { db, user, send }) {
    const match = /^\/api\/posts\/(\d+)\/votes$/.exec(path);

    if (method !== "POST" || !match) return false;

    if (!db.prepare("SELECT id FROM posts WHERE id=?").get(match[1])) {
      send(404, { error: "Post not found" });
      return true;
    }

    new VotingPipeline()
      .use((postId, userId) => {
        db.prepare(
          "INSERT OR IGNORE INTO votes(postId,userId) VALUES(?,?)",
        ).run(postId, userId);
      })
      .execute(match[1], user);
    send(200, {
      score: (
        db
          .prepare("SELECT COUNT(*) AS n FROM votes WHERE postId=?")
          .get(match[1]) as any
      ).n,
    });
    return true;
  },
};
