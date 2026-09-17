import assert from "node:assert/strict";
import test from "node:test";
import { handleContact } from "../lib/contact.js";
const data = { name: "Test Visitor", email: "visitor@example.com", message: "I would like to discuss a project.", website: "" };
const config = { RESEND_API_KEY: "test-key", CONTACT_TO_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "Portfolio <website@example.com>" };
function request(payload = data, options = {}) { return new Request("https://portfolio.example/api/contact", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://portfolio.example", "cf-connecting-ip": "test", ...options.headers }, body: typeof payload === "string" ? payload : JSON.stringify(payload) }); }
test("rejects invalid, bot, and cross-origin messages before sending", async () => {
  let calls = 0; const send = async () => { calls++; return Response.json({ id: "sent" }); };
  for (const payload of [null, [], { ...data, name: "a" }, { ...data, email: "invalid" }, { ...data, message: "short" }, { ...data, website: "spam" }, "{"]) {
    const response = await handleContact(request(payload), config, send); assert.equal(response.status, 400);
  }
  assert.equal((await handleContact(request(data, { headers: { Origin: "https://other.example" } }), config, send)).status, 403);
  assert.equal((await handleContact(request({ ...data, message: "x".repeat(21000) }), config, send)).status, 413);
  assert.equal(calls, 0);
});
test("unconfigured delivery returns an honest unavailable response", async () => { assert.equal((await handleContact(request(), {})).status, 503); });
test("configured delivery sends plain text and succeeds only after provider confirmation", async () => {
  let sent;
  const response = await handleContact(request(), config, async (url, options) => { assert.equal(url, "https://api.resend.com/emails"); sent = JSON.parse(options.body); return Response.json({ id: "accepted" }); });
  assert.equal(response.status, 200); assert.equal(sent.reply_to, data.email); assert.ok(sent.text.includes(data.message)); assert.equal(sent.html, undefined);
});
test("provider errors are not reported as success", async () => { const response = await handleContact(request(data, { headers: { "cf-connecting-ip": "provider-error" } }), config, async () => new Response("error", { status: 500 })); assert.equal(response.status, 502); });
test("repeated requests are throttled", async () => {
  const send = async () => Response.json({ id: "accepted" });
  for (let i = 0; i < 3; i++) assert.equal((await handleContact(request(data, { headers: { "cf-connecting-ip": "limit-test" } }), config, send)).status, 200);
  assert.equal((await handleContact(request(data, { headers: { "cf-connecting-ip": "limit-test" } }), config, send)).status, 429);
});
