"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, projects } from "./content";
import AboutTimeline from "./about-timeline.jsx";
import "./space-fold-transition.css";

export default function PortfolioSections() {
  const containerRef = useRef(null);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const hudRef = useRef(null);
  const stageRef = useRef(null);
  const backdropRef = useRef(null);
  const starsCanvasRef = useRef(null);
  const waypointRefs = useRef([]);
  const scrollVelocityRef = useRef(0);
  const [activeSector, setActiveSector] = useState(1);

  // =========================================================================
  // 3D Forward Starfield Engine + Halley's Comet Cursor Trail Canvas
  // =========================================================================
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 3D Starfield Array
    const numStars = 320;
    const fov = 420;
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * width * 2.8,
      y: (Math.random() - 0.5) * height * 2.8,
      z: Math.random() * 2000 + 1,
      pz: 2000,
      size: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.65 ? "#a5f3fc" : Math.random() > 0.35 ? "#93c5fd" : "#ffffff",
      shine: 0 // Reactive starlight illumination from cursor
    }));

    // =========================================================================
    // Smooth Star Gaze Cursor (Active strictly in My Work, smooth hover transition)
    // =========================================================================
    const mouse = { x: -1000, y: -1000, active: false };
    const starGaze = { x: -1000, y: -1000, speed: 0 };
    const smoothTrail = [];
    let hoverAlpha = 0;
    let pulseTime = 0;

    const handleMouseMove = (e) => {
      const realm = projectsRef.current;
      if (!realm || !realm.classList.contains("is-active")) {
        mouse.active = false;
        return;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // 4-pointed diamond star flare (✦)
    const drawStarGazeSpike = (cx, cy, radius, alpha, color) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;

      // Vertical spike
      ctx.beginPath();
      ctx.moveTo(-radius * 0.12, 0);
      ctx.lineTo(0, -radius);
      ctx.lineTo(radius * 0.12, 0);
      ctx.lineTo(0, radius);
      ctx.closePath();
      ctx.fill();

      // Horizontal spike
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.12);
      ctx.lineTo(radius, 0);
      ctx.lineTo(0, radius * 0.12);
      ctx.lineTo(-radius, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Dynamic forward warp velocity based on scroll scrub
      const velocityBonus = scrollVelocityRef.current;
      scrollVelocityRef.current *= 0.88; // decay
      const warpSpeed = 1.2 + velocityBonus * 14;
      const isFastWarp = warpSpeed > 2.8;

      // 1. Update Hover Transition & Star Gaze Cursor Tracking
      pulseTime += 16;
      const targetAlpha = mouse.active ? 1.0 : 0.0;
      hoverAlpha += (targetAlpha - hoverAlpha) * 0.08;

      if (mouse.active) {
        if (starGaze.x < -500) {
          starGaze.x = mouse.x;
          starGaze.y = mouse.y;
        }

        const dx = mouse.x - starGaze.x;
        const dy = mouse.y - starGaze.y;

        starGaze.x += dx * 0.92;
        starGaze.y += dy * 0.92;
        starGaze.speed = Math.hypot(dx, dy);

        // Record smooth trail only when in motion
        if (starGaze.speed > 0.8) {
          smoothTrail.push({ x: starGaze.x, y: starGaze.y });
          if (smoothTrail.length > 12) smoothTrail.shift();
        } else {
          if (smoothTrail.length > 0) smoothTrail.shift();
        }
      } else {
        if (smoothTrail.length > 0) smoothTrail.shift();
      }

      // 2. Render 3D Traveling Starfield & Reactively Illuminate Stars Under Cursor
      const shineRadius = 220; // Radius within which stars awaken and shine

      stars.forEach((star) => {
        star.pz = star.z;
        star.z -= warpSpeed;

        if (star.z <= 0) {
          star.z = 2000;
          star.pz = 2000;
          star.x = (Math.random() - 0.5) * width * 2.8;
          star.y = (Math.random() - 0.5) * height * 2.8;
          star.shine = 0;
        }

        const sx = cx + (star.x / star.z) * fov;
        const sy = cy + (star.y / star.z) * fov;
        const psx = cx + (star.x / star.pz) * fov;
        const psy = cy + (star.y / star.pz) * fov;

        if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
          const depthRatio = 1 - star.z / 2000;
          const baseAlpha = Math.min(1, star.alpha * depthRatio * 1.6);
          const baseSize = Math.max(0.4, star.size * depthRatio * 1.4);

          // Calculate proximity shine from cursor
          if (hoverAlpha > 0.02 && starGaze.x > 0) {
            const dist = Math.hypot(sx - starGaze.x, sy - starGaze.y);
            if (dist < shineRadius) {
              const proximity = Math.pow(1 - dist / shineRadius, 1.6) * hoverAlpha;
              star.shine = Math.max((star.shine || 0) * 0.93, proximity);
            } else {
              star.shine = (star.shine || 0) * 0.90;
            }
          } else {
            star.shine = (star.shine || 0) * 0.88;
          }

          const shine = star.shine || 0;
          const currentAlpha = Math.min(1, baseAlpha + shine * (1 - baseAlpha) + shine * 0.35);
          const currentSize = baseSize * (1 + shine * 2.2);

          if (isFastWarp) {
            ctx.beginPath();
            ctx.moveTo(psx, psy);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = shine > 0.15 ? "#ffffff" : star.color;
            ctx.lineWidth = Math.max(0.6, currentSize * 1.1);
            ctx.globalAlpha = currentAlpha;
            ctx.stroke();
          } else {
            // A. If star is shining from cursor proximity, render luminous starlight halo
            if (shine > 0.04) {
              ctx.save();
              ctx.globalCompositeOperation = "screen";

              const glowRadius = Math.max(5, currentSize * (3.2 + shine * 5.5));
              const starGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
              starGrad.addColorStop(0, `rgba(255, 255, 255, ${0.92 * shine})`);
              starGrad.addColorStop(0.3, `rgba(165, 243, 252, ${0.52 * shine})`);
              starGrad.addColorStop(0.68, `rgba(56, 189, 248, ${0.2 * shine})`);
              starGrad.addColorStop(1, "rgba(6, 182, 212, 0)");

              ctx.beginPath();
              ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
              ctx.fillStyle = starGrad;
              ctx.globalAlpha = 1;
              ctx.fill();

              // B. Brilliant diamond starlight diffraction glint (✦) for awakened stars
              if (shine > 0.18) {
                const spikeSize = Math.max(4.5, currentSize * (2.8 + shine * 3.8));
                drawStarGazeSpike(sx, sy, spikeSize, shine * 0.88, "#ffffff");
                drawStarGazeSpike(sx, sy, spikeSize * 0.52, shine * 0.55, "#a5f3fc");
              }

              ctx.restore();
            }

            // C. Radiant Star Core
            ctx.beginPath();
            ctx.arc(sx, sy, currentSize, 0, Math.PI * 2);
            ctx.fillStyle = shine > 0.15 ? "#ffffff" : star.color;
            ctx.globalAlpha = currentAlpha;
            ctx.fill();
          }
        }
      });

      // 3. Render Star Gaze Cursor & Guiding Starlight
      if (hoverAlpha > 0.01 && starGaze.x > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // A. Subtle Starlight Field Wash (Binds cursor to illuminated stars)
        const fieldRadius = shineRadius * 0.9;
        const fieldGrad = ctx.createRadialGradient(starGaze.x, starGaze.y, 0, starGaze.x, starGaze.y, fieldRadius);
        fieldGrad.addColorStop(0, "rgba(165, 243, 252, 0.06)");
        fieldGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.02)");
        fieldGrad.addColorStop(1, "rgba(6, 182, 212, 0)");

        ctx.beginPath();
        ctx.arc(starGaze.x, starGaze.y, fieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = fieldGrad;
        ctx.globalAlpha = hoverAlpha;
        ctx.fill();

        // B. Ethereal Starlight Wake (Refined, gossamer, smooth curve — no harsh line)
        if (smoothTrail.length >= 3) {
          const head = smoothTrail[smoothTrail.length - 1];
          const tail = smoothTrail[0];

          const trailGrad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
          trailGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
          trailGrad.addColorStop(0.55, "rgba(114, 204, 211, 0.22)");
          trailGrad.addColorStop(1, "rgba(165, 243, 252, 0.65)");

          ctx.beginPath();
          ctx.moveTo(smoothTrail[0].x, smoothTrail[0].y);
          for (let i = 1; i < smoothTrail.length - 1; i++) {
            const xc = (smoothTrail[i].x + smoothTrail[i + 1].x) * 0.5;
            const yc = (smoothTrail[i].y + smoothTrail[i + 1].y) * 0.5;
            ctx.quadraticCurveTo(smoothTrail[i].x, smoothTrail[i].y, xc, yc);
          }
          ctx.lineTo(head.x, head.y);

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = 3.2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = 0.4 * hoverAlpha;
          ctx.stroke();

          // Subtle inner starlight core
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.7 * hoverAlpha;
          ctx.stroke();
        }

        // C. Luminous Star Gaze Corona (Soft celestial halo on guiding star)
        const celestialPulse = 1 + Math.sin(pulseTime * 0.002) * 0.04;
        const auraRadius = 20 * celestialPulse;

        const auraGrad = ctx.createRadialGradient(starGaze.x, starGaze.y, 0, starGaze.x, starGaze.y, auraRadius);
        auraGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        auraGrad.addColorStop(0.22, "rgba(165, 243, 252, 0.65)");
        auraGrad.addColorStop(0.55, "rgba(56, 189, 248, 0.18)");
        auraGrad.addColorStop(0.85, "rgba(114, 204, 211, 0.05)");
        auraGrad.addColorStop(1, "rgba(6, 182, 212, 0)");

        ctx.beginPath();
        ctx.arc(starGaze.x, starGaze.y, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.globalAlpha = 0.85 * hoverAlpha;
        ctx.fill();

        // D. Telescopic 4-Point Star Flare (✦)
        const flareSize = 12 * celestialPulse;
        drawStarGazeSpike(starGaze.x, starGaze.y, flareSize, 0.85 * hoverAlpha, "#ffffff");
        drawStarGazeSpike(starGaze.x, starGaze.y, flareSize * 0.52, 0.55 * hoverAlpha, "#a5f3fc");

        // E. Intense Pure White Star Center
        ctx.beginPath();
        ctx.arc(starGaze.x, starGaze.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = hoverAlpha;
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // =========================================================================
  // Unified Master GSAP Timeline: Ocean Dissolve + 3D Space Flight
  // Single continuous ScrollTrigger — zero conflict, zero duplicate pin-spacers
  // =========================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const aboutSec = aboutRef.current;
    const projectsSec = projectsRef.current;
    const hud = hudRef.current;
    const starsCanvas = starsCanvasRef.current;
    const backdrop = backdropRef.current;

    if (!aboutSec || !projectsSec) return;

    const aboutInner = aboutSec.querySelector(".depth-section-inner");

    // Initialize initial hidden states
    gsap.set(projectsSec, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
    if (starsCanvas) gsap.set(starsCanvas, { opacity: 0 });
    if (backdrop) gsap.set(backdrop, { opacity: 0 });
    if (hud) gsap.set(hud, { opacity: 0, y: -20 });

    // Initialize all waypoints far back along the Z-axis in 3D deep space
    waypointRefs.current.forEach((el) => {
      if (el) {
        gsap.set(el, {
          z: -2400,
          scale: 0.1,
          opacity: 0,
          filter: "blur(18px)",
          pointerEvents: "none"
        });
      }
    });

    // Master Timeline pinned at bottom of About
    const transitionTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSec,
        start: "bottom bottom",
        end: "+=600%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onEnter: () => {
          gsap.set(projectsSec, {
            opacity: 1,
            visibility: "visible",
            pointerEvents: "auto"
          });
          projectsSec.classList.add("is-active");
        },
        onLeave: () => {
          // Keep active at final frontier
          gsap.set(projectsSec, {
            opacity: 1,
            visibility: "visible",
            pointerEvents: "auto"
          });
        },
        onEnterBack: () => {
          gsap.set(projectsSec, {
            opacity: 1,
            visibility: "visible",
            pointerEvents: "auto"
          });
          projectsSec.classList.add("is-active");
        },
        onLeaveBack: () => {
          gsap.set(projectsSec, {
            opacity: 0,
            visibility: "hidden",
            pointerEvents: "none"
          });
          projectsSec.classList.remove("is-active");
          if (aboutInner) gsap.set(aboutInner, { opacity: 1, y: 0, scale: 1 });
        },
        onUpdate: (self) => {
          // Pass scroll velocity to canvas for warp speed streaks
          scrollVelocityRef.current = Math.abs(self.getVelocity()) / 900;

          // Track active sector for HUD matrix
          const p = self.progress;
          if (p < 0.12) {
            setActiveSector(1);
          } else if (p < 0.34) {
            setActiveSector(1);
          } else if (p < 0.56) {
            setActiveSector(2);
          } else if (p < 0.78) {
            setActiveSector(3);
          } else {
            setActiveSector(4);
          }
        }
      }
    });

    // =========================================================================
    // ACT 1: THE OCEAN TO SPACE DISSOLVE (0.00 -> 0.12)
    // The ocean narrative gracefully dissolves into the infinite starry cosmos
    // =========================================================================
    if (aboutInner) {
      transitionTl.to(
        aboutInner,
        {
          opacity: 0,
          y: -40,
          scale: 0.95,
          duration: 0.10,
          ease: "power2.out"
        },
        0
      );
    }

    transitionTl.to(
      [projectsSec, starsCanvas, backdrop],
      {
        opacity: 1,
        duration: 0.12,
        ease: "power2.out"
      },
      0
    );

    if (hud) {
      transitionTl.to(
        hud,
        {
          opacity: 1,
          y: 0,
          duration: 0.08,
          ease: "power2.out"
        },
        0.04
      );
    }

    // =========================================================================
    // ACT 2: 3D SPACE FLIGHT TOWARD CELESTIAL DESTINATIONS
    // Z-axis forward travel: deep space -> locked in orbit -> warps past camera
    // =========================================================================

    // Sector 01: Seamie Software Installer (0.12 -> 0.34)
    const wp0 = waypointRefs.current[0];
    if (wp0) {
      transitionTl.to(
        wp0,
        {
          z: 0,
          scale: 1.0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.09,
          ease: "power2.out",
          onStart: () => wp0.classList.add("is-docked")
        },
        0.12
      );
      transitionTl.to(
        wp0,
        {
          z: 70,
          duration: 0.06,
          ease: "none"
        },
        0.21
      );
      transitionTl.to(
        wp0,
        {
          z: 1100,
          scale: 2.3,
          opacity: 0,
          filter: "blur(20px)",
          duration: 0.07,
          ease: "power2.in",
          onComplete: () => wp0.classList.remove("is-docked")
        },
        0.27
      );
    }

    // Sector 02: Quick Win Data Automation (0.34 -> 0.56)
    const wp1 = waypointRefs.current[1];
    if (wp1) {
      transitionTl.to(
        wp1,
        {
          z: 0,
          scale: 1.0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.09,
          ease: "power2.out",
          onStart: () => wp1.classList.add("is-docked")
        },
        0.34
      );
      transitionTl.to(
        wp1,
        {
          z: 70,
          duration: 0.06,
          ease: "none"
        },
        0.43
      );
      transitionTl.to(
        wp1,
        {
          z: 1100,
          scale: 2.3,
          opacity: 0,
          filter: "blur(20px)",
          duration: 0.07,
          ease: "power2.in",
          onComplete: () => wp1.classList.remove("is-docked")
        },
        0.49
      );
    }

    // Sector 03: Synovial Fluid Detection (0.56 -> 0.78)
    const wp2 = waypointRefs.current[2];
    if (wp2) {
      transitionTl.to(
        wp2,
        {
          z: 0,
          scale: 1.0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.09,
          ease: "power2.out",
          onStart: () => wp2.classList.add("is-docked")
        },
        0.56
      );
      transitionTl.to(
        wp2,
        {
          z: 70,
          duration: 0.06,
          ease: "none"
        },
        0.65
      );
      transitionTl.to(
        wp2,
        {
          z: 1100,
          scale: 2.3,
          opacity: 0,
          filter: "blur(20px)",
          duration: 0.07,
          ease: "power2.in",
          onComplete: () => wp2.classList.remove("is-docked")
        },
        0.71
      );
    }

    // Sector 04: Non-Profit Web Platforms (0.78 -> 1.00)
    const wp3 = waypointRefs.current[3];
    if (wp3) {
      transitionTl.to(
        wp3,
        {
          z: 0,
          scale: 1.0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.09,
          ease: "power2.out",
          onStart: () => wp3.classList.add("is-docked")
        },
        0.78
      );
      transitionTl.to(
        wp3,
        {
          z: 50,
          duration: 0.13,
          ease: "none"
        },
        0.87
      );
    }

    return () => {
      if (transitionTl.scrollTrigger) transitionTl.scrollTrigger.kill();
      transitionTl.kill();
    };
  }, []);

  return (
    <div className="ocean-content" ref={containerRef}>
      {/* 01 // ABOUT - The Developer's Journey */}
      <section
        id="about"
        ref={aboutRef}
        data-nav-section
        aria-labelledby="about-title"
        className="depth-section"
      >
        <div className="depth-section-inner">
          <p className="depth-eyebrow">01 / ABOUT</p>
          <h2 id="about-title">Curiosity, then code.</h2>
          <p className="depth-intro">{profile.about}</p>
          <p className="depth-description">{profile.aboutMore}</p>
          {profile.resume && (
            <a className="depth-link" href={profile.resume} download>
              Download résumé ↗
            </a>
          )}

          {/* Scrollytelling Career & Education Timeline */}
          <AboutTimeline />
        </div>
      </section>

      {/* Nav Anchor for My Work link coordination */}
      <div
        id="projects"
        data-nav-section
        aria-hidden="true"
        style={{ position: "relative", top: 0, height: 1, pointerEvents: "none" }}
      />

      {/* 02 // MY WORK (PORTFOLIO) — 3D Celestial Space Flight */}
      <div
        ref={projectsRef}
        className="space-realm"
        aria-label="My Work — 3D Celestial Space Travel"
      >
        {/* Fullscreen 3D Starfield & Halley's Comet Canvas */}
        <canvas className="space-starfield-canvas" ref={starsCanvasRef} />
        <div className="space-realm-backdrop" ref={backdropRef} aria-hidden="true" />

        {/* Space Flight Cockpit HUD (Heads-Up Display) */}
        <div className="space-hud-overlay" ref={hudRef} aria-hidden="true">
          <div className="hud-top-bar">
            <div className="hud-mission-id">
              <span className="hud-pulse-dot" />
              <span>MISSION: TAUHEED.DEV // HYPERSPACE FLIGHT</span>
            </div>

            {/* 4-Sector Constellation Waypoint Matrix */}
            <div className="hud-sector-matrix">
              {projects.map((proj, idx) => {
                const sectorNum = idx + 1;
                const isActive = activeSector === sectorNum;
                const isPassed = activeSector > sectorNum;
                return (
                  <div key={proj.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      className={`hud-sector-node ${
                        isActive ? "is-active" : isPassed ? "is-passed" : ""
                      }`}
                    >
                      <span className="hud-node-marker" />
                      <span>SEC 0{sectorNum}</span>
                    </div>
                    {idx < projects.length - 1 && <div className="hud-matrix-line" />}
                  </div>
                );
              })}
            </div>

            <div className="hud-telemetry-tag">
              <span>WARP ENGINE: ARMED</span>
            </div>
          </div>

          {/* Optical Corner Reticles */}
          <span className="hud-corner-bracket hud-corner-tl" />
          <span className="hud-corner-bracket hud-corner-tr" />
          <span className="hud-corner-bracket hud-corner-bl" />
          <span className="hud-corner-bracket hud-corner-br" />

          <div className="hud-bottom-bar">
            <div className="hud-instruction">
              <span className="hud-scroll-arrow">↓</span>
              <span>SCROLL TO TRAVEL DEEPER THROUGH THE COSMOS</span>
            </div>
            <div>
              <span>SECTOR DESTINATION [{activeSector} / 4]</span>
            </div>
          </div>
        </div>

        {/* 3D Perspective Flight Stage */}
        <div className="celestial-stage" ref={stageRef}>
          {projects.map((project, idx) => (
            <div
              key={project.id}
              ref={(el) => (waypointRefs.current[idx] = el)}
              className="celestial-waypoint"
              data-sector={project.id}
            >
              {/* Floating Holographic Orbital Rings */}
              <div className="celestial-orbit-system" aria-hidden="true">
                <div className="orbit-ring-outer" />
                <div className="orbit-ring-middle" />
                <div className="orbit-ring-inner">
                  <div className="orbit-pulsar-core" />
                </div>
                <div className="orbit-laser-axis" />
              </div>

              {/* Waypoint Celestial Header */}
              <div className="celestial-header">
                <div className="celestial-sector-tag">
                  <span className="sector-beacon-dot" />
                  <span className="sector-code">SECTOR 0{idx + 1} // {project.type}</span>
                </div>
                <h3 className="celestial-title">{project.title}</h3>
                {project.subtitle && <p className="celestial-subtitle">{project.subtitle}</p>}
              </div>

              {/* Floating Satellite Tech Constellation */}
              <div className="celestial-stack-orbit">
                {project.stack.map((tech) => (
                  <span key={tech} className="celestial-tech-node">
                    <span className="tech-node-pip" />
                    {tech}
                  </span>
                ))}
              </div>

              {/* Holographic Telemetry & Architectural Specs (No boxed card!) */}
              <div className="celestial-hud-grid">
                <div className="celestial-telemetry-col">
                  <span className="hud-metric-label">MISSION ARCHITECTURE</span>
                  <p className="hud-metric-text">{project.description}</p>
                </div>

                <div className="celestial-telemetry-col">
                  {project.award && (
                    <div className="hud-award-badge">
                      <span className="award-star">★</span> {project.award}
                    </div>
                  )}
                  <div className="hud-telemetry-subgrid">
                    <div>
                      <span className="hud-metric-label">ENGINEERING CHALLENGE</span>
                      <p className="hud-metric-subtext">{project.problem}</p>
                    </div>
                    <div>
                      <span className="hud-metric-label">VERIFIED OUTCOME</span>
                      <p className="hud-metric-subtext">{project.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Engagement & Orbital Link */}
              <div className="celestial-action-row">
                {project.liveUrl ? (
                  <a
                    className="celestial-orbital-btn"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>ENGAGE LIVE ORBIT ↗</span>
                  </a>
                ) : (
                  <div className="celestial-status-indicator">
                    <span className="status-label">SYSTEM STATUS:</span>
                    <span className="status-value">DEPLOYED &amp; OPERATIONAL</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
