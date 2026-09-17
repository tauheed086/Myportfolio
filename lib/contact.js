const attempts = new Map();
const fail = (error, status) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
export async function handleContact(request, config = {}, send = fetch) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return fail("Please send your message from this website.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Expected a JSON message.", 415);
  if (Number(request.headers.get("content-length")) > 20000) return fail("Your message is too long.", 413);
  let payload;
  try {
    // Bound the streamed body as well as Content-Length (which clients can omit).
    const reader = request.body?.getReader();
    if (!reader) return fail("Please enter a message.", 400);
    const chunks = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 20000) { await reader.cancel(); return fail("Your message is too long.", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    payload = JSON.parse(new TextDecoder().decode(bytes));
  } catch { return fail("Please check your message and try again.", 400); }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fail("Invalid message.", 400);
  if (payload.website) return fail("Your message could not be accepted.", 400);
  const { name, email, message } = payload;
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 100 || /[\r\n]/.test(name)) return fail("Please enter your name (2–100 characters).", 400);
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.", 400);
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 5000) return fail("Please enter a message between 10 and 5,000 characters.", 400);
  if (!config.RESEND_API_KEY || !config.CONTACT_TO_EMAIL || !config.CONTACT_FROM_EMAIL) return fail("The contact form is not accepting messages yet. Please use a direct contact link when available.", 503);
  // Best-effort per-worker throttling. Configure edge rate limiting for a public launch.
  const ip = request.headers.get("cf-connecting-ip") || "local";
  const now = Date.now();
  for (const [key, value] of attempts) if (now - value.start > 60000) attempts.delete(key);
  const entry = attempts.get(ip) || { start: now, count: 0 };
  if (entry.count >= 3 || attempts.size >= 5000) return fail("Please wait a minute before sending another message.", 429);
  entry.count++; attempts.set(ip, entry);
  try {
    const response = await send("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: config.CONTACT_FROM_EMAIL, to: [config.CONTACT_TO_EMAIL], reply_to: email.trim(), subject: `Portfolio enquiry from ${name.trim()}`, text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}` }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return fail("Your message could not be sent. Please try again later or use email.", 502);
    const result = await response.json();
    if (!result.id) return fail("Delivery could not be confirmed. Please try again later.", 502);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail("The mail service is unavailable. Please try again later.", 502); }
}
