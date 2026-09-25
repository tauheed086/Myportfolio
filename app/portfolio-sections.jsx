"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile, projects } from "./content";
import AboutTimeline from "./about-timeline.jsx";
import "./space-fold-transition.css";

export default function PortfolioSections() {
  const containerRef = useRef(null);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const projectsInnerRef = useRef(null);
  const backdropRef = useRef(null);
  const starsCanvasRef = useRef(null);

  // Background Starfield Canvas for My Work section
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

    const numStars = 150;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.75 ? "#93c5fd" : Math.random() > 0.5 ? "#6ee7b7" : "#ffffff"
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.twinkle += 0.03;
        const currentAlpha = Math.max(0.1, star.alpha + Math.sin(star.twinkle) * 0.25);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        star.y -= star.speed * 0.5;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // GSAP: Cinematic Transition — First space transition, then the text materializes
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const aboutSec = aboutRef.current;
    const projectsSec = projectsRef.current;
    const projectsInner = projectsInnerRef.current;
    const starsCanvas = starsCanvasRef.current;
    const backdrop = backdropRef.current;

    if (!aboutSec || !projectsSec || !projectsInner) return;

    const aboutInner = aboutSec.querySelector(".depth-section-inner");

    // Master Timeline pinned at bottom of About
    const transitionTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSec,
        start: "bottom bottom",
        end: "+=170%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onEnter: () => {
          gsap.set(projectsSec, {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            pointerEvents: "none"
          });
        },
        onLeave: () => {
          gsap.set(projectsSec, {
            position: "relative",
            top: "auto",
            left: "auto",
            width: "auto",
            height: "auto",
            zIndex: 2,
            pointerEvents: "auto"
          });
        },
        onEnterBack: () => {
          gsap.set(projectsSec, {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            pointerEvents: "none"
          });
        },
        onLeaveBack: () => {
          gsap.set(projectsSec, {
            position: "relative",
            top: "auto",
            left: "auto",
            width: "auto",
            height: "auto",
            zIndex: 2,
            pointerEvents: "none"
          });
        }
      }
    });

    // Initial state: Space text is hidden in the void
    gsap.set(projectsInner, { opacity: 0, y: 70, scale: 0.94, filter: "blur(10px)" });
    if (starsCanvas) gsap.set(starsCanvas, { opacity: 0, scale: 1.15 });
    if (backdrop) gsap.set(backdrop, { opacity: 0 });

    // =========================================================================
    // ACT 1: THE SPACE TRANSITION FIRST (0.0 -> 0.45)
    // The ocean narrative gracefully dissolves into the infinite starry void
    // =========================================================================
    if (aboutInner) {
      transitionTl.to(
        aboutInner,
        {
          opacity: 0,
          y: -40,
          scale: 0.95,
          duration: 0.4,
          ease: "power2.out"
        },
        0
      );
    }

    // Space environment awakens: Starfield expands and ignites
    if (starsCanvas) {
      transitionTl.to(
        starsCanvas,
        {
          opacity: 1,
          scale: 1.0,
          duration: 0.45,
          ease: "power2.out"
        },
        0
      );
    }

    if (backdrop) {
      transitionTl.to(
        backdrop,
        {
          opacity: 1,
          duration: 0.45,
          ease: "power2.out"
        },
        0
      );
    }

    // =========================================================================
    // ACT 2: THEN THE TEXT MATERIALIZES CINEMATICALLY (0.45 -> 1.0)
    // Out of deep space, the typography and portfolio cards emerge from the stars
    // =========================================================================
    transitionTl.to(
      projectsInner,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power2.out"
      },
      0.45
    );

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

      {/* 02 // MY WORK (PORTFOLIO) - Cinematic Space Realm */}
      <section
        id="projects"
        ref={projectsRef}
        data-nav-section
        aria-labelledby="projects-title"
        className="depth-section space-realm"
      >
        <canvas className="space-starfield-canvas" ref={starsCanvasRef} />
        <div className="space-realm-backdrop" ref={backdropRef} aria-hidden="true" />

        <div className="depth-section-inner" ref={projectsInnerRef}>
          <p className="depth-eyebrow">02 / PORTFOLIO · CELESTIAL ARCHITECTURES</p>
          <h2 id="projects-title">Architected &amp; Shipped.</h2>
          <div className="depth-projects">
            {projects.map((project) => (
              <article key={project.id}>
                <span className="depth-project-number">{project.id}</span>
                <div>
                  <h3>
                    {project.title}
                    {project.subtitle && (
                      <span
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#6ed3df",
                          fontWeight: "400",
                          marginTop: "4px",
                          letterSpacing: "0.02em"
                        }}
                      >
                        {project.subtitle}
                      </span>
                    )}
                  </h3>
                  <p
                    style={{
                      color: "#7dc5d4",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      letterSpacing: "0.05em",
                      marginTop: "8px"
                    }}
                  >
                    {project.stack.join(" · ")}
                  </p>
                  <p style={{ marginTop: "12px", lineHeight: "1.7" }}>{project.description}</p>
                  {project.liveUrl && (
                    <a className="depth-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                      View project ↗
                    </a>
                  )}
                </div>
                {project.type && (
                  <small style={{ color: "#6ed3df", opacity: 0.8, letterSpacing: "0.1em", fontSize: "10px" }}>
                    {project.type}
                  </small>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
