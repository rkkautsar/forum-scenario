import test from "node:test";
import assert from "node:assert/strict";
import { feature } from "../features/empty-state.ts";

test("empty states do not change the feed data", () =>
  assert.equal(feature.filter, undefined));
