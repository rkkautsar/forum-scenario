import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { preview } from "./preview.ts";
import { excerpt } from "./text.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export type Context = {
  db: DatabaseSync;
  user: string;
  url: URL;
  body: () => Promise<any>;
  send: (status: number, value: unknown) => void;
};

export type Feature = {
  id: string;
  label: string;
  priority?: number;
  setup?: (db: DatabaseSync) => void;
  handle?: (method: string, path: string, ctx: Context) => Promise<boolean>;
  filter?: (posts: any[], ctx: Context) => any[];
  decorate?: (post: any, ctx: Context) => any;
};

export async function createForum(
  database = process.env.FORUM_DATABASE ?? join(root, "data/forum.sqlite"),
) {
  if (database !== ":memory:")
    mkdirSync(dirname(database), { recursive: true });

  const db = new DatabaseSync(database);
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY,authorId TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,body TEXT NOT NULL,createdAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS comments(id INTEGER PRIMARY KEY,postId INTEGER NOT NULL REFERENCES posts(id),authorId TEXT NOT NULL REFERENCES users(id),body TEXT NOT NULL,createdAt INTEGER NOT NULL,editedAt INTEGER);
    INSERT OR IGNORE INTO users VALUES('maya','Maya'),('sam','Sam'),('priya','Priya');`);

  if (!(db.prepare("SELECT COUNT(*) AS n FROM posts").get() as any).n) {
    const add = db.prepare(
      "INSERT INTO posts(authorId,title,body,createdAt) VALUES(?,?,?,?)",
    );
    add.run(
      "maya",
      "What are you working on this weekend?",
      "I finally got the old camera working. Share your projects, tiny victories, and things you are stuck on.",
      1000,
    );
    add.run(
      "priya",
      "Moving our community out of the group chat",
      "The chat moves too fast for useful answers to stick around. I would love a place where we can find old discussions again.",
      2000,
    );
    add.run(
      "sam",
      "Show us your desk setup",
      "Mine is a kitchen table and a monitor balanced on two books. Looking for practical ideas, not another shopping list.",
      3000,
    );
    db.prepare(
      "INSERT INTO comments(postId,authorId,body,createdAt) VALUES(?,?,?,?)",
    ).run(
      2,
      "maya",
      "Keeping the first release small will help. Posts and comments already work; the incoming contributions can cover the rest.",
      4000,
    );
  }

  const features: Feature[] = [];
  for (const file of readdirSync(join(root, "features"))
    .filter((f) => f.endsWith(".ts"))
    .sort()) {
    const { feature } = await import(
      pathToFileURL(join(root, "features", file)).href
    );
    feature.setup?.(db);
    features.push(feature);
  }

  features.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const app = createServer(async (req, res) => {
    const send = (status: number, value: unknown) => {
      res.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(value));
    };

    try {
      const url = new URL(req.url ?? "/", "http://localhost");

      if (
        url.pathname === "/" ||
        /^\/(app\.js|style\.css|features\/[a-z-]+\.js)$/.test(url.pathname)
      ) {
        const name =
            url.pathname === "/" ? "index.html" : url.pathname.slice(1),
          path = join(root, "web", name);

        if (!existsSync(path)) {
          send(404, { error: "Not found" });
          return;
        }

        res.writeHead(200, {
          "content-type": name.endsWith(".js")
            ? "text/javascript"
            : name.endsWith(".css")
              ? "text/css"
              : "text/html",
          "x-content-type-options": "nosniff",
        });
        res.end(readFileSync(path));
        return;
      }

      const user = String(req.headers["x-demo-user"] ?? "maya");

      if (!db.prepare("SELECT id FROM users WHERE id=?").get(user)) {
        send(401, { error: "Choose a demo user" });
        return;
      }

      let pending: Promise<any> | undefined;
      const body = () =>
        (pending ??= (async () => {
          let data = "";
          for await (const chunk of req) {
            data += chunk;

            if (Buffer.byteLength(data) > 10000)
              throw Error("Request too large");
          }

          return JSON.parse(data || "{}");
        })());
      const ctx: Context = { db, user, url, body, send };
      for (const f of features)
        if (await f.handle?.(req.method ?? "GET", url.pathname, ctx)) return;

      if (req.method === "GET" && url.pathname === "/api/users") {
        send(200, db.prepare("SELECT * FROM users").all());
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/features") {
        send(
          200,
          features.map((f) => ({ id: f.id, label: f.label })),
        );
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/posts") {
        let posts: any[] = db
          .prepare(
            "SELECT posts.*,users.name AS author FROM posts JOIN users ON users.id=posts.authorId ORDER BY createdAt DESC,id DESC",
          )
          .all();
        for (const f of features) if (f.filter) posts = f.filter(posts, ctx);

        posts = posts.map((p) => {
          let result = {
            ...p,
            preview: preview(p.body),
            comments: db
              .prepare(
                "SELECT comments.*,users.name AS author FROM comments JOIN users ON users.id=comments.authorId WHERE postId=? ORDER BY createdAt,id",
              )
              .all(p.id)
              .map((c: any) => ({ ...c, summary: excerpt(c.body, 80) })),
          };
          for (const f of features)
            if (f.decorate) result = f.decorate(result, ctx);

          return result;
        });
        send(200, posts);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/posts") {
        const input = await body(),
          title = String(input.title ?? "").trim(),
          content = String(input.body ?? "").trim();

        if (!title || title.length > 160 || !content || content.length > 5000) {
          send(400, {
            error:
              "Use a title up to 160 characters and a post up to 5000 characters.",
          });
          return;
        }

        const result = db
          .prepare(
            "INSERT INTO posts(authorId,title,body,createdAt) VALUES(?,?,?,?)",
          )
          .run(user, title, content, Date.now());
        send(201, { id: Number(result.lastInsertRowid) });
        return;
      }

      const match = /^\/api\/posts\/(\d+)\/comments$/.exec(url.pathname);

      if (req.method === "POST" && match) {
        if (!db.prepare("SELECT id FROM posts WHERE id=?").get(match[1])) {
          send(404, { error: "Post not found" });
          return;
        }

        const input = await body(),
          content = String(input.body ?? "").trim();

        if (!content || content.length > 2000) {
          send(400, { error: "Use a comment up to 2000 characters." });
          return;
        }

        const result = db
          .prepare(
            "INSERT INTO comments(postId,authorId,body,createdAt) VALUES(?,?,?,?)",
          )
          .run(match[1], user, content, Date.now());
        send(201, { id: Number(result.lastInsertRowid) });
        return;
      }

      send(404, { error: "Not found" });
    } catch (error) {
      send(400, { error: (error as Error).message });
    }
  });
  app.on("close", () => db.close());

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createForum();
  app.listen(Number(process.env.PORT ?? 3001), "127.0.0.1", () =>
    console.log("Forum: http://localhost:" + (process.env.PORT ?? 3001)),
  );
}
