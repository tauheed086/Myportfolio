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
    let previousSection = null;
    const measure = () => {
      start = journey.current.getBoundingClientRect().top + window.scrollY;
      positions = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + window.scrollY }));
      end = positions.find(section => section.id === "about")?.top ?? start + 1;
      const width = document.documentElement.clientWidth;
      compact = Math.min(880, width - (width <= 800 ? 28 : 64));
      expanded = Math.max(compact, Math.min(1200, width - 16));
    };
    const update = () => {
      frame = 0;
      const progress = (window.scrollY - start) / Math.max(1, end - start);
      nav.style.setProperty("--scroll-nav-width", `${navigationWidth(preference.matches ? 0 : progress, compact, expanded)}px`);
      const current = visibleSection(positions, window.scrollY, window.innerHeight);
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
    window.addEventListener("resize", resize);
    window.addEventListener("pageshow", resize);
    preference.addEventListener("change", schedule);
    measure();
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pageshow", resize);
      preference.removeEventListener("change", schedule);
    };
  }, [journey]);
  return { navbar, activeSection };
}
