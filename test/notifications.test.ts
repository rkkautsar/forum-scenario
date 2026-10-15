import test from "node:test";
import assert from "node:assert/strict";
import { session } from "./helpers.ts";

test("replies list includes only other members on the current member's threads", () =>
  session(async (request) => {
    const created = await request("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title: "My question", body: "Can anyone help?" }),
    });
    await request(`/api/posts/${created.data.id}/comments`, {
      method: "POST",
      headers: { "x-demo-user": "sam" },
      body: JSON.stringify({ body: "I can help." }),
    });

    const mayaReplies = await request("/api/notifications");
    assert.equal(mayaReplies.data[0].title, "My question");
    assert.equal(
      (
        await request("/api/notifications", {
          headers: { "x-demo-user": "sam" },
        })
      ).data.length,
      0,
    );
  }));
