"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
export default function ContactForm() {
  const [status, setStatus] = useState({ state: "idle", message: "" });
  async function submit(event) {
    event.preventDefault();
    if (status.state === "sending") return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setStatus({ state: "sending", message: "Sending your message…" });
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your message could not be sent. Please try again.");
      setStatus({ state: "success", message: "Message sent. Thank you for reaching out." });
      form.reset();
    } catch (error) { setStatus({ state: "error", message: error.name === "TimeoutError" ? "The request timed out. Please try again or use email." : error.message }); }
  }
  return <form className="contact-form" onSubmit={submit} aria-busy={status.state === "sending"}>
    <div className="form-row"><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Alex Morgan" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@company.com" /></label></div>
    <label>What are you thinking?<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="A project, a role, or an idea worth exploring…" /></label>
    <div className="honey" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <button className="button button-light" disabled={status.state === "sending"} type="submit">{status.state === "sending" ? "Sending…" : "Send a message"}<ArrowUpRight size={17} /></button>
    <p className={`form-status ${status.state}`} role="status" aria-live="polite">{status.message || "Your details are used only to reply to your enquiry."}</p>
  </form>;
}
