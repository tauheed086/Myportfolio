"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  GraduationCap, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  Compass
} from "lucide-react";
import { careerTimeline } from "./content";
import "./about-timeline.css";

export default function AboutTimeline() {
  const containerRef = useRef(null);
  const railFillRef = useRef(null);
  const beaconRef = useRef(null);
  const continuityRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const rows = container.querySelectorAll(".about-timeline-row");
    const railFill = railFillRef.current;
    const beacon = beaconRef.current;
    const continuityNode = continuityRef.current;

    const createdTriggers = [];

    // 1. Dynamic Rail Fill & Traveling Beacon Scrub
    if (railFill && beacon) {
      const railTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          end: "bottom 75%",
          scrub: 0.3
        }
      });

      railTl.fromTo(railFill,
        { scaleY: 0 },
        { scaleY: 1, ease: "none" },
        0
      );

      railTl.fromTo(beacon,
        { top: "0%", opacity: 0, scale: 0.6 },
        { top: "100%", opacity: 1, scale: 1, ease: "none" },
        0
      );

      if (railTl.scrollTrigger) createdTriggers.push(railTl.scrollTrigger);
    }

    // 2. Sequential Rack-Focus for Cards (Last Card STOPS zoom-out & stays in focus)
    rows.forEach((row, index) => {
      const cardSide = row.querySelector(".timeline-card-side");
      const textSide = row.querySelector(".timeline-text-side");
      const dot = row.querySelector(".timeline-dot");
      const isLast = index === rows.length - 1;

      // Initial resting state (out of focus)
      gsap.set([cardSide, textSide], {
        scale: 0.62,
        opacity: 0.1,
        filter: "blur(8px)"
      });
      if (dot) gsap.set(dot, { scale: 0.7 });

      if (isLast) {
        // FINAL MILESTONE: Zooms in and STOPS zooming out (stays permanently in sharp focus)
        // Represents current active progression with uninterrupted continuity
        const lastRowTl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            end: "center 50%",
            scrub: 0.3,
            onEnter: () => row.classList.add("is-active", "is-current-progression"),
            onEnterBack: () => row.classList.add("is-active", "is-current-progression"),
            onLeaveBack: () => row.classList.remove("is-active", "is-current-progression")
          }
        });

        lastRowTl
          .to(cardSide, {
            scale: 1.05,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power1.out"
          }, 0)
          .to(textSide, {
            scale: 1.0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power1.out"
          }, 0)
          .to(dot, {
            scale: 1.45,
            duration: 0.6,
            ease: "power1.out"
          }, 0);

        if (lastRowTl.scrollTrigger) createdTriggers.push(lastRowTl.scrollTrigger);
      } else {
        // INTERMEDIATE MILESTONES: Rack-focus (Zoom In -> Immediate Zoom Out as next card enters)
        const rowTl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 82%",      // Begins zooming in as it enters viewport
            end: "bottom 18%",     // Finishes zooming out as it leaves focus zone
            scrub: 0.3,
            onUpdate: (self) => {
              if (self.progress >= 0.32 && self.progress <= 0.68) {
                row.classList.add("is-active");
              } else {
                row.classList.remove("is-active");
              }
            }
          }
        });

        rowTl
          // Phase 1: Zoom In into center focus peak (0% -> 50%)
          .to(cardSide, {
            scale: 1.05,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power1.out"
          }, 0)
          .to(textSide, {
            scale: 1.0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power1.out"
          }, 0)
          .to(dot, {
            scale: 1.4,
            duration: 0.5,
            ease: "power1.out"
          }, 0)

          // Phase 2: IMMEDIATELY Zoom Out as the next card begins zooming in (50% -> 100%)
          .to(cardSide, {
            scale: 0.62,
            opacity: 0.1,
            filter: "blur(8px)",
            duration: 0.5,
            ease: "power1.in"
          }, 0.5)
          .to(textSide, {
            scale: 0.68,
            opacity: 0.1,
            filter: "blur(6px)",
            duration: 0.5,
            ease: "power1.in"
          }, 0.5)
          .to(dot, {
            scale: 0.7,
            duration: 0.5,
            ease: "power1.in"
          }, 0.5);

        if (rowTl.scrollTrigger) createdTriggers.push(rowTl.scrollTrigger);
      }
    });

    // 3. Reveal Ongoing Continuity Node below the last card
    if (continuityNode) {
      gsap.fromTo(continuityNode,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: continuityNode,
            start: "top 90%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    return () => {
      createdTriggers.forEach(t => t.kill());
    };
  }, []);

  const getIconForMilestone = (item) => {
    if (item.type === "education") {
      return <GraduationCap size={24} strokeWidth={1.8} />;
    }
    if (item.id === "04") {
      return <Building2 size={24} strokeWidth={1.8} />;
    }
    return <Briefcase size={24} strokeWidth={1.8} />;
  };

  return (
    <div className="about-timeline-wrapper" ref={containerRef}>
      {/* Central Filling Rail */}
      <div className="about-timeline-track" aria-hidden="true">
        {/* Subtle background guide rail */}
        <div className="timeline-rail-bg" />
        {/* Dynamic gradient fill bar */}
        <div className="timeline-rail-fill" ref={railFillRef} />
        {/* Radiant beacon probe riding the fill tip */}
        <div className="timeline-rail-beacon" ref={beaconRef} />
      </div>

      {/* Alternating Rows */}
      <div className="about-timeline-rows">
        {careerTimeline.map((item, index) => {
          const isEven = index % 2 === 0;
          const isLast = index === careerTimeline.length - 1;

          // Text Side (Right-aligned if on Left, Left-aligned if on Right)
          const textContent = (
            <div className="timeline-text-side">
              <span className="timeline-category-tag">{item.category}</span>
              <h3 className="timeline-period-title">{item.period}</h3>
              <p className="timeline-org-location">
                <span>{item.title}</span> · <span>{item.organization}</span>
              </p>
              <p className="timeline-narrative">{item.narrative}</p>
            </div>
          );

          // Option 1: Tech ID & Credential Card
          const cardContent = (
            <div className="timeline-card-side">
              <div className="credential-card">
                {/* Header bar */}
                <div className="card-header-bar">
                  <span className="card-code">{item.credential.code}</span>
                  <div className={`card-status-badge ${item.credential.status.includes("Active") ? "status-active" : ""}`}>
                    {item.credential.status.includes("Active") ? (
                      <span className="card-live-dot" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 size={12} strokeWidth={2.4} aria-hidden="true" />
                    )}
                    <span>{item.credential.status}</span>
                  </div>
                </div>

                {/* Main ID info */}
                <div className="card-main-info">
                  <div className="card-icon-wrap" aria-hidden="true">
                    {getIconForMilestone(item)}
                  </div>
                  <div className="card-text-block">
                    <p className="card-badge-type">{item.credential.type}</p>
                    <h4 className="card-institution">{item.credential.institution}</h4>
                    <p className="card-subtext">{item.credential.subTitle}</p>
                  </div>
                </div>

                {/* Highlights */}
                {item.credential.highlights && (
                  <div className="card-highlights" aria-label="Core Competencies">
                    {item.credential.highlights.map((h, i) => (
                      <span key={i} className="card-pill">
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <article key={item.id} className={`about-timeline-row ${isLast ? "is-final-milestone" : ""}`}>
              {/* Desktop Left Slot: Row 0/2 Text, Row 1/3 Card */}
              <div className="timeline-slot timeline-slot--left">
                {isEven ? textContent : cardContent}
              </div>

              {/* Center Dot Anchor */}
              <div className="timeline-dot-anchor" aria-hidden="true">
                <div className="timeline-dot">
                  <div className="timeline-dot-core" />
                  <div className="timeline-dot-ring" />
                </div>
              </div>

              {/* Desktop Right Slot: Row 0/2 Card, Row 1/3 Text */}
              <div className="timeline-slot timeline-slot--right">
                {isEven ? cardContent : textContent}
              </div>
            </article>
          );
        })}
      </div>

      {/* Ongoing Progression & Future Horizon Node */}
      <div className="timeline-continuity-node" ref={continuityRef}>
        <div className="continuity-beam-line" aria-hidden="true">
          <div className="continuity-beam-stream" />
        </div>
        <div className="continuity-badge-card">
          <div className="continuity-left-meta">
            <span className="continuity-pulse-icon" aria-hidden="true" />
            <div>
              <p className="continuity-title">Current Progression · Uninterrupted Flow</p>
              <p className="continuity-motto-code">while(alive): build(); learn(); repeat();</p>
            </div>
          </div>
          <span className="continuity-action-tag">Continuously Expanding</span>
        </div>
      </div>
    </div>
  );
}
