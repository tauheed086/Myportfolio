"use client";

import { useEffect, useState, useRef, useSyncExternalStore, useCallback } from "react";
import gsap from "gsap";
import { unlockAudio, playClickToEnter } from "./sound-manager";
import "./initial-loader.css";

const subscribeThemeMedia = (notify) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", notify);
    return () => mediaQuery.removeEventListener("change", notify);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(notify);
    return () => mediaQuery.removeListener(notify);
  }
  return () => {};
};
const getSystemThemeSnapshot = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};
const getServerSystemThemeSnapshot = () => "dark";

export default function InitialLoader({ onComplete }) {
  const [isExited, setIsExited] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const systemTheme = useSyncExternalStore(subscribeThemeMedia, getSystemThemeSnapshot, getServerSystemThemeSnapshot);

  const overlayRef = useRef(null);
  const maskContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const counterWrapperRef = useRef(null);
  const promptRef = useRef(null);
  const isEnteringRef = useRef(false);
  const isAnimatingRef = useRef(true);
  const rafIdRef = useRef(null);
  const exitTlRef = useRef(null);

  // Approach 1: Audio Unlock on gesture, clicktoenter sound & camera zoom
  const handleEnter = useCallback(() => {
    if (isEnteringRef.current || !isReady) return;
    isEnteringRef.current = true;

    // 1. Prime & Unlock browser audio context with custom entrance sound
    unlockAudio();
    playClickToEnter();

    const maskContainer = maskContainerRef.current;
    const overlay = overlayRef.current;
    const prompt = promptRef.current;
    const canvas = canvasRef.current;

    if (!maskContainer || !overlay) {
      setIsExited(true);
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const isDark = systemTheme === "dark";
    const fillColor = isDark ? "#ffffff" : "#0f172a";
    const isLargeScreen = typeof window !== "undefined" && window.innerWidth >= 1024;

    const exitTl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        setIsExited(true);
        if (canvas) canvas.removeAttribute("style");
        if (typeof onComplete === "function") {
          onComplete();
        }
      },
    });
    exitTlRef.current = exitTl;

    // NeoLeaf Signature Camera Zoom into the 3D world
    exitTl
      .to(prompt, {
        duration: 0.22,
        opacity: 0,
        ease: "power2.out",
      })
      .to(
        maskContainer,
        {
          duration: 0.15,
          ease: "none",
          backgroundColor: fillColor,
        },
        "<60%"
      )
      .to(
        maskContainer,
        {
          duration: 0.9,
          ease: "power2.inOut",
          opacity: 0,
          scale: (window.innerWidth / (maskContainer.offsetWidth || 1)) * (isLargeScreen ? 1.8 : 1.4),
        },
        "<85%"
      )
      .to(
        overlay,
        {
          duration: 0.45,
          ease: "power2.out",
          opacity: 0,
        },
        "<65%"
      );
  }, [isReady, systemTheme, onComplete]);

  // Keyboard accessibility: Space or Enter triggers entrance
  useEffect(() => {
    if (!isReady || isExited) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReady, isExited, handleEnter]);

  // 2. NeoLeaf Mathematical Fluid Wave Animation inside "WELCOME" Mask
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = canvasRef.current;
    const maskContainer = maskContainerRef.current;
    const counter = counterRef.current;
    const counterWrapper = counterWrapperRef.current;
    const overlay = overlayRef.current;

    if (!canvas || !maskContainer || !counter || !counterWrapper || !overlay) return;

    const isDark = systemTheme === "dark";
    const fillColor = isDark ? "#ffffff" : "#0f172a";
    const backWaveColor = isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(15, 23, 42, 0.28)";
    const crestSheenColor = isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(15, 23, 42, 0.4)";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const ctx = canvas.getContext("2d");
    const containerWidth = maskContainer.offsetWidth || 300;
    const containerHeight = maskContainer.offsetHeight || (containerWidth * 192) / 965;
    let wavePhase = 0;
    let backPhase = 1.25;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    if (ctx) ctx.scale(dpr, dpr);

    // Letter bounds inside welcome-mask.svg (Y=8 to Y=184 in 192 viewBox)
    const letterTopY = containerHeight * (8 / 192);
    const letterBottomY = containerHeight * (184 / 192);
    const waveAmplitude = Math.max(6, Math.min(16, containerHeight * 0.085));
    const backWaveAmplitude = waveAmplitude * 0.82;

    // Baseline water levels:
    // At 0%: Water crest just brushes the base of the letters
    const baselineY0 = letterBottomY + waveAmplitude * 0.65;
    // At 100%: Water trough completely submerges the top of the letters
    const baselineY100 = letterTopY - waveAmplitude * 0.65;

    // Cache front wave points for 0-overhead specular sheen pass
    const frontWavePoints = [];

    // Dual-Layer 3D Fluid Wave Renderer in exact 1:1 sync with percentage (0 to 100%)
    const renderWave = (progressVal) => {
      if (!ctx) return;
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      const p = Math.max(0, Math.min(100, progressVal)) / 100;
      const currentBaseline = baselineY0 - p * (baselineY0 - baselineY100);

      // --- 1. Layer 1: Back Wave (Translucent 3D Parallax Undercurrent) ---
      ctx.beginPath();
      ctx.fillStyle = backWaveColor;
      ctx.moveTo(0, containerHeight);
      for (let x = 0; x <= containerWidth; x += 4) {
        const backY =
          currentBaseline -
          Math.sin(0.018 * x + backPhase) *
            Math.sin(0.012 * x + backPhase) *
            Math.sin(0.045 * x + backPhase) *
            backWaveAmplitude;
        ctx.lineTo(x, backY);
      }
      ctx.lineTo(containerWidth, containerHeight);
      ctx.lineTo(0, containerHeight);
      ctx.closePath();
      ctx.fill();

      // --- 2. Layer 2: Front Wave (Primary Fluid Surface) ---
      frontWavePoints.length = 0;
      ctx.beginPath();
      ctx.fillStyle = fillColor;
      ctx.moveTo(0, containerHeight);
      for (let x = 0; x <= containerWidth; x += 3) {
        const frontY =
          currentBaseline -
          Math.sin(0.02 * x + wavePhase) *
            Math.sin(0.01 * x + wavePhase) *
            Math.sin(0.05 * x + wavePhase) *
            waveAmplitude;
        frontWavePoints.push(x, frontY);
        ctx.lineTo(x, frontY);
      }
      ctx.lineTo(containerWidth, containerHeight);
      ctx.lineTo(0, containerHeight);
      ctx.closePath();
      ctx.fill();

      // --- 3. Specular Crest Sheen (Zero-overhead: reuses cached front points) ---
      if (p < 0.99 && frontWavePoints.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = crestSheenColor;
        ctx.lineWidth = 1.5;
        ctx.moveTo(frontWavePoints[0], frontWavePoints[1]);
        for (let i = 2; i < frontWavePoints.length; i += 2) {
          ctx.lineTo(frontWavePoints[i], frontWavePoints[i + 1]);
        }
        ctx.stroke();
      }

      wavePhase += 0.038;
      backPhase += 0.03;
    };

    // Measure counter width once to prevent layout shifting
    if (counter) {
      counter.innerText = "100";
      const w100 = counter.offsetWidth;
      if (w100) counter.style.minWidth = `${w100}px`;
      counter.innerText = "0";
    }

    const progressTracker = { value: 0 };
    isAnimatingRef.current = true;

    // Dedicated requestAnimationFrame loop for hardware 60fps/120fps fluid physics
    const animateLoop = () => {
      if (!isAnimatingRef.current) return;
      renderWave(progressTracker.value);
      rafIdRef.current = requestAnimationFrame(animateLoop);
    };
    rafIdRef.current = requestAnimationFrame(animateLoop);

    const loadTl = gsap.timeline({
      delay: 0.15,
    });

    // Animate progress 0 -> 100% over 2.4s with linear cadence (NeoLeaf pattern)
    loadTl
      .to(progressTracker, {
        duration: 2.4,
        ease: "none",
        value: 100,
        onUpdate() {
          if (counter) {
            counter.innerText = `${Math.round(progressTracker.value)}`;
          }
        },
      })
      // Fade out loading... 100% counter and transition to "Click anywhere to enter"
      .to(counterWrapper, {
        duration: 0.25,
        ease: "power2.out",
        opacity: 0,
        onComplete() {
          setIsReady(true);
        },
      });

    return () => {
      isAnimatingRef.current = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      loadTl.kill();
      if (exitTlRef.current) exitTlRef.current.kill();
      if (canvas) canvas.removeAttribute("style");
    };
  }, [systemTheme]);

  if (isExited) {
    return null;
  }

  const themeClass = systemTheme === "dark" ? "theme-system-dark" : "theme-system-light";

  return (
    <div
      ref={overlayRef}
      className={`initial-loader-overlay ${themeClass} ${isReady ? "is-ready" : ""}`}
      onClick={isReady ? handleEnter : undefined}
      aria-label={isReady ? "Click anywhere to enter website with audio" : "Loading site"}
      role={isReady ? "button" : "progressbar"}
      tabIndex={isReady ? 0 : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Ambient Rolling Fog Backdrop */}
      <div className="initial-loader-fog-backdrop" aria-hidden="true">
        <div className="fog-layer fog-layer-1" />
        <div className="fog-layer fog-layer-2" />
        <div className="fog-layer fog-layer-3" />
        <div className="fog-vignette" />
      </div>

      {/* NeoLeaf Centered Mask Container */}
      <div className="relative w-full max-w-[85%] md:max-w-[75%] lg:max-w-[760px] xl:max-w-[965px] select-none text-center">
        {/* Masked "WELCOME" Container */}
        <div
          ref={maskContainerRef}
          className="relative aspect-[965/192] w-full neoleaf-mask-container"
        >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="size-full" />
          </div>
        </div>

        {/* Counter positioned at bottom right like NeoLeaf (fades out at 100%) */}
        <div
          ref={counterWrapperRef}
          className="neoleaf-loading-counter absolute right-0 top-full mt-2 md:mt-3"
        >
          loading... <span ref={counterRef} className="inline-block tabular-nums">0</span>%
        </div>

        {/* Approach 1: Click Anywhere to Enter Gate (Emerges when wave reaches 100%) */}
        <div
          ref={promptRef}
          className={`loader-enter-container absolute inset-x-0 top-full mt-4 md:mt-5 flex flex-col items-center justify-center ${
            isReady ? "is-visible" : ""
          }`}
          aria-hidden={!isReady}
        >
          <div className="loader-enter-subtext" aria-hidden="true">
            {/* <span className="loader-audio-glyph">🎧</span> */}
            <span>CLICK ANYWHERE TO ENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
