"use client";

import { useEffect, useRef, useState } from "react";

const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value * value * (3 - 2 * value);

export default function useOceanScroll() {
  const journey = useRef(null);
  const [submerged, setSubmerged] = useState(false);
  const waveProgressRef = useRef({ progress: 0, velocity: 0 });
  useEffect(() => {
    const element = journey.current;
    if (!element) return;
    const stage = element.querySelector(".wave-portfolio");
    const crest = element.querySelector(".ocean-crest");
    const extension = element.querySelector(".ocean-extension");
    if (!stage || !crest) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previousSubmerged = false;
    let displayedProgress = null, lastFrameTime = 0;
    let stageHeight = 1, crestHeight = 1, extensionHeight = 1, distance = 1, elementTop = 0;
    const measure = () => {
      stageHeight = stage.clientHeight;
      crestHeight = crest.clientHeight;
      extensionHeight = extension ? extension.clientHeight : stageHeight * 3;
      distance = Math.max(1, element.offsetHeight - stageHeight);
      elementTop = element.getBoundingClientRect().top + window.scrollY;
    };
    const update = (now = performance.now()) => {
      frame = 0;
      const target = clamp((window.scrollY - elementTop) / distance);
      const delta = Math.min(Math.max(now - lastFrameTime, 0), 64);
      lastFrameTime = now;
      if (displayedProgress === null || preference.matches) displayedProgress = target;
      else displayedProgress += (target - displayedProgress) * (1 - Math.exp(-delta / 12));
      if (Math.abs(target - displayedProgress) < 0.0002) displayedProgress = target;
      const progress = displayedProgress;

      // 1. Boat sail progress before/during wave swell
      const boatProgress = ease(clamp(progress / 0.22));
      const prevBoat = waveProgressRef.current.progress;
      waveProgressRef.current.progress = boatProgress;
      waveProgressRef.current.velocity = Math.abs(boatProgress - prevBoat);

      // 2. Continuous two-phase wave & deep ocean descent:
      // Phase 1: Wave crest rises and completely covers viewport (progress: 0.0 -> 0.16)
      // Phase 2: Water column translates upward, diving deep through oceanic depth zones into the abyss (progress: 0.16 -> 1.0)
      const surgeProgress = clamp(progress / 0.16);
      const surgeRise = ease(surgeProgress);
      const diveProgress = clamp((progress - 0.16) / 0.84);
      const diveDescent = diveProgress;

      const extraDepth = Math.max(0, extensionHeight - stageHeight - 16);
      const waveY = stageHeight - surgeRise * (stageHeight + crestHeight) - diveDescent * extraDepth;

      const controlsOpacity = 1 - ease(clamp(progress / 0.05));
      const heroFold = ease(clamp(progress / 0.14));
      element.style.setProperty("--wave-y", `${waveY}px`);
      element.style.setProperty("--controls-opacity", String(controlsOpacity));
      element.style.setProperty("--controls-pointer", controlsOpacity > 0.05 ? "auto" : "none");
      element.style.setProperty("--hero-fold", String(heroFold));
      element.style.setProperty("--hero-fold-rotate", `${heroFold * 36}deg`);
      element.style.setProperty("--hero-fold-y", `${heroFold * -45}px`);
      element.style.setProperty("--hero-fold-scale", String(1 - heroFold * 0.12));
      element.style.setProperty("--hero-fold-opacity", String(Math.max(0, 1 - heroFold * 1.35)));
      element.style.setProperty("--hero-fold-pointer", heroFold > 0.6 ? "none" : "auto");
      element.style.setProperty("--water-darkness", String(diveProgress));
      element.style.setProperty("--depth-progress", String(diveProgress));
      element.style.setProperty("--surface-opacity", String(1 - ease(clamp(progress / 0.12))));
      element.style.setProperty("--scene-opacity", String(1 - ease(clamp((progress - 0.03) / 0.22))));
      element.style.setProperty("--ocean-opacity", preference.matches ? String(ease(clamp(progress / 0.2))) : "1");
      const nextSubmerged = progress >= 0.10;
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
    if (extension) observer.observe(extension);
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

    // Land directly at the start of Beat 1 ("Beneath the Surface") as wave crest submerges the screen
    const targetY = window.scrollY + element.getBoundingClientRect().top + (element.offsetHeight - stage.clientHeight) * 0.18;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetY, behavior: "instant" });
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    // Slow, cinematic 1.6s glide for a calm, organic ocean dive
    const duration = 1600;
    const startTime = performance.now();
    let animFrame = 0;

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const cancel = () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };

    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });

    const step = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        cancel();
      }
    };
    animFrame = requestAnimationFrame(step);
  };
  return { journey, submerged, dive, waveProgressRef };
}
