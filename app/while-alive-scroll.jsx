"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./while-alive-scroll.css";

const COMMANDS = [
  { label: "learn();", index: 0 },
  { label: "code();", index: 1 },
  { label: "build();", index: 2 },
  { label: "repeat();", index: 3 },
];

export default function WhileAliveScroll() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Backfill with GSAP matching ref.js if CSS scroll-timeline is not supported
    if (
      !CSS.supports ||
      !CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)")
    ) {
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container) return;

      const items = gsap.utils.toArray(container.querySelectorAll(".while-alive-list li"));
      if (!items.length) return;

      gsap.set(items, { opacity: (i) => (i !== 0 ? 0.2 : 1) });

      const dimmer = gsap
        .timeline()
        .to(items.slice(1), {
          opacity: 1,
          stagger: 0.5,
        })
        .to(
          items.slice(0, items.length - 1),
          {
            opacity: 0.2,
            stagger: 0.5,
          },
          0
        );

      const dimmerScrub = ScrollTrigger.create({
        trigger: items[0],
        endTrigger: items[items.length - 1],
        start: "center center",
        end: "center center",
        animation: dimmer,
        scrub: 0.2,
      });

      return () => {
        dimmerScrub.kill();
        dimmer.kill();
      };
    }
  }, []);

  return (
    <div className="while-alive-stage">
      <div className="while-alive-container" ref={containerRef}>
        <h2 id="about-title" className="while-alive-heading">
          while(alive):
        </h2>
        <ul className="while-alive-list" style={{ "--count": COMMANDS.length }}>
          {COMMANDS.map((cmd) => (
            <li key={cmd.label} style={{ "--i": cmd.index }}>
              {cmd.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
