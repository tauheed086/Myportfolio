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

    // The text animation starts right from here as the wave crest reaches the top of the screen (~12% of .ocean-journey)
    // and continues until the bottom of the ocean journey where About begins.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".ocean-journey",
        start: "12% top",
        end: "96% bottom",
        scrub: 0.5
      }
    });

    // Beat 1: LEFT SIDE - Beneath the Surface (starts animating in right from this scroll point)
    gsap.set(beats[0], { x: -40, y: 20 });
    tl.to(beats[0], { opacity: 1, x: 0, y: 0, duration: 1.6, ease: "power1.out" }, 0)
      .to(beats[0], { opacity: 0, y: -20, duration: 1.0, ease: "power1.in" }, 2.6);

    // Beat 2: RIGHT SIDE - The Craftsman
    gsap.set(beats[1], { x: 40, y: 20 });
    tl.to(beats[1], { opacity: 1, x: 0, y: 0, duration: 1.6, ease: "power1.out" }, 3.8)
      .to(beats[1], { opacity: 0, y: -20, duration: 1.2, ease: "power1.in" }, 6.6);

    // Beat 3: LEFT SIDE - Systems at Work
    gsap.set(beats[2], { x: -40, y: 20 });
    tl.to(beats[2], { opacity: 1, x: 0, y: 0, duration: 1.6, ease: "power1.out" }, 7.6)
      .to(beats[2], { opacity: 0, y: -20, duration: 1.2, ease: "power1.in" }, 10.4);

    // Beat 4: RIGHT SIDE - Proven Impact
    gsap.set(beats[3], { x: 40, y: 20 });
    tl.to(beats[3], { opacity: 1, x: 0, y: 0, duration: 1.6, ease: "power1.out" }, 11.4)
      .to(beats[3], { opacity: 0, y: -20, duration: 1.2, ease: "power1.in" }, 14.2);

    // Beat 5: CENTER - Perspective
    gsap.set(beats[4], { y: 30, scale: 0.96 });
    tl.to(beats[4], { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: "power1.out" }, 15.2)
      .to(beats[4], { opacity: 0, y: -30, duration: 1.4, ease: "power1.in" }, 18.0);

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
          Zero-touch automation across Windows fleets.
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

      {/* Beat 5: CENTER / BRIDGE */}
      <div className="submerged-beat submerged-beat--center">
        <div className="submerged-eyebrow">
          <span />
          PERSPECTIVE
        </div>
        <h2 className="submerged-title" style={{ fontSize: "clamp(28px, 4vw, 54px)" }}>
          Curiosity, then code.
        </h2>
        <p className="submerged-desc" style={{ maxWidth: "600px" }}>
          From low-level system services to interactive 3D web experiences.
        </p>
      </div>
    </div>
  );
}
