"use client";

import { useEffect, useRef, useState } from "react";
import { navigationWidth, visibleSection } from "./navigation-scroll";

export default function useScrollNavigation(journey) {
  const navbar = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const nav = navbar.current;
    if (!nav || !journey?.current) return;
    const root = nav.closest(".portfolio-page");
    if (!root) return;
    const sections = [...root.querySelectorAll("[data-nav-section]")];
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, positions = [], start = 0, end = 1, compact = 880, expanded = 1200;
    let previousSection = null, lastWidth = -1;
    const measure = () => {
      start = journey.current.getBoundingClientRect().top + window.scrollY;
      const width = document.documentElement.clientWidth;
      compact = Math.min(880, width - (width <= 800 ? 28 : 64));
      expanded = Math.max(compact, Math.min(1200, width - 16));
    };
    const update = () => {
      frame = 0;
      const pinSpacer = document.querySelector(".pin-spacer");
      const aboutSec = document.getElementById("about");
      const aboutTop = journey.current ? (journey.current.offsetTop + journey.current.offsetHeight) : 2440;
      end = aboutTop;

      const progress = (window.scrollY - start) / Math.max(1, end - start);
      const targetWidth = Math.round(navigationWidth(preference.matches ? 0 : progress, compact, expanded));
      if (Math.abs(targetWidth - lastWidth) >= 1) {
        lastWidth = targetWidth;
        nav.style.setProperty("--scroll-nav-width", `${targetWidth}px`);
      }

      const navOffset = (nav.getBoundingClientRect().bottom || 80) + 16;
      const aboutThreshold = Math.max(0, aboutTop - navOffset - 50);

      const st = typeof window !== "undefined" && window.ScrollTrigger
        ? window.ScrollTrigger.getById("space-flight-transition")
        : null;

      const pinStart = st ? st.start : (aboutTop + (aboutSec?.offsetHeight ?? 1500) - window.innerHeight);
      const pinEnd = st ? st.end : (pinStart + 3600);

      let current = null;
      if (typeof window !== "undefined" && (window.__flightProgress >= 0.88 || window.scrollY >= pinEnd - 50)) {
        current = "contact";
      } else if (window.scrollY >= pinStart - 50) {
        current = "projects";
      } else if (window.scrollY >= aboutThreshold) {
        current = "about";
      }

      if (current !== previousSection) {
        previousSection = current;
        setActiveSection(current);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observer.observe(nav);
    sections.forEach(section => observer.observe(section));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("lenis-scroll", schedule);
    window.addEventListener("flight-progress", schedule);
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", resize);
    preference.addEventListener("change", schedule);
    measure();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("lenis-scroll", schedule);
      window.removeEventListener("flight-progress", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      preference.removeEventListener("change", schedule);
    };
  }, [journey]);
  return { navbar, activeSection };
}
