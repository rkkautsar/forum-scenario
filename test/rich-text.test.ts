import test from "node:test";
import assert from "node:assert/strict";
import { feature } from "../features/rich-text.ts";

test("formatting leaves server routes unchanged", () =>
  assert.equal(feature.handle, undefined));
