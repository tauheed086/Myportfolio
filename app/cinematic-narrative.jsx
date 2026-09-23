"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Award, ExternalLink, Terminal, Database, Cpu } from "lucide-react";
import { profile } from "./content";
import "./cinematic-narrative.css";

export default function CinematicNarrative() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [activeAct, setActiveAct] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const acts = stage.querySelectorAll(".narrative-act");
    if (!acts.length) return;

    // Initially hide all acts
    gsap.set(acts, { opacity: 0, y: 35, filter: "blur(10px)", pointerEvents: "none" });

    // Master scrub timeline pinned to the container
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        pin: stage,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.25) setActiveAct(0);
          else if (progress < 0.5) setActiveAct(1);
          else if (progress < 0.75) setActiveAct(2);
          else setActiveAct(3);
        }
      }
    });

    // Act 1: The Philosophy (0.00 -> 0.22)
    masterTl
      .to(acts[0], { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, ease: "power2.out" }, 0.1)
      .to(acts[0], { opacity: 0, y: -30, filter: "blur(10px)", duration: 1, ease: "power2.in" }, 2.2);

    // Act 2: The Craftsman (Tauheed Mulla) (0.24 -> 0.48)
    masterTl
      .to(acts[1], {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
        duration: 1.5,
        ease: "power2.out"
      }, 3.0)
      .to(acts[1], {
        opacity: 0,
        y: -30,
        filter: "blur(10px)",
        pointerEvents: "none",
        duration: 1,
        ease: "power2.in"
      }, 5.2);

    // Act 3: Proven Track Record (0.50 -> 0.74)
    masterTl
      .to(acts[2], {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
        duration: 1.5,
        ease: "power2.out"
      }, 6.0)
      .to(acts[2], {
        opacity: 0,
        y: -30,
        filter: "blur(10px)",
        pointerEvents: "none",
        duration: 1,
        ease: "power2.in"
      }, 8.2);

    // Act 4: The Horizon & Transition (0.76 -> 1.00)
    masterTl
      .to(acts[3], {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        pointerEvents: "auto",
        duration: 1.5,
        ease: "power2.out"
      }, 9.0);

    return () => {
      if (masterTl.scrollTrigger) masterTl.scrollTrigger.kill();
      masterTl.kill();
    };
  }, []);

  const scrollToProjects = (e) => {
    e.preventDefault();
    const target = document.getElementById("projects");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="about" data-nav-section ref={containerRef} className="narrative-container">
      <div ref={stageRef} className="narrative-stage">
        <div className="narrative-ambient-glow" />

        {/* ACT 1: The Philosophy */}
        <div className="narrative-act">
          <div className="narrative-eyebrow">
            <span />
            01 // ARCHITECTURAL INTENT
          </div>
          <h2 className="narrative-title-grand">
            Beyond clean interfaces lies the unseen craft.
          </h2>
          <p className="narrative-desc">
            Code isn&apos;t just about syntax—it’s about architecting systems that run with quiet precision, scale without friction, and stand resilient in production.
          </p>
        </div>

        {/* ACT 2: The Craftsman */}
        <div className="narrative-act">
          <div className="narrative-eyebrow">
            <span />
            02 // THE CRAFTSMAN
          </div>
          <h1 className="narrative-name">{profile.name}</h1>
          <p className="narrative-role">Software Developer · Systems &amp; Modern Web</p>
          <p className="narrative-desc">
            Bridging low-level system craftsmanship with reactive modern interfaces. Specialized in high-performance Python backends, Windows endpoint orchestration, and connected full-stack web platforms.
          </p>
          <div className="narrative-pillars">
            <div className="narrative-pillar">
              <Terminal size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "-2px", color: "#6ed3df" }} />
              Windows Endpoint Telemetry
            </div>
            <div className="narrative-pillar">
              <Cpu size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "-2px", color: "#6ed3df" }} />
              Distributed Python Engines
            </div>
            <div className="narrative-pillar">
              <Database size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "-2px", color: "#6ed3df" }} />
              MySQL & Pipeline Optimization
            </div>
          </div>
        </div>

        {/* ACT 3: Proven Track Record */}
        <div className="narrative-act">
          <div className="narrative-eyebrow">
            <span />
            03 // PROVEN IMPACT
          </div>
          <h2 className="narrative-title-grand" style={{ fontSize: "clamp(28px, 4vw, 56px)", marginBottom: "16px" }}>
            Engineered for real-world reliability.
          </h2>
          <div className="narrative-stats-grid">
            <div className="narrative-stat-card">
              <div className="stat-number">
                <Award size={13} style={{ display: "inline", marginRight: "4px", verticalAlign: "-1px" }} />
                STATE RECOGNITION
              </div>
              <h3 className="stat-title">KSCST Best Project</h3>
              <p className="stat-desc">
                State-level award from KSCST for Deep Learning-based automatic synovial fluid detection in joint MRI scans.
              </p>
            </div>

            <div className="narrative-stat-card">
              <div className="stat-number">PRODUCTION PLATFORM</div>
              <h3 className="stat-title">Seamie Installer</h3>
              <p className="stat-desc">
                Engineered background telemetry agents & Flask/Waitress servers for zero-touch silent Windows deployments.
              </p>
            </div>

            <div className="narrative-stat-card">
              <div className="stat-number">DATA CONCURRENCY</div>
              <h3 className="stat-title">Fund Automation</h3>
              <p className="stat-desc">
                Architected high-throughput Python crawlers & optimized MySQL schemas with zero pipeline downtime.
              </p>
            </div>
          </div>
        </div>

        {/* ACT 4: The Horizon & Transition */}
        <div className="narrative-act">
          <div className="narrative-eyebrow">
            <span />
            04 // THE HORIZON
          </div>
          <p className="narrative-quote">
            “From low-level OS deployment to interactive 3D web experiences. Curiosity, then code.”
          </p>
          <div className="narrative-cta-row">
            <a href="#projects" onClick={scrollToProjects} className="narrative-action-link">
              Explore Selected Work <ArrowDown size={16} />
            </a>
            {profile.resume && (
              <a href={profile.resume} download className="narrative-secondary-link">
                Download Résumé <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Vertical Act Progression Rail */}
        <div className="narrative-rail" aria-hidden="true">
          {[0, 1, 2, 3].map((actIdx) => (
            <span
              key={actIdx}
              className={`narrative-rail-dot ${activeAct === actIdx ? "is-active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
