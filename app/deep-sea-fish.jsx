"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import "./ocean-fish.css";

export default function DeepSeaFish({ paused = false }) {
  const containerRef = useRef(null);
  const fishRef = useRef(null);
  const bubblesRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const container = containerRef.current;
    const fish = fishRef.current;
    const bubblesEl = bubblesRef.current;
    if (!container || !fish || !bubblesEl) return;

    // Responsive path scaling based on viewport dimensions
    const getScaledPath = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rx = w / 1200;
      const ry = h / 800;

      const baseCoords = [
        { x: 1050, y: 180 },
        { x: 880, y: 120 },
        { x: 620, y: 260 },
        { x: 220, y: 190 },
        { x: 80, y: 420 },
        { x: 260, y: 480 },
        { x: 680, y: 350 },
        { x: 1040, y: 260 },
        { x: 1120, y: 380 },
        { x: 850, y: 460 },
        { x: 380, y: 380 },
        { x: 140, y: 260 },
        { x: 220, y: 440 },
        { x: 600, y: 500 },
        { x: 1060, y: 520 }
      ];

      return baseCoords.map(({ x, y }) => ({
        x: Math.max(20, Math.min(w - 60, x * rx)),
        y: Math.max(30, Math.min(h - 60, y * ry))
      }));
    };

    // Bubble animation timeline
    const bubbleBubbles = bubblesEl.querySelectorAll(".ocean-bubbles__bubble");
    const bubbleTl = gsap.timeline({ paused: true });
    bubbleTl.set(bubbleBubbles, { y: 40, scale: 0, opacity: 0 });
    bubbleTl.to(bubbleBubbles, {
      scale: 1.15,
      y: -240,
      opacity: 0.95,
      duration: 1.8,
      stagger: 0.14,
      ease: "power1.out"
    });
    bubbleTl.to(
      bubbleBubbles,
      {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in"
      },
      "-=0.7"
    );

    const emitBubbles = () => {
      if (!fish) return;
      const rect = fish.getBoundingClientRect();
      gsap.set(bubblesEl, {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.35
      });
      bubbleTl.restart();
    };

    // Elements for skeletal x-ray reveal
    const headAndBody = fish.querySelectorAll(".fish__head, .fish__body");
    const skeleton = fish.querySelector(".fish__skeleton");
    const inner = fish.querySelector(".fish__inner");

    // Fade in fish and container only when arriving at the #about section
    const visibilityTrigger = ScrollTrigger.create({
      trigger: "#about",
      start: "top 45%",
      endTrigger: ".ocean-content",
      end: "bottom bottom",
      onEnter: () => {
        gsap.to(container, { opacity: 1, duration: 0.8, overwrite: "auto" });
        gsap.to(fish, { opacity: 1, duration: 0.8, overwrite: "auto" });
        emitBubbles();
      },
      onLeaveBack: () => {
        gsap.to(container, { opacity: 0, duration: 0.4, overwrite: "auto" });
        gsap.to(fish, { opacity: 0, duration: 0.4, overwrite: "auto" });
      }
    });

    // Main scroll-driven swimming timeline - starts from #about section
    const swimTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top 45%",
        endTrigger: ".ocean-content",
        end: "bottom bottom",
        scrub: 1.6,
        onUpdate: (self) => {
          // Dynamic horizontal flip when scrolling upwards vs downwards
          if (self.direction === -1) {
            gsap.to(fish, { rotationY: 180, duration: 0.4, overwrite: "auto" });
          } else {
            gsap.to(fish, { rotationY: 0, duration: 0.4, overwrite: "auto" });
          }
        }
      }
    });

    swimTl.to(fish, {
      motionPath: {
        path: getScaledPath(),
        align: "self",
        alignOrigin: [0.5, 0.5],
        autoRotate: true
      },
      duration: 12,
      ease: "none"
    });

    // 3D banking and depth maneuvers along the swim
    swimTl.to(fish, { rotateX: 180, duration: 1 }, 1);
    swimTl.to(fish, { rotateX: 0, duration: 1 }, 2.6);
    swimTl.to(fish, { z: -350, duration: 2 }, 2.6);
    swimTl.to(fish, { rotateX: 180, duration: 1 }, 4.2);
    swimTl.to(fish, { rotateX: 0, duration: 1 }, 5.8);
    swimTl.to(fish, { z: -40, duration: 2 }, 5.5);

    // Deep abyss transition: flesh fades into glowing skeleton
    if (skeleton && headAndBody.length) {
      swimTl.to(skeleton, { opacity: 0.7, duration: 0.15, repeat: 3, yoyo: true }, 8.5);
      swimTl.to(headAndBody, { opacity: 0.2, duration: 0.15, repeat: 3, yoyo: true }, 8.5);
      swimTl.to(skeleton, { opacity: 0.85, duration: 0.8 }, 10.5);
      swimTl.to(headAndBody, { opacity: 0.15, duration: 0.8 }, 10.5);
      if (inner) {
        swimTl.to(inner, { opacity: 0.4, duration: 0.8 }, 10.5);
      }
    }

    // Section trigger for bubbles at the projects section
    const projectsSection = document.getElementById("projects");
    let projectsTrigger = null;
    if (projectsSection) {
      projectsTrigger = ScrollTrigger.create({
        trigger: projectsSection,
        start: "top 60%",
        onEnter: () => emitBubbles(),
        onEnterBack: () => emitBubbles()
      });
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      visibilityTrigger.kill();
      if (projectsTrigger) projectsTrigger.kill();
      if (swimTl.scrollTrigger) swimTl.scrollTrigger.kill();
      swimTl.kill();
      bubbleTl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="ocean-atmosphere"
      aria-hidden="true"
    >
      {/* Bioluminescent Deep-Sea Particles */}
      <div className="ocean-lights">
        <div className="ocean-lights__group">
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
          <div className="ocean-lights__light" />
        </div>
      </div>

      {/* Pure CSS 3D Swimming Fish */}
      <div className="fish-wrapper">
        <div
          ref={fishRef}
          className="fish"
          style={{ animationPlayState: paused ? "paused" : "running", opacity: 0 }}
        >
          <div className="fish__skeleton" />
          <div className="fish__inner">
            {/* Body facets */}
            <div className="fish__body" />
            <div className="fish__body" />
            <div className="fish__body" />
            <div className="fish__body" />

            {/* Head facets */}
            <div className="fish__head" />
            <div className="fish__head fish__head--2" />
            <div className="fish__head fish__head--3" />
            <div className="fish__head fish__head--4" />

            {/* Tail */}
            <div className="fish__tail-main" />
            <div className="fish__tail-fork" />

            {/* Fins */}
            <div className="fish__fin" />
            <div className="fish__fin fish__fin--2" />
          </div>
        </div>
      </div>

      {/* Dynamic Bubble Emitter */}
      <div ref={bubblesRef} className="ocean-bubbles">
        <div className="ocean-bubbles__inner">
          <div className="ocean-bubbles__bubble" />
          <div className="ocean-bubbles__bubble" />
          <div className="ocean-bubbles__bubble" />
          <div className="ocean-bubbles__bubble" />
        </div>
      </div>
    </div>
  );
}
