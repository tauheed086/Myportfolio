import { handleContact } from "../../../lib/contact";
export async function POST(request) {
  let config = process.env;
  try { const { env } = await import("cloudflare:workers"); config = { ...config, ...env }; } catch { /* Node development fallback. */ }
  return handleContact(request, config);
}
