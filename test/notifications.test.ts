import test from "node:test";
import assert from "node:assert/strict";
import { session } from "./helpers.ts";

test("notifications return recent activity", () =>
  session(async (request) => {
    const response = await request("/api/notifications");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.data));
  }));
