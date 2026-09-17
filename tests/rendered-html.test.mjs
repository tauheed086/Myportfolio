import assert from "node:assert/strict";
import test from "node:test";
import worker from "../dist/server/index.js";
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };
async function request(path) { return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx); }
test("homepage exposes all essential content without loading WebGL", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const id of ["work", "lab", "about", "skills", "experience", "contact"]) assert.ok(html.includes(`id="${id}"`), `Missing section: ${id}`);
  assert.match(html, /Interfaces/);
  assert.match(html, /View my work/);
  assert.match(html, /Launch experiment/);
  assert.match(html, /Skip to content/);
  assert.match(html, /href="\/projects\/wave-field"/);
  assert.match(html, /PROJECT SLOT/);
  assert.match(html, /name="email"/);
  assert.match(html, /og:image/);
  assert.match(html, /noindex/);
});
test("case study has meaningful content and demo link", async () => {
  const response = await request("/projects/wave-field");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /The challenge/); assert.match(html, /The approach/); assert.match(html, /The result/);
  assert.match(html, /href="\/#lab"/);
});
test("project slots remain explicitly labeled and excluded from indexing", async () => {
  const response = await request("/projects/interface-study");
  const html = await response.text();
  assert.equal(response.status, 200); assert.match(html, /not a claim of completed work/); assert.match(html, /noindex/);
});
test("unknown project returns a real 404", async () => { const response = await request("/projects/does-not-exist"); await response.text(); assert.equal(response.status, 404); });
test("sitemap lists the real experiment but excludes project slots", async () => {
  const response = await request("/sitemap.xml"); const xml = await response.text();
  assert.equal(response.status, 200); assert.match(xml, /projects\/wave-field/); assert.doesNotMatch(xml, /interface-study|connected-systems/);
});
