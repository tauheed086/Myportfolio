"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown, Moon, Sun, Pause, Play, X } from "lucide-react";
import WaveScene from "./wave-scene";
import useOceanScroll from "./use-ocean-scroll";
import useScrollNavigation from "./use-scroll-navigation";
import PortfolioSections from "./portfolio-sections";
import DeepSeaFish from "./deep-sea-fish";
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
  const { journey, submerged, dive } = useOceanScroll();
  const { navbar, activeSection } = useScrollNavigation(journey);
  const [paused, setPaused] = useState(true);
  const [sceneOnly, setSceneOnly] = useState(false);
  const isNightSaved = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [nightOverride, setNightOverride] = useState(null);
  const night = nightOverride ?? isNightSaved;
  const [panel, setPanel] = useState(null);
  const [hoverNav, setHoverNav] = useState(null);
  const [focusNav, setFocusNav] = useState(null);
  const openPanel = (next) => {
    setPanel(next);
  };
  const activeId = panel === "contact" ? "contact" : activeSection;
  const highlight = hoverNav ?? focusNav ?? navigation.findIndex(item => item.id === activeId);
  const scrollToSection = (event, id) => {
    event.preventDefault();
    setPanel(null);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    if (id === "home") window.scrollTo({ top: 0, behavior });
    else document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
  };
  const dialog = useRef(null);

  const toggleTheme = () => {
    const next = !night;
    setNightOverride(next);
    try { localStorage.setItem("portfolio-theme", next ? "night" : "day"); }
    catch { /* Saving a preference is optional. */ }
  };

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
        <div className="nav-socials" role="group" aria-label="Social media">
          {([{ name: "GitHub", icon: "github", url: profile.github }, { name: "LinkedIn", icon: "linkedin", url: profile.linkedin }]).map(social => social.url
            ? <a className="social-icon" key={social.icon} href={social.url} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></a>
            : <button className="social-icon" key={social.icon} disabled aria-label={`${social.name} — coming soon`} title={`${social.name} — coming soon`}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></button>)}
        </div>
      </header>
    <div className="ocean-journey" id="home" ref={journey}>
    <div className={`wave-portfolio ${sceneOnly ? "scene-only" : ""} ${night ? "theme-night" : "theme-day"}`}>
    <WaveScene paused={paused || panel !== null || submerged} night={night} />
    <div className="portfolio-overlay" inert={sceneOnly || submerged}>
      <section className="intro" aria-label="Introduction">
        <p className="hero-kicker">{profile.heroKicker}</p>
        <div className="hero-headline-group">
          <h1 className="hero-title">
            {profile.heroTitle?.map((line, idx) => (
              <span key={idx} className="hero-title-line">{line.split(/(\(alive\))/).map((part, partIndex) => part === "(alive)" ? <span className="hero-code-accent" key={partIndex}>{part}</span> : part)}</span>
            ))}
          </h1>
        </div>
        <div className="hero-actions">
          <a className="dive-link" href="#ocean-depth" onClick={dive} style={{ animationPlayState: paused ? "paused" : "running" }}>
            <span>Let’s Dive In</span>
            <ArrowDown className="dive-arrow" size={28} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="bottom-bar"><p>React · Python · MERN</p></footer>
    </div>

    <div className="scene-controls" style={{ opacity: submerged ? 0 : 1, pointerEvents: submerged ? "none" : "auto", transition: "opacity 0.4s" }}><button className="theme-toggle" onClick={toggleTheme} aria-label="Night mode" aria-pressed={night}>{night ? <Sun size={13} /> : <Moon size={13} />}<span>{night ? "Day scene" : "Night scene"}</span></button><span /><button onClick={() => setSceneOnly(!sceneOnly)} aria-pressed={sceneOnly}>{sceneOnly ? "Show portfolio" : "View scene only"}</button><span /> <button className="motion-button" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button></div>

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
    </div>
    <div id="ocean-depth" className="ocean-depth-target" aria-hidden="true" />
    </div>
    <PortfolioSections />
    <DeepSeaFish submerged={submerged} paused={paused} />
  </main>;
}
