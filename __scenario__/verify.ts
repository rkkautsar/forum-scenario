import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const repository = resolve(new URL("..", import.meta.url).pathname);
const scenario = readFileSync(
  join(repository, "__scenario__/scenario.yaml"),
  "utf8",
);
const version = scenario.match(/^version:\s*([^\s#]+)/m)?.[1];
const prefix = scenario.match(/^refPrefix:\s*([^\s#]+)/m)?.[1];

if (!version || !prefix) {
  throw new Error("scenario.yaml must define version and refPrefix");
}

const refs = [
  ...new Set(
    execFileSync(
      "git",
      [
        "for-each-ref",
        "--format=%(refname)",
        "refs/heads",
        "refs/remotes/origin",
      ],
      {
        cwd: repository,
        encoding: "utf8",
      },
    )
      .trim()
      .split("\n")
      .map((ref) =>
        ref
          .replace(/^refs\/heads\//, "")
          .replace(/^refs\/remotes\/origin\//, ""),
      )
      .filter(
        (ref) =>
          ref.startsWith(`${prefix}stage/`) &&
          /\/(?:base|initial|rev-[1-3])$/.test(ref),
      ),
  ),
];

if (!refs.some((ref) => ref.endsWith("/base"))) {
  throw new Error(`No captured stage refs found under ${prefix}stage/`);
}

try {
  execFileSync("git", ["show-ref", "--verify", "--quiet", "refs/heads/main"], {
    cwd: repository,
    stdio: "ignore",
  });
  refs.push("main");
} catch {
  // Some author checkouts may omit main; the captured refs are still verified.
}

const temporary = mkdtempSync(join(tmpdir(), "forum-snapshots-"));
const dependencyDirectory = join(repository, "node_modules");

function run(command: string, args: string[], cwd: string): void {
  console.log(`\n[${cwd.split("/").at(-1)}] ${command} ${args.join(" ")}`);
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function witnessTest(caseId: string): string {
  const headers = `import test from "node:test";\nimport assert from "node:assert/strict";\nimport { session } from "./helpers.ts";\n`;
  const bodies: Record<string, string> = {
    "comment-edit": `test("a member cannot edit another member's comment", () => session(async (request) => {\n  const post = (await request("/api/posts")).data.find((item) => item.id === 2);\n  const comment = post.comments[0];\n  const response = await request("/api/comments/" + comment.id, { method: "PATCH", headers: { "x-demo-user": "sam" }, body: JSON.stringify({ authorId: "sam", body: "forged" }) });\n  assert.equal(response.status, 403);\n  const own = await request("/api/comments/" + comment.id, { method: "PATCH", body: JSON.stringify({ authorId: "maya", body: "fixed" }) });\n  assert.equal(own.status, 200);\n}));`,
    bookmarks: `test("saved threads are private to their member", () => session(async (request) => {\n  await request("/api/posts/1/bookmark", { method: "POST" });\n  await request("/api/posts/2/bookmark", { method: "POST", headers: { "x-demo-user": "sam" } });\n  const saved = await request("/api/posts?saved=1", { headers: { "x-demo-user": "sam" } });\n  assert.deepEqual(saved.data.map((post) => post.id), [2]);\n}));`,
    pagination: `test("pagination rejects NaN and fractional values", () => session(async (request) => {\n  assert.equal((await request("/api/posts?offset=NaN")).status, 400);\n  assert.equal((await request("/api/posts?limit=1.5")).status, 400);\n}));`,
    "search-regex": `test("search treats punctuation as literal text", () => session(async (request) => {\n  const malformed = await request("/api/posts?q=%5B");\n  assert.equal(malformed.status, 200);\n  const metacharacter = await request("/api/posts?q=CAMERA.");\n  assert.equal(metacharacter.status, 200);\n  assert.equal(metacharacter.data.length, 0);\n}));`,
    notifications: `test("notifications are private replies to the current member", () => session(async (request) => {\n  const created = await request("/api/posts", { method: "POST", headers: { "x-demo-user": "sam" }, body: JSON.stringify({ title: "Sam's question", body: "Help" }) });\n  await request("/api/posts/" + created.data.id + "/comments", { method: "POST", headers: { "x-demo-user": "maya" }, body: JSON.stringify({ body: "A reply" }) });\n  const replies = await request("/api/notifications", { headers: { "x-demo-user": "sam" } });\n  assert.ok(replies.data.length > 0);\n  assert.ok(replies.data.every((reply) => reply.postId === created.data.id));\n}));`,
    "rich-text": `import React from "react";\nimport { renderToStaticMarkup } from "react-dom/server";\nimport { PostBody } from "../web/features/rich-text.tsx";\ntest("post formatting escapes HTML and retains allowed formatting", () => {\n  const markup = renderToStaticMarkup(React.createElement(PostBody, { post: { body: "<img src=x onerror=alert(1)> **bold**\\nline" } }));\n  assert.ok(markup.includes("&lt;img"));\n  assert.ok(!markup.includes("<img"));\n  assert.ok(markup.includes("<strong>bold</strong>"));\n  assert.ok(markup.includes("<br"));\n});`,
  };
  if (bodies[caseId]) return headers + bodies[caseId];
  return "";
}

function verifyRuntimeWitness(
  root: string,
  caseId: string,
  shouldPass: boolean,
): void {
  const body = witnessTest(caseId);
  if (!body) return;
  const path = join(root, "test/__scenario-witness.test.ts");
  writeFileSync(path, body);
  let passed = false;
  try {
    execFileSync(
      "node",
      ["--import", "tsx", "--test", "test/__scenario-witness.test.ts"],
      {
        cwd: root,
        stdio: "ignore",
      },
    );
    passed = true;
  } catch {
    // An initial snapshot must fail its requirement witness.
  } finally {
    unlinkSync(path);
  }
  if (passed !== shouldPass) {
    throw new Error(
      `${caseId} ${shouldPass ? "revision should pass" : "initial should fail"} its semantic witness`,
    );
  }
}

function verifySemanticWitnesses(): void {
  const captures = new Map<string, string>();
  for (const ref of refs) {
    const name = ref.replace(`${prefix}stage/`, "");
    const destination = join(temporary, name.replaceAll("/", "__"));
    const archive = execFileSync("git", ["archive", "--format=tar", ref], {
      cwd: repository,
    });
    execFileSync("mkdir", ["-p", destination]);
    execFileSync("tar", ["-xf", "-", "-C", destination], { input: archive });
    symlinkSync(dependencyDirectory, join(destination, "node_modules"), "dir");
    captures.set(name, destination);
    run("npm", ["test"], destination);
    run("node_modules/.bin/tsc", ["--noEmit"], destination);
    run("npm", ["run", "build", "--", "--configLoader", "runner"], destination);
  }

  const capture = (caseId: string, revision: string) => {
    const key = `launch/${caseId}/${revision}`;
    const result = captures.get(key);
    if (!result) throw new Error(`Missing captured ref ${prefix}stage/${key}`);
    return result;
  };

  for (const caseId of [
    "comment-edit",
    "bookmarks",
    "pagination",
    "search-regex",
    "rich-text",
  ]) {
    const before = capture(caseId, "initial");
    const after = capture(caseId, "rev-1");
    verifyRuntimeWitness(before, caseId, false);
    verifyRuntimeWitness(after, caseId, true);
  }

  const previewInitial = readFileSync(
    join(capture("compact-previews", "initial"), "src/preview.ts"),
    "utf8",
  );
  const previewFixed = readFileSync(
    join(capture("compact-previews", "rev-1"), "src/preview.ts"),
    "utf8",
  );
  if (!/slice\(/.test(previewInitial) || /excerpt\(/.test(previewInitial)) {
    throw new Error(
      "compact-previews initial must demonstrate a duplicate preview implementation",
    );
  }
  if (
    !/import\s*\{\s*excerpt\s*\}/.test(previewFixed) ||
    !/return\s+excerpt\(/.test(previewFixed)
  ) {
    throw new Error(
      "compact-previews rev-1 must delegate to the shared excerpt helper",
    );
  }

  const notificationsInitial = captures.get("growing/notifications/initial");
  const notificationsFixed = captures.get("growing/notifications/rev-1");
  if (!notificationsInitial || !notificationsFixed)
    throw new Error("Missing notifications captures");
  verifyRuntimeWitness(notificationsInitial, "notifications", false);
  verifyRuntimeWitness(notificationsFixed, "notifications", true);
  for (const snapshot of [notificationsInitial, notificationsFixed]) {
    const ui = readFileSync(
      join(snapshot, "web/features/notifications.tsx"),
      "utf8",
    );
    if (
      !/type ReplyState = \{ user: string; items: Reply\[\] \}/.test(ui) ||
      !/setReplies\(\{ user, items: await api\("\/api\/notifications"\) \}\)/.test(
        ui,
      ) ||
      !/replies\?\.user === user/.test(ui)
    ) {
      throw new Error(
        "notification replies must remain hidden after a demo-identity switch",
      );
    }
  }
}

try {
  verifySemanticWitnesses();
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
