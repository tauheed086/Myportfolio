"use client";

import { useEffect, useRef, useState } from "react";

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

export default function useOceanScroll() {
  const journey = useRef(null);
  const [submerged, setSubmerged] = useState(false);
  useEffect(() => {
    const element = journey.current;
    if (!element) return;
    const stage = element.querySelector(".wave-portfolio");
    const crest = element.querySelector(".ocean-crest");
    if (!stage || !crest) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previousSubmerged = false;
    let displayedProgress = null, lastFrameTime = 0;
    let stageHeight = 1, crestHeight = 1, distance = 1;
    const measure = () => {
      stageHeight = stage.clientHeight;
      crestHeight = crest.clientHeight;
      distance = Math.max(1, element.offsetHeight - stageHeight);
    };
    const update = (now = performance.now()) => {
      frame = 0;
      const target = clamp(-element.getBoundingClientRect().top / distance);
      const delta = Math.min(Math.max(now - lastFrameTime, 0), 64);
      lastFrameTime = now;
      if (displayedProgress === null || preference.matches) displayedProgress = target;
      else displayedProgress += (target - displayedProgress) * (1 - Math.exp(-delta / 110));
      if (Math.abs(target - displayedProgress) < 0.0001) displayedProgress = target;
      const progress = displayedProgress;
      const rise = ease(clamp(progress / 0.7));
      const waveY = stageHeight - rise * (stageHeight + crestHeight + 24);
      element.style.setProperty("--wave-y", `${waveY}px`);
      element.style.setProperty("--water-darkness", String(ease(clamp((progress - 0.4) / 0.6)) * 0.94));
      element.style.setProperty("--surface-opacity", String(1 - ease(clamp(progress / 0.4))));
      element.style.setProperty("--scene-opacity", String(1 - ease(clamp((progress - 0.04) / 0.56))));
      element.style.setProperty("--ocean-opacity", preference.matches ? String(ease(clamp(progress / 0.65))) : "1");
      const nextSubmerged = progress >= 0.4;
      if (nextSubmerged !== previousSubmerged) {
        previousSubmerged = nextSubmerged;
        setSubmerged(nextSubmerged);
      }
      if (displayedProgress !== target) frame = requestAnimationFrame(update);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    observer.observe(crest);
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
  }, []);

  const dive = event => {
    event.preventDefault();
    const element = journey.current;
    if (!element) return;
    const stage = element.querySelector(".wave-portfolio");
    if (!stage) return;
    const top = window.scrollY + element.getBoundingClientRect().top + element.offsetHeight - stage.clientHeight;
    window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return { journey, submerged, dive };
}
