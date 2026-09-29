"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "./content";
import AboutTimeline from "./about-timeline.jsx";
import SpaceTravelScene from "./space-travel-scene.jsx";
import "./space-fold-transition.css";

export default function PortfolioSections() {
  const containerRef = useRef(null);
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const projectsIntroRef = useRef(null);
  const flightProgressRef = useRef(0);

  // =========================================================================
  // Master GSAP Timeline: Fast Ocean-to-Space Dissolve -> Project Intro -> 3D Planets
  // Pinned seamlessly at bottom of About section
  // =========================================================================
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const aboutSec = aboutRef.current;
    const projectsSec = projectsRef.current;
    const projectsIntro = projectsIntroRef.current;

    if (!aboutSec || !projectsSec) return;

    const aboutInner = aboutSec.querySelector(".depth-section-inner");

    // Initial states
    gsap.set(projectsSec, { opacity: 0 });
    if (projectsIntro) {
      gsap.set(projectsIntro, { opacity: 0, y: 25, scale: 0.96, filter: "blur(6px)" });
    }

    // Master Timeline pinned at bottom of About (extended 580% scroll height to White Smoky Planet)
    const transitionTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutSec,
        start: "bottom bottom",
        end: "+=580%",
        pin: true,
        scrub: 0.5,
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
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 10,
            opacity: 1,
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
            pointerEvents: "auto"
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
            opacity: 0,
            pointerEvents: "none"
          });
          if (aboutInner) gsap.set(aboutInner, { opacity: 1, visibility: "visible", y: 0, scale: 1 });
          if (projectsIntro) gsap.set(projectsIntro, { opacity: 0, visibility: "visible", y: 25, scale: 0.96, filter: "blur(6px)" });
          flightProgressRef.current = 0;
        }
      }
    });

    // =========================================================================
    // ACT 1: QUICK & SMOOTH OCEAN-TO-SPACE DISSOLVE (0.00 -> 0.16)
    // No long pause: about section dissolves quickly into the cosmic starfield
    // =========================================================================
    if (aboutInner) {
      transitionTl.to(
        aboutInner,
        {
          opacity: 0,
          y: -30,
          scale: 0.96,
          duration: 0.14,
          ease: "power2.out"
        },
        0
      );
      transitionTl.set(aboutInner, { visibility: "hidden" }, 0.15);
    }

    transitionTl.to(
      projectsSec,
      {
        opacity: 1,
        duration: 0.16,
        ease: "power2.out"
      },
      0
    );

    // =========================================================================
    // ACT 2: PROJECT INTRO IN SPACE BEFORE PLANETS (0.14 -> 0.35)
    // In the same starry cosmic background, the project headline materializes
    // then smoothly dissolves into deep space as flight initiates
    // =========================================================================
    if (projectsIntro) {
      transitionTl.to(
        projectsIntro,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.10,
          ease: "power2.out"
        },
        0.14
      );
      transitionTl.to(
        projectsIntro,
        {
          opacity: 0,
          y: -40,
          scale: 1.05,
          filter: "blur(10px)",
          duration: 0.09,
          ease: "power2.in"
        },
        0.26
      );
      transitionTl.set(projectsIntro, { visibility: "hidden" }, 0.35);
    }

    transitionTl.set(projectsSec, { pointerEvents: "auto" }, 0.35);

    // =========================================================================
    // ACT 3: THEN 3D PLANETS FLY PAST IN SPACE (0.35 -> 1.00)
    // Only after project intro dissolves do the 3D worlds emerge and fly past
    // =========================================================================
    const flightObj = { progress: 0 };
    transitionTl.to(
      flightObj,
      {
        progress: 1,
        duration: 0.65,
        ease: "none",
        onUpdate: () => {
          flightProgressRef.current = flightObj.progress;
        }
      },
      0.35
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
          
          <h2 id="about-title">Curiosity, then code.</h2>
          <p className="depth-intro">{profile.about}</p>
          <p className="depth-description">{profile.aboutMore}</p>
          {/* {profile.resume && (
            <a className="depth-link" href={profile.resume} download>
              Download résumé ↗
            </a>
          )} */}

          {/* Scrollytelling Career & Education Timeline */}
          <AboutTimeline />

          {/* Nav Anchor for My Work link coordination */}
          <div
            id="projects"
            data-nav-section
            aria-hidden="true"
            style={{ position: "relative", bottom: 0, height: 1, pointerEvents: "none" }}
          />
        </div>
      </section>

      {/* 02 // MY WORK (PORTFOLIO) — 3D Celestial WebGL Space Flight */}
      <div
        ref={projectsRef}
        className="space-realm"
        aria-label="Featured Projects — 3D Celestial Flight"
      >
        {/* Project Section Narrative Intro before 3D planetary flyby */}
        <div className="space-projects-intro" ref={projectsIntroRef}>

          <h2 className="space-intro-title">Architected &amp; Shipped.</h2>
          <p className="space-intro-subtitle">
            Enterprise system automation, high-throughput pipelines, and deep-learning architectures built for performance and resilience.
          </p>
          <div className="space-intro-scroll-hint">
            <span className="scroll-hint-sparkle">✦</span>
            <span>SCROLL TO ENTER PLANETARY FLIGHT</span>
            <span className="scroll-hint-arrow">↓</span>
          </div>
        </div>

        <SpaceTravelScene flightProgressRef={flightProgressRef} />
      </div>

      {/* Nav Anchor for Contact section link coordination */}
      <div
        id="contact"
        data-nav-section
        aria-hidden="true"
        style={{ position: "relative", height: 1, pointerEvents: "none" }}
      />
    </div>
  );
}
