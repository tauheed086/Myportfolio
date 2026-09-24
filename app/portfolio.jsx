"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, Moon, Sun, Pause, Play, X, FileText } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import WaveScene from "./wave-scene";
import useOceanScroll from "./use-ocean-scroll";
import useScrollNavigation from "./use-scroll-navigation";
import PortfolioSections from "./portfolio-sections";
import DeepSeaFish from "./deep-sea-fish";
import SubmergedNarrative from "./submerged-narrative";
import ResumeDrawer from "./resume-drawer";
import { profile } from "./content";

const navigation = [{ id: "about", label: "About" }, { id: "projects", label: "My Work" }, { id: "contact", label: "Contact Me" }];

const subscribeTheme = (notify) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const getThemeSnapshot = () => {
  try {
    return localStorage.getItem("portfolio-theme") === "night";
  } catch {
    return false;
  }
};
const getServerThemeSnapshot = () => false;

export default function Portfolio() {
  const { journey, submerged, dive, waveProgressRef } = useOceanScroll();
  const { navbar, activeSection } = useScrollNavigation(journey);
  const [paused, setPaused] = useState(true);
  const [sceneOnly, setSceneOnly] = useState(false);
  const isNightSaved = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [nightOverride, setNightOverride] = useState(null);
  const night = nightOverride ?? isNightSaved;
  const [panel, setPanel] = useState(null);
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false);
  const [hoverNav, setHoverNav] = useState(null);
  const [focusNav, setFocusNav] = useState(null);
  const openPanel = (next) => {
    setPanel(next);
  };
  const activeId = panel === "contact" ? "contact" : activeSection;
  const highlight = hoverNav ?? focusNav ?? navigation.findIndex(item => item.id === activeId);
  const lenisRef = useRef(null);

  const scrollToSection = (event, id) => {
    event.preventDefault();
    setPanel(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (id === "home") window.scrollTo({ top: 0, behavior: "instant" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    if (lenisRef.current) {
      if (id === "home") {
        lenisRef.current.scrollTo(0, { duration: 1.2 });
      } else {
        const target = document.getElementById(id);
        if (target) lenisRef.current.scrollTo(target, { duration: 1.2 });
      }
    } else {
      if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  const dialog = useRef(null);
  const foregroundCanvasRef = useRef(null);

  const toggleTheme = () => {
    const next = !night;
    setNightOverride(next);
    try { localStorage.setItem("portfolio-theme", next ? "night" : "day"); }
    catch { /* Saving a preference is optional. */ }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Direct synchronization between Lenis and GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    // Disable GSAP lagSmoothing so animations do not drag or fall behind scroll input
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setPaused(preference.matches);
    motion();
    preference.addEventListener("change", motion);
    return () => { preference.removeEventListener("change", motion); };
  }, []);
  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);

  return <main className={`portfolio-page ${night ? "theme-night" : "theme-day"}`}>
    <header className="top-nav persistent-nav" ref={navbar}>
      <a className="wordmark" href="#home" aria-label={`${profile.name}, home`} onClick={event => scrollToSection(event, "home")}>
        <span className="logo-slot" aria-hidden="true">{profile.logo ? <img src={profile.logo} alt="" /> : <span>Logo</span>}</span>
        <span className="nav-name">{profile.name}</span>
      </a>
      <nav className="nav-links" aria-label="Main navigation" onMouseLeave={() => setHoverNav(null)}>
        <span className="nav-highlight" aria-hidden="true" style={{ transform: `translateX(${Math.max(0, highlight) * 100}%)`, opacity: highlight < 0 ? 0 : 1 }} />
        {navigation.map((item, index) => <a key={item.id}
          href={item.id === "contact" ? "#portfolio-panel" : `#${item.id}`}
          className={`${highlight === index ? "nav-item is-highlighted" : "nav-item"}${hoverNav === index ? " is-hovered" : ""}`}
          aria-label={item.label} aria-current={activeId === item.id && item.id !== "contact" ? "location" : undefined}
          aria-haspopup={item.id === "contact" ? "dialog" : undefined}
          aria-expanded={item.id === "contact" ? panel === "contact" : undefined}
          aria-controls={item.id === "contact" ? "portfolio-panel" : item.id}
          onMouseEnter={() => setHoverNav(index)} onFocus={event => setFocusNav(event.currentTarget.matches(":focus-visible") ? index : null)} onBlur={() => setFocusNav(null)}
          onClick={event => { if (item.id === "contact") { event.preventDefault(); openPanel("contact"); } else scrollToSection(event, item.id); }}>
          <span className="nav-text-window" aria-hidden="true"><span className="nav-text-roll"><span>{item.label}</span><span>{item.label}</span></span></span>
        </a>)}
      </nav>
      <div className="nav-socials" role="group" aria-label="Social media and credentials">
        <button
          type="button"
          className="nav-resume-btn"
          onClick={() => setResumeDrawerOpen(true)}
          aria-label="Open résumé drawer"
          aria-haspopup="dialog"
          aria-expanded={resumeDrawerOpen}
        >
          <FileText size={14} className="nav-resume-icon" aria-hidden="true" />
          <span>Resumé</span>
        </button>
        {([{ name: "GitHub", icon: "github", url: profile.github }, { name: "LinkedIn", icon: "linkedin", url: profile.linkedin }]).map(social => social.url
          ? <a className="social-icon" key={social.icon} href={social.url} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></a>
          : <button className="social-icon" key={social.icon} disabled aria-label={`${social.name} — coming soon`} title={`${social.name} — coming soon`}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></button>)}
      </div>
    </header>
    <div className="ocean-journey" id="home" ref={journey}>
      <div className={`wave-portfolio ${sceneOnly ? "scene-only" : ""} ${night ? "theme-night" : "theme-day"}`}>
        <WaveScene paused={paused || panel !== null || submerged} night={night} waveProgressRef={waveProgressRef} foregroundCanvasRef={foregroundCanvasRef} />
        <div className="portfolio-overlay" inert={sceneOnly || submerged}>
          <section className="intro hero-brand-section" aria-label="Personal Introduction">
            <div className="hero-brand-card">
              <div className="hero-status-pill">
                <span className="hero-status-dot" aria-hidden="true" />
                <span>Open to Work</span>
              </div>

              <h1 className="hero-name-title">
                <span className="hero-name-text">{profile.name}</span>
              </h1>

              <div className="hero-role-block">
                <p className="hero-role-main">
                  Software Developer
                </p>
                <p className="hero-role-sub">
                  Engineering high-resilience <span className="hero-highlight">Enterprise Automation</span> and reactive <span className="hero-highlight">Modern Web</span> architectures.
                </p>
              </div>

              <div className="hero-brand-tags" aria-label="Core Competencies">
                <span className="hero-brand-pill">Windows Telemetry</span>
                <span className="hero-brand-pill">Python Engines</span>
                <span className="hero-brand-pill"> Full-Stack</span>
                <span className="hero-brand-pill">Perforce Engineering</span>
              </div>

              <div className="hero-brand-actions">
                <a className="hero-dive-cta" href="#ocean-depth" onClick={dive} style={{ animationPlayState: paused ? "paused" : "running" }}>
                  <span>Explore Narrative &amp; Work</span>
                  <ArrowDown className="hero-dive-icon" size={18} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>

          <footer className="bottom-bar"><p>Made with 💙 by {profile.name}</p></footer>
        </div>
        <canvas ref={foregroundCanvasRef} className="wave-scene-foreground" aria-hidden="true" />

        <div className="scene-controls" style={{ opacity: "var(--controls-opacity, 1)", pointerEvents: "var(--controls-pointer, auto)", transition: "opacity 0.2s ease-out" }}><button className="theme-toggle" onClick={toggleTheme} aria-label="Night mode" aria-pressed={night}>{night ? <Sun size={13} /> : <Moon size={13} />}<span>{night ? "Day scene" : "Night scene"}</span></button><span /><button onClick={() => setSceneOnly(!sceneOnly)} aria-pressed={sceneOnly}>{sceneOnly ? "Show portfolio" : "View scene only"}</button><span /> <button className="motion-button" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button></div>

        <dialog id="portfolio-panel" ref={dialog} className="info-panel" aria-labelledby="panel-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}>
          <div className="panel-content"><button className="close-panel" aria-label="Close panel" onClick={() => setPanel(null)}><X size={23} strokeWidth={1.4} /></button>
            {panel === "contact" && <><p className="panel-label">LET’S CONNECT</p><h2 id="panel-title">Something in mind?</h2><p className="panel-intro">A project, a collaboration, or a good conversation. Every great thing starts with hello.</p>{profile.email ? <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} ↗</a> : <p className="contact-placeholder">Your email goes here.<small>Contact details will be added later.</small></p>}</>}
          </div>
        </dialog>
        <div className="ocean-water" aria-hidden="true">
          <div className="ocean-wave">
            <div className="ocean-crest"><img src="/ocean-wave-hd.png" alt="" width="2076" height="757" decoding="async" /></div>
            <div className="ocean-extension" />
          </div>
        </div>
        <SubmergedNarrative />
      </div>
      <div id="ocean-depth" className="ocean-depth-target" aria-hidden="true" />
    </div>
    <PortfolioSections />
    <DeepSeaFish submerged={submerged} paused={paused} />
    <ResumeDrawer isOpen={resumeDrawerOpen} onClose={() => setResumeDrawerOpen(false)} night={night} />
  </main>;
}