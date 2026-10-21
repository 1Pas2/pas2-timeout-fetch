import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import * as api from "../dist/index.js";
test("rejects overflowing timers", async () => {
  await assert.rejects(
    api.timeoutFetch("https://x.test", 2147483648),
    RangeError,
  );
});
test("success", async () =>
  assert.equal(
    (
      await api.timeoutFetch(
        "https://x.test",
        100,
        {},
        async () => new Response("ok"),
      )
    ).status,
    200,
  ));
test("timeout propagates", async () =>
  await assert.rejects(
    api.timeoutFetch(
      "https://x.test",
      5,
      {},
      async (_i, o) =>
        new Promise((_r, j) =>
          o.signal.addEventListener("abort", () => j(o.signal.reason)),
        ),
    ),
    { name: "TimeoutError" },
  ));
test("caller abort", async () => {
  const c = new AbortController();
  c.abort(new Error("cancelled"));
  await assert.rejects(
    api.timeoutFetch("https://x.test", 50, { signal: c.signal }),
    /cancelled/,
  );
});
