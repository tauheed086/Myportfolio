"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "./content";
import "./submerged-narrative.css";

export default function SubmergedNarrative() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const beats = container.querySelectorAll(".submerged-beat");
    if (!beats.length) return;

    // Initially hide all beats
    gsap.set(beats, { opacity: 0, pointerEvents: "none" });

    // The text animation starts right from here as the wave crest reaches the top of the screen (~10% of .ocean-journey)
    // and continues until the bottom of the ocean journey where About begins.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".ocean-journey",
        start: "10% top",
        end: "bottom bottom",
        scrub: true
      }
    });

    // Beat 1: LEFT SIDE - Beneath the Surface (starts animating in right from this scroll point)
    gsap.set(beats[0], { x: -40, y: 20 });
    tl.to(beats[0], { opacity: 1, x: 0, y: 0, duration: 1.4, ease: "power1.out" }, 0)
      .to(beats[0], { opacity: 0, y: -20, duration: 1.0, ease: "power1.in" }, 2.4);

    // Beat 2: RIGHT SIDE - The Craftsman
    gsap.set(beats[1], { x: 40, y: 20 });
    tl.to(beats[1], { opacity: 1, x: 0, y: 0, duration: 1.4, ease: "power1.out" }, 3.4)
      .to(beats[1], { opacity: 0, y: -20, duration: 1.0, ease: "power1.in" }, 5.8);

    // Beat 3: LEFT SIDE - Systems at Work
    gsap.set(beats[2], { x: -40, y: 20 });
    tl.to(beats[2], { opacity: 1, x: 0, y: 0, duration: 1.4, ease: "power1.out" }, 6.8)
      .to(beats[2], { opacity: 0, y: -20, duration: 1.0, ease: "power1.in" }, 9.2);

    // Beat 4: RIGHT SIDE - Proven Impact
    gsap.set(beats[3], { x: 40, y: 20 });
    tl.to(beats[3], { opacity: 1, x: 0, y: 0, duration: 1.4, ease: "power1.out" }, 10.2)
      .to(beats[3], { opacity: 0, y: -20, duration: 1.0, ease: "power1.in" }, 12.6);

    // Beat 5: LEFT SIDE - while(alive): learn(); code(); build(); repeat();
    // Directly below the Award Section in Hero Section 2
    const aliveList = container.querySelector(".hero2-while-alive-list");
    const aliveItems = aliveList ? aliveList.querySelectorAll(".hero2-alive-item") : [];

    gsap.set(beats[4], { xPercent: 0, x: -40, y: 20 });
    if (aliveItems.length) {
      // Slot kinetic scroll: Window height is 3.9em (3 lines: top dimmed, center active, bottom dimmed)
      // active line is level with while(alive): at y = 1.3em
      // Initial state: learn() is active in the center slot (y: 1.3em), code() is dimmed below
      gsap.set(aliveList, { y: "1.3em" });
      gsap.set(aliveItems, {
        opacity: (i) => (i === 0 ? 1 : 0.22),
      });
    }

    // Fade and slide in Beat 5 from the left
    tl.to(beats[4], { opacity: 1, xPercent: 0, x: 0, y: 0, duration: 1.4, ease: "power1.out" }, 13.4);

    // Step through each command matching the slot kinetic scroll:
    // Line above is dimmed (opacity 0.22), active line is bright at center (opacity 1), line below is dimmed (opacity 0.22)
    if (aliveList && aliveItems.length === 4) {
      // Step 1: learn() -> code()
      tl.to(aliveList, { y: "0em", duration: 1.4, ease: "power2.inOut" }, 15.0)
        .to(aliveItems[0], { opacity: 0.22, duration: 0.9 }, 15.0)
        .to(aliveItems[1], { opacity: 1, duration: 0.9 }, 15.4);

      // Step 2: code() -> build()
      tl.to(aliveList, { y: "-1.3em", duration: 1.4, ease: "power2.inOut" }, 16.8)
        .to(aliveItems[1], { opacity: 0.22, duration: 0.9 }, 16.8)
        .to(aliveItems[2], { opacity: 1, duration: 0.9 }, 17.2);

      // Step 3: build() -> repeat()
      tl.to(aliveList, { y: "-2.6em", duration: 1.4, ease: "power2.inOut" }, 18.6)
        .to(aliveItems[2], { opacity: 0.22, duration: 0.9 }, 18.6)
        .to(aliveItems[3], { opacity: 1, duration: 0.9 }, 19.0);
    }

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="submerged-narrative-layer"
      aria-hidden="true"
    >
      {/* Beat 1: LEFT SIDE */}
      <div className="submerged-beat submerged-beat--left">
        <div className="submerged-eyebrow">
          <span />
          BENEATH THE SURFACE
        </div>
        <h2 className="submerged-title">
          Where architecture meets quiet precision.
        </h2>
        <p className="submerged-desc">
          Beyond clean interfaces lies the unseen craft—code architected to run with resilience and scale without friction.
        </p>
      </div>

      {/* Beat 2: RIGHT SIDE */}
      <div className="submerged-beat submerged-beat--right">
        <div className="submerged-eyebrow">
          <span />
          THE CRAFTSMAN
        </div>
        <h2 className="submerged-title submerged-title--accent">
          I&apos;m {profile.name}.
        </h2>
        <p className="submerged-desc">
          Software Developer specialized in system-level automation, robust backend engines, and responsive modern web architectures. Connecting low-level operating system telemetry with reactive, fluid interfaces.
        </p>
        <div className="submerged-badge-row">
          <span className="submerged-badge">Python</span>
          <span className="submerged-badge">JavaScript</span>
          <span className="submerged-badge">MySQL</span>
          <span className="submerged-badge">Flask &amp; Django</span>
        </div>
      </div>

      {/* Beat 3: LEFT SIDE */}
      <div className="submerged-beat submerged-beat--left">
        <div className="submerged-eyebrow">
          <span />
          SYSTEMS AT WORK
        </div>
        <h2 className="submerged-title">
          Automation across Windows fleets.
        </h2>
        <p className="submerged-desc">
          Engineered background endpoint telemetry agents, multithreaded backends, and automated silent package deployment for enterprise platforms.
        </p>
        <div className="submerged-badge-row">
          <span className="submerged-badge">Endpoint Telemetry</span>
          <span className="submerged-badge">Silent Installers</span>
          <span className="submerged-badge">Web Crawlers</span>
        </div>
      </div>

      {/* Beat 4: RIGHT SIDE */}
      <div className="submerged-beat submerged-beat--right">
        <div className="submerged-eyebrow">
          <span />
          PROVEN IMPACT
        </div>
        <h2 className="submerged-title">
          Awarded Best Academic Project by KSCST.
        </h2>
        <p className="submerged-desc">
          State-level recognition for Deep Learning research in joint MRI computer vision, paired with high-throughput data crawling pipelines in production.
        </p>
        <div className="submerged-badge-row">
          <span className="submerged-badge">State Award Winner</span>
          <span className="submerged-badge">Deep Learning</span>
          <span className="submerged-badge">Computer Vision</span>
        </div>
      </div>

      {/* Beat 5: LEFT SIDE - while(alive): learn(); code(); build(); repeat(); */}
      <div className="submerged-beat submerged-beat--left submerged-beat--while-alive">
        {/* <div className="submerged-eyebrow">
          <span />
          PERSPECTIVE
        </div> */}

        <div className="hero2-while-alive-stage">
          <span className="hero2-while-alive-prefix">while(alive):</span>
          <div className="hero2-while-alive-window">
            <ul className="hero2-while-alive-list">
              <li className="hero2-alive-item item-0">learn();</li>
              <li className="hero2-alive-item item-1">code();</li>
              <li className="hero2-alive-item item-2">build();</li>
              <li className="hero2-alive-item item-3">repeat();</li>
            </ul>
          </div>
        </div>

        {/* <p className="submerged-desc" style={{ maxWidth: "600px", marginTop: "20px" }}>
          From low-level system services to interactive 3D web experiences.
        </p> */}
      </div>
    </div>
  );
}
