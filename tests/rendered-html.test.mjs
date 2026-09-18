import assert from "node:assert/strict";
import test from "node:test";

test("portfolio renders its content and usable navigation without client JavaScript", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Full-stack Developer/);
  assert.match(html, /Ideas into/);
  for (const id of ["home", "work", "about", "stack", "contact"]) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
  assert.match(html, /Project placeholders/);
  assert.match(html, /Your email goes here/);
  assert.doesNotMatch(html, /href="(?:#|mailto:)"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
  assert.match(html, /aria-label="Filter projects"/);
  assert.match(html, /aria-label="Play 3D animation"/);
  assert.match(html, /aria-labelledby="project-dialog-title"/);
});
