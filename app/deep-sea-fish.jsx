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
  const refBubblesRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    const container = containerRef.current;
    const fish = fishRef.current;
    const bubblesEl = bubblesRef.current;
    const refBubblesEl = refBubblesRef.current;
    if (!container || !fish || !bubblesEl || !refBubblesEl) return;

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

    let bubbleIndex = 0;
    let isFishVisible = false;
    let lastBubbleProgress = 0;
    let lastBubbleTime = 0;
    let lastClusterTime = 0;
    let lastDirection = 1;

    // Interactive cursor bubble throttling
    let lastMouseX = -999;
    let lastMouseY = -999;
    let lastMouseTime = 0;

    const bubbleElements = bubblesEl.querySelectorAll(".ocean-bubbles__bubble");
    const refBubbleElements = refBubblesEl.querySelectorAll(".bubbles__bubble");

    // Timeline for the reference 3-bubble cluster (from Michelle Barker's ref.html / ref.js)
    const refBubblesTl = gsap.timeline({ paused: true });
    refBubblesTl.set(refBubbleElements, {
      y: 60,
      scale: 0,
      opacity: 0
    });
    refBubblesTl.to(refBubbleElements, {
      scale: 1.2,
      y: -220,
      opacity: 0.9,
      duration: 1.8,
      stagger: 0.18,
      ease: "power1.out"
    });
    refBubblesTl.to(
      refBubbleElements,
      {
        scale: 1,
        opacity: 0,
        duration: 0.8,
        ease: "power1.in"
      },
      "-=0.7"
    );

    const triggerReferenceBubbles = () => {
      if (!fish || !refBubblesEl) return;
      const rect = fish.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const offsetX = lastDirection === -1 ? rect.width * 0.1 : rect.width * 0.7;
      const offsetY = rect.height * 0.25;
      gsap.set(refBubblesEl, {
        x: rect.left + offsetX,
        y: rect.top + offsetY
      });
      refBubblesTl.restart();
    };

    // Single swimming bubble emitter (calm, balanced, natural trail)
    const spawnSwimBubble = (count = 1) => {
      if (!fish || !bubbleElements.length) return;
      const rect = fish.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const spawnX = lastDirection === -1
        ? centerX - rect.width * 0.32
        : centerX + rect.width * 0.32;
      const spawnY = centerY + gsap.utils.random(-6, 6);

      for (let i = 0; i < count; i++) {
        const bubble = bubbleElements[bubbleIndex % bubbleElements.length];
        bubbleIndex++;

        const size = gsap.utils.random(16, 30);
        const driftX = gsap.utils.random(-25, 25) + (lastDirection === -1 ? 18 : -18);
        const riseY = gsap.utils.random(160, 260);
        const duration = gsap.utils.random(1.6, 2.4);

        gsap.killTweensOf(bubble);
        gsap.set(bubble, {
          x: spawnX + gsap.utils.random(-4, 4),
          y: spawnY + gsap.utils.random(-4, 4),
          width: `${size}px`,
          height: `${size}px`,
          scale: 0.25,
          opacity: gsap.utils.random(0.75, 0.92)
        });

        gsap.to(bubble, {
          y: spawnY - riseY,
          x: spawnX + driftX,
          scale: gsap.utils.random(1.05, 1.3),
          opacity: 0,
          duration: duration,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
    };

    // Interactive cursor bubble emitter (delicate, tactile trail on pointer movement)
    const spawnCursorBubble = (x, y) => {
      if (!bubbleElements.length) return;
      const bubble = bubbleElements[bubbleIndex % bubbleElements.length];
      bubbleIndex++;

      const size = gsap.utils.random(10, 20);
      const driftX = gsap.utils.random(-16, 16);
      const riseY = gsap.utils.random(90, 160);
      const duration = gsap.utils.random(1.2, 1.8);

      gsap.killTweensOf(bubble);
      gsap.set(bubble, {
        x: x + gsap.utils.random(-3, 3),
        y: y + gsap.utils.random(-3, 3),
        width: `${size}px`,
        height: `${size}px`,
        scale: 0.2,
        opacity: gsap.utils.random(0.65, 0.88)
      });

      gsap.to(bubble, {
        y: y - riseY,
        x: x + driftX,
        scale: gsap.utils.random(1.0, 1.2),
        opacity: 0,
        duration: duration,
        ease: "power1.out",
        overwrite: "auto"
      });
    };

    const handlePointerMove = (e) => {
      // Spawn cursor bubbles once entering underwater depths
      if (window.scrollY < 80) return;

      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);

      // Require moving at least 36px and 140ms between bubbles for a subtle, aesthetic trail
      if (dist > 36 && now - lastMouseTime > 140) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseTime = now;
        spawnCursorBubble(e.clientX, e.clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const setVisible = (visible) => {
      isFishVisible = visible;
      gsap.to(container, { opacity: visible ? 1 : 0, duration: 0.5, overwrite: "auto" });
      gsap.to(fish, { opacity: visible ? 1 : 0, duration: 0.5, overwrite: "auto" });
    };

    // Elements for skeletal x-ray reveal
    const headAndBody = fish.querySelectorAll(".fish__head, .fish__body");
    const skeleton = fish.querySelector(".fish__skeleton");
    const inner = fish.querySelector(".fish__inner");

    // Fade in fish and bubbles right as the wave submerges the screen (~10% of .ocean-journey)
    // and conclude when the About section ends
    const visibilityTrigger = ScrollTrigger.create({
      trigger: ".ocean-journey",
      start: "10% top",
      endTrigger: "#about",
      end: "bottom bottom",
      onEnter: () => {
        setVisible(true);
        triggerReferenceBubbles();
        spawnSwimBubble(2);
      },
      onEnterBack: () => {
        setVisible(true);
        triggerReferenceBubbles();
        spawnSwimBubble(2);
      },
      onLeave: () => {
        setVisible(false);
      },
      onLeaveBack: () => {
        setVisible(false);
      }
    });

    // Immediate sync on load if already scrolled past start
    if (visibilityTrigger.isActive) {
      setVisible(true);
    }

    // Gentle, periodic breathing bubble while resting (every 4.5 seconds)
    const breathInterval = setInterval(() => {
      if ((isFishVisible || (swimTl.scrollTrigger && swimTl.scrollTrigger.isActive)) && !paused) {
        spawnSwimBubble(1);
      }
    }, 4500);

    // Main scroll-driven swimming timeline - begins right as wave submerges the screen
    // and completes smoothly at the end of the About section
    const swimTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".ocean-journey",
        start: "10% top",
        endTrigger: "#about",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // Dynamic horizontal flip ONLY when direction actually changes with intentional velocity
          if (self.direction !== lastDirection && Math.abs(self.getVelocity()) > 20) {
            lastDirection = self.direction;
            gsap.to(fish, {
              rotationY: self.direction === -1 ? 180 : 0,
              duration: 0.35,
              overwrite: "auto"
            });
          }

          // Ensure visibility is active
          if (self.isActive && !isFishVisible) {
            setVisible(true);
          }

          // Stream bubbles moderately as the fish swims through the water
          if (isFishVisible || self.isActive) {
            const now = performance.now();
            const deltaProgress = Math.abs(self.progress - lastBubbleProgress);

            // Spaced-out, calm emission
            if (deltaProgress > 0.05 && now - lastBubbleTime > 550) {
              lastBubbleProgress = self.progress;
              lastBubbleTime = now;
              spawnSwimBubble(1);

              // Sparse reference cluster on sustained swim (8s cooldown)
              if (now - lastClusterTime > 8000) {
                lastClusterTime = now;
                triggerReferenceBubbles();
              }
            }
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

    // Smoothly fade out the fish as About section reaches completion
    swimTl.to(fish, { opacity: 0, duration: 1.0, ease: "power2.in" }, 11.0);

    // Section trigger for bubbles at About section entrance
    const aboutSection = document.getElementById("about");
    let aboutTrigger = null;
    if (aboutSection) {
      aboutTrigger = ScrollTrigger.create({
        trigger: aboutSection,
        start: "top 70%",
        onEnter: () => {
          triggerReferenceBubbles();
        },
        onEnterBack: () => {
          triggerReferenceBubbles();
        }
      });
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(breathInterval);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      visibilityTrigger.kill();
      if (aboutTrigger) aboutTrigger.kill();
      if (swimTl.scrollTrigger) swimTl.scrollTrigger.kill();
      swimTl.kill();
      refBubblesTl.kill();
    };
  }, [paused]);

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

      {/* Reference Bubble Cluster (exact from Michelle Barker's ref.html / ref.css) */}
      <div ref={refBubblesRef} className="bubbles" aria-hidden="true">
        <div className="bubbles__inner">
          <div className="bubbles__bubble" />
          <div className="bubbles__bubble" />
          <div className="bubbles__bubble" />
        </div>
      </div>

      {/* Continuous Dynamic Swimming & Cursor Bubble Stream */}
      <div ref={bubblesRef} className="ocean-bubbles" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="ocean-bubbles__bubble" />
        ))}
      </div>
    </div>
  );
}
