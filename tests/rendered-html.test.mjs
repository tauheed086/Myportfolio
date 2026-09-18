import assert from "node:assert/strict";
import test from "node:test";

test("renders a full-screen wave portfolio with usable overlay controls", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Your Name/);
  assert.match(html, /is a full-stack developer/);
  assert.match(html, /class="wave-scene/);
  assert.match(html, /Explore my projects/);
  assert.match(html, /View scene only/);
  assert.match(html, /aria-label="Play animation"/);
  assert.match(html, /aria-labelledby="panel-title"/);
  assert.doesNotMatch(html, /mini-dashboard|hero-actions|stack-strip|codex-preview/);
});
