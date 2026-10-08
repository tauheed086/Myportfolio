"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import "./initial-loader.css";

export default function InitialLoader({ onComplete }) {
  const [isExited, setIsExited] = useState(false);
  const [systemTheme, setSystemTheme] = useState("dark");

  const overlayRef = useRef(null);
  const maskContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const counterWrapperRef = useRef(null);

  // 1. Pure System Theme Detection (Dark or Light)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateTheme);
      return () => mediaQuery.removeEventListener("change", updateTheme);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(updateTheme);
      return () => mediaQuery.removeListener(updateTheme);
    }
  }, []);

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
    const isLargeScreen = window.innerWidth >= 1024;
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
    let rafId = null;
    let isAnimating = true;

    // Dedicated requestAnimationFrame loop for hardware 60fps/120fps fluid physics
    const animateLoop = () => {
      if (!isAnimating) return;
      renderWave(progressTracker.value);
      rafId = requestAnimationFrame(animateLoop);
    };
    rafId = requestAnimationFrame(animateLoop);

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        setIsExited(true);
        if (typeof onComplete === "function") {
          onComplete();
        }
      },
    });

    // Animate progress 0 -> 100% over 2.6s with linear cadence (NeoLeaf pattern)
    tl.to(progressTracker, {
      duration: 2.6,
      ease: "none",
      value: 100,
      onUpdate() {
        if (counter) {
          counter.innerText = `${Math.round(progressTracker.value)}`;
        }
      },
    })
      // Fade out loading... 100% counter
      .to(counterWrapper, {
        duration: 0.25,
        ease: "none",
        opacity: 0,
        onComplete() {
          isAnimating = false;
          if (rafId) cancelAnimationFrame(rafId);
        },
      })
      // Fill the letters 100% solid
      .to(maskContainer, {
        duration: 0.15,
        ease: "none",
        backgroundColor: fillColor,
      })
      // NeoLeaf signature zoom: letters zoom toward camera and dissolve smoothly
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
      // Fade out entire overlay
      .to(
        overlay,
        {
          duration: 0.45,
          ease: "power2.out",
          opacity: 0,
        },
        "<65%"
      );

    return () => {
      isAnimating = false;
      if (rafId) cancelAnimationFrame(rafId);
      tl.kill();
      if (canvas) canvas.removeAttribute("style");
    };
  }, [systemTheme, onComplete]);

  if (isExited) {
    return null;
  }

  const themeClass = systemTheme === "dark" ? "theme-system-dark" : "theme-system-light";

  return (
    <div
      ref={overlayRef}
      className={`initial-loader-overlay ${themeClass}`}
      aria-label="Loading site"
      role="progressbar"
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

        {/* Counter positioned at bottom right like NeoLeaf */}
        <div
          ref={counterWrapperRef}
          className="neoleaf-loading-counter absolute right-0 top-full mt-2 md:mt-3"
        >
          loading... <span ref={counterRef} className="inline-block tabular-nums">0</span>%
        </div>
      </div>
    </div>
  );
}
