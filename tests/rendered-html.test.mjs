import assert from "node:assert/strict";
import test from "node:test";
import { navigationWidth, visibleSection } from "../app/navigation-scroll.js";

test("navigation expands halfway and is compact at About in either scroll direction", () => {
  for (const viewport of [320, 768, 1440, 2560]) {
    const compact = Math.min(880, viewport - (viewport <= 800 ? 28 : 64));
    const expanded = Math.max(compact, Math.min(1200, viewport - 16));
    assert.equal(navigationWidth(0, compact, expanded), compact);
    assert.equal(navigationWidth(0.5, compact, expanded), expanded);
    assert.equal(navigationWidth(1, compact, expanded), compact);
    assert.equal(navigationWidth(2, compact, expanded), compact);
    for (let i = 0; i <= 100; i++) {
      const width = navigationWidth(i / 100, compact, expanded);
      assert.ok(width >= compact && width <= viewport - 16);
      assert.ok(Math.abs(width - navigationWidth(1 - i / 100, compact, expanded)) < 0.00001);
    }
  }
});

test("active navigation tracks visible sections on downward and upward scrolling", () => {
  const sections = [{ id: "about", top: 2400 }, { id: "projects", top: 3400 }];
  for (const [scroll, expected] of [[0, null], [2200, "about"], [3200, "projects"], [4300, "projects"], [2500, "about"], [0, null]]) {
    assert.equal(visibleSection(sections, scroll, 800), expected);
  }
});

test("renders a full-screen wave portfolio with usable overlay controls", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Tauheed Mulla/);
  assert.doesNotMatch(html, /Developer · Builder · Learner|nav-tagline/);
  assert.match(html, /class="hero-code-accent">\(alive\)/);
  assert.match(html, /class="hero-actions"/);
  assert.match(html, /class="wave-scene/);
  assert.match(html, /Let’s Dive In/);
  assert.match(html, /class="ocean-journey"/);
  assert.match(html, /class="top-nav persistent-nav"/);
  assert.ok(html.indexOf('class="top-nav persistent-nav"') < html.indexOf('class="ocean-journey"'));
  assert.match(html, /id="about" data-nav-section/);
  assert.match(html, /id="projects" data-nav-section/);
  assert.match(html, /href="#about"/);
  assert.match(html, /href="#projects"/);
  assert.match(html, /href="#ocean-depth"/);
  assert.match(html, /class="ocean-crest"/);
  assert.match(html, /src="\/ocean-wave-hd.png"/);
  assert.doesNotMatch(html, /Explore my projects|hero-primary|hero-secondary/);
  assert.match(html, /View scene only/);
  assert.match(html, /aria-label="Play animation"/);
  assert.match(html, /aria-labelledby="panel-title"/);
  assert.doesNotMatch(html, /mini-dashboard|stack-strip|codex-preview/);
});
