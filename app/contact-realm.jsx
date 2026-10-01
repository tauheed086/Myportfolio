"use client";

import { useState, useRef, useEffect } from "react";
import { profile } from "./content";
import Portrait3DCanvas from "./portrait-3d-canvas.jsx";
import "./contact-realm.css";

/**
 * AxelPillBtn
 * Interactive pill button with cursor-origin expanding fill animation.
 * The fill bubble spawns exactly where the mouse pointer enters and expands outward.
 */
function AxelPillBtn({
  href,
  target,
  rel,
  children,
  icon,
  className = "",
  onClick,
  ...props
}) {
  const circleRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const circle = circleRef.current;
    if (circle) {
      circle.style.transition = "none";
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      circle.style.transform = "translate(-50%, -50%) scale(0)";
      // Force synchronous layout flush
      void circle.offsetWidth;
      circle.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      circle.style.transform = "translate(-50%, -50%) scale(1)";
    }
  };

  const handleMouseLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const circle = circleRef.current;
    if (circle) {
      circle.style.transition = "none";
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;
      circle.style.transform = "translate(-50%, -50%) scale(1)";
      void circle.offsetWidth;
      circle.style.transition = "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
      circle.style.transform = "translate(-50%, -50%) scale(0)";
    }
  };

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`axel-pill-btn ${className}`}
      {...props}
    >
      <span ref={circleRef} className="pill-fill-circle" aria-hidden="true" />
      <span className="pill-content">
        {icon && <span className="pill-icon-lead">{icon}</span>}
        <span className="pill-text-label">{children}</span>
        <span className="pill-badge-arrow">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </span>
      </span>
    </a>
  );
}

export default function ContactRealm({ isEntered = false }) {
  // Contextual intent selector: "hire" (Full-Time) vs "freelance" (Project) vs null (General)
  const [selectedIntent, setSelectedIntent] = useState(null);

  // Dynamic message context for WhatsApp & Email
  const intentData = {
    general: {
      tag: "DIRECT INQUIRY",
      title: "Get in Touch",
      subtitle: "Software Development · Full-Stack · System Architecture",
      emailSubject: "Inquiry: Tauheed Mulla - Software Developer",
      emailBody:
        "Hi Tauheed,%0D%0A%0D%0AI came across your portfolio and would like to connect.",
      waText:
        "Hi Tauheed! I came across your portfolio and would love to connect with you.",
    },
    hire: {
      tag: "FULL-TIME ROLES",
      title: "Hire for Full-Time",
      subtitle: "Software Developer · Backend & Full-Stack Systems",
      emailSubject: "Hiring Inquiry: Full-Time Engineering Role - Tauheed Mulla",
      emailBody:
        "Hi Tauheed,%0D%0A%0D%0AWe came across your portfolio and would love to discuss a full-time software developer role with you at [Company Name].",
      waText:
        "Hi Tauheed! I saw your portfolio and would like to discuss a full-time software developer opportunity with you.",
    },
    freelance: {
      tag: "CONTRACT & FREELANCE",
      title: "Freelance Project",
      subtitle: "Web Apps · MVPs · System Automation & APIs",
      emailSubject: "Project Inquiry: Freelance Collaboration - Tauheed Mulla",
      emailBody:
        "Hi Tauheed,%0D%0A%0D%0AI have an ambitious project idea and would like to discuss building it together with you as a freelancer.",
      waText:
        "Hi Tauheed! I have an exciting project idea and would love to collaborate with you as a freelancer.",
    },
  };

  const current = (selectedIntent && intentData[selectedIntent]) ? intentData[selectedIntent] : intentData.general;
  const emailUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
    current.emailSubject
  )}&body=${current.emailBody}`;
  const whatsappUrl = `https://wa.me/917022414726?text=${encodeURIComponent(
    current.waText
  )}`;

  const scrollContainerRef = useRef(null);
  const [mobileScrollFade, setMobileScrollFade] = useState(1);

  // Directly update CSS variable on native scroll for 60fps GPU performance
  const updateMobileScroll = (top) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Fade out smoothly over 260px of mobile scrolling
    const fade = Math.max(0, Math.min(1, 1 - top / 260));
    el.style.setProperty("--mobile-scroll-opacity", fade.toFixed(3));
  };

  const handleScroll = (e) => {
    if (typeof window !== "undefined" && window.innerWidth <= 940) {
      updateMobileScroll(e.currentTarget.scrollTop);
    }
  };

  // Enable seamless scrolling back up to space/previous sections when at the top of the contact realm
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let lastTouchY = 0;

    const onTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaFromLast = currentY - lastTouchY;
      lastTouchY = currentY;

      // When at the top of the contact realm and user is pulling downward to go back into space
      if (el.scrollTop <= 0 && deltaFromLast > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }

        // Multiply delta to smoothly and responsively scrub back through the GSAP flight timeline
        const scrollAmount = deltaFromLast * 3.5;

        if (typeof window !== "undefined") {
          const currentScroll = window.__lenis?.scroll ?? window.scrollY;
          const targetScroll = Math.max(0, currentScroll - scrollAmount);

          if (window.__lenis) {
            window.__lenis.scrollTo(targetScroll, { immediate: true });
          } else {
            window.scrollTo(0, targetScroll);
          }
        }
      }
    };

    const onWheel = (e) => {
      // When at the top and rolling wheel upward
      if (el.scrollTop <= 0 && e.deltaY < 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
        const scrollAmount = Math.abs(e.deltaY) * 2.5;

        if (typeof window !== "undefined") {
          const currentScroll = window.__lenis?.scroll ?? window.scrollY;
          const targetScroll = Math.max(0, currentScroll - scrollAmount);

          if (window.__lenis) {
            window.__lenis.scrollTo(targetScroll, { immediate: true });
          } else {
            window.scrollTo(0, targetScroll);
          }
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className={`contact-realm ${isEntered ? "is-entered" : ""}`}
      onScroll={handleScroll}
      data-lenis-prevent="true"
      style={{
        "--mobile-scroll-opacity": 1,
      }}
    >
      <div className="contact-realm-container">

        {/* Left Column: Contextual Reachout & Actions */}
        <div className="contact-info-col">

          {/* 1st: Open to work with live indicator */}
          <div className="status-live-badge">
            <span className="live-dot-wrap">
              <span className="live-dot-ping" />
              <span className="live-dot-core" />
            </span>
            <span className="status-live-text">OPEN TO WORK</span>
          </div>

          {/* 2nd: Software Developer and full stack web developer */}
          <h1 className="contact-headline">
            Software Developer <span className="headline-amp">&amp;</span>
            <br />
            Full Stack Web Developer
          </h1>

          {/* 3rd: Contextual Intent Selection: Hire vs Freelance */}
          <div className="intent-selection-wrap">

            <div className="intent-cards-grid">

              {/* Context Tile 01: Hire for Full-Time */}
              <button
                type="button"
                onClick={() => setSelectedIntent(prev => prev === "hire" ? null : "hire")}
                className={`intent-card ${selectedIntent === "hire" ? "active" : ""}`}
                aria-pressed={selectedIntent === "hire"}
              >
                <div className="intent-card-header">
                  <div className="intent-symbol-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <span className={`intent-radio-indicator ${selectedIntent === "hire" ? "active" : ""}`}>
                    {selectedIntent === "hire" && <span className="radio-dot-inner" />}
                  </span>
                </div>
                <div className="intent-card-body">

                  <h3 className="intent-card-title">Full-Time Engineer</h3>
                  <p className="intent-card-desc">
                    Looking to bring a dedicated software developer into your team.
                  </p>
                </div>
              </button>

              {/* Context Tile 02: Freelance / Project Collaboration */}
              <button
                type="button"
                onClick={() => setSelectedIntent(prev => prev === "freelance" ? null : "freelance")}
                className={`intent-card ${selectedIntent === "freelance" ? "active" : ""}`}
                aria-pressed={selectedIntent === "freelance"}
              >
                <div className="intent-card-header">
                  <div className="intent-symbol-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <span className={`intent-radio-indicator ${selectedIntent === "freelance" ? "active" : ""}`}>
                    {selectedIntent === "freelance" && <span className="radio-dot-inner" />}
                  </span>
                </div>
                <div className="intent-card-body">

                  <h3 className="intent-card-title">Freelance </h3>
                  <p className="intent-card-desc">
                    Have a project idea and need an architect &amp; builder from day one.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* 4th: Contact buttons: WhatsApp, Email (Context-Aware) */}
          <div className="action-pill-section">
            <div className="section-label-row">
              <span className="section-mini-tag">DIRECT CONTACT</span>

            </div>
            <div className="pill-buttons-row direct-contact-row">
              <AxelPillBtn
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-btn"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#22c55e" }}>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                }
              >
                WhatsApp
              </AxelPillBtn>

              <AxelPillBtn
                href={emailUrl}
                className="email-btn"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
              >
                Email
              </AxelPillBtn>

              {profile.phone && (
                <AxelPillBtn
                  href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                  className="phone-btn"
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  }
                >
                  {profile.phone}
                </AxelPillBtn>
              )}
            </div>
          </div>

          {/* 5th: Connection buttons: GitHub, LinkedIn */}
          <div className="action-pill-section">
            <span className="section-mini-tag">CONNECT WITH ME</span>
            <div className="pill-buttons-row social-contact-row">
              {profile.github && (
                <AxelPillBtn
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  icon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  }
                >
                  GitHub
                </AxelPillBtn>
              )}
              {profile.linkedin && (
                <AxelPillBtn
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="social-btn"
                  icon={
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  }
                >
                  LinkedIn
                </AxelPillBtn>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Built-up 3D Holographic Portrait with Smooth Faded Edges */}
        <div className="contact-portrait-col">
          <div className="portrait-buildup-frame">
            <Portrait3DCanvas
              originalSrc="/myportrait.png"
              depthSrc="/myportrait-depth.jpg"
              alt={profile.name}
              className="portrait-buildup-img"
              isEntered={isEntered}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
