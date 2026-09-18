"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Moon, Sun, Pause, Play, X } from "lucide-react";
import WaveScene from "./wave-scene";
import { profile, projects } from "./content";

const navigation = [{ id: "about", label: "About" }, { id: "projects", label: "My Work" }, { id: "contact", label: "Contact Me" }] as const;

type Panel = "projects" | "about" | "contact" | null;

export default function Portfolio() {
  const [paused, setPaused] = useState(true);
  const [sceneOnly, setSceneOnly] = useState(false);
  const [night, setNight] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [activeNav, setActiveNav] = useState<number | null>(null);
  const [hoverNav, setHoverNav] = useState<number | null>(null);
  const openPanel = (next: Exclude<Panel, null>) => {
    setActiveNav(navigation.findIndex(item => item.id === next));
    setPanel(next);
  };
  const highlight = hoverNav ?? activeNav;
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try { setNight(localStorage.getItem("portfolio-theme") === "night"); }
    catch { /* The theme still works when browser storage is unavailable. */ }
  }, []);
  const toggleTheme = () => {
    const next = !night;
    setNight(next);
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

  return <main className={`wave-portfolio ${sceneOnly ? "scene-only" : ""} ${night ? "theme-night" : "theme-day"}`}>
    <WaveScene paused={paused || panel !== null} night={night} />
    <div className="portfolio-overlay" inert={sceneOnly}>
      <header className="top-nav">
        <a className="wordmark" href="#" aria-label={`${profile.name}, home`} onClick={event => { event.preventDefault(); setPanel(null); setActiveNav(null); }}>
          <span className="logo-slot" aria-hidden="true">{profile.logo ? <img src={profile.logo} alt="" /> : <span>Logo</span>}</span>
          <span className="nav-name">{profile.name}</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation" onMouseLeave={() => setHoverNav(null)}>
          <span className="nav-highlight" aria-hidden="true" style={{ transform: `translateX(${(highlight ?? 0) * 100}%)`, opacity: highlight === null ? 0 : 1 }} />
          {navigation.map((item, index) => <button key={item.id}
            className={highlight === index ? "nav-item is-highlighted" : "nav-item"}
            aria-label={item.label} aria-expanded={panel === item.id} aria-controls="portfolio-panel"
            onMouseEnter={() => setHoverNav(index)} onFocus={() => setHoverNav(index)} onBlur={() => setHoverNav(null)}
            onClick={() => openPanel(item.id)}>
            <span className="nav-text-window" aria-hidden="true"><span className="nav-text-roll"><span>{item.label}</span><span>{item.label}</span></span></span>
          </button>)}
        </nav>
        <div className="nav-socials" role="group" aria-label="Social media">
          {([{ name: "GitHub", icon: "github", url: profile.github }, { name: "LinkedIn", icon: "linkedin", url: profile.linkedin }]).map(social => social.url
            ? <a className="social-icon" key={social.icon} href={social.url} target="_blank" rel="noreferrer" aria-label={social.name} title={social.name}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></a>
            : <button className="social-icon" key={social.icon} disabled aria-label={`${social.name} — coming soon`} title={`${social.name} — coming soon`}><span className={`brand-icon brand-${social.icon}`} aria-hidden="true" /></button>)}
        </div>
      </header>

      <section className="intro" aria-label="Introduction"><h1>{profile.name} is a full-stack developer building thoughtful interfaces and the systems behind them. <span>Working with React, Python, and the MERN stack — with curiosity at the heart of every project.</span></h1></section>

      <footer className="bottom-bar"><p>React · Python · MERN</p><button className="arrow-link" onClick={() => openPanel("projects")}>Explore my projects <ArrowRight size={18} strokeWidth={1.3} /></button><button className="arrow-link" onClick={() => openPanel("contact")}>Contact me <ArrowRight size={18} strokeWidth={1.3} /></button></footer>
    </div>

    <div className="scene-controls"><button className="theme-toggle" onClick={toggleTheme} aria-label="Night mode" aria-pressed={night}>{night ? <Sun size={13} /> : <Moon size={13} />}<span>{night ? "Day scene" : "Night scene"}</span></button><span /><button onClick={() => setSceneOnly(!sceneOnly)} aria-pressed={sceneOnly}>{sceneOnly ? "Show portfolio" : "View scene only"}</button><span /> <button className="motion-button" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button></div>

    <dialog id="portfolio-panel" ref={dialog} className="info-panel" aria-labelledby="panel-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}>
      <div className="panel-content"><button className="close-panel" aria-label="Close panel" onClick={() => setPanel(null)}><X size={23} strokeWidth={1.4} /></button>
        {panel === "projects" && <><p className="panel-label">SELECTED WORK</p><h2 id="panel-title">Projects, coming soon.</h2><p className="panel-intro">This space is ready for your work. Add your projects when you’re ready.</p><div className="project-list">{projects.map(project => <article key={project.id}><span>{project.id}</span><div><h3>{project.placeholder ? `${project.category} project` : project.title}</h3><p>{project.stack.join(" / ")}</p>{!project.placeholder && <p>{project.description}</p>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">View project ↗</a>}</div><small>{project.placeholder ? "Coming soon" : ""}</small></article>)}</div></>}
        {panel === "about" && <><p className="panel-label">A LITTLE ABOUT ME</p><h2 id="panel-title">Curiosity, then code.</h2><p className="panel-intro">{profile.about}</p><p className="panel-intro">{profile.aboutMore}</p>{profile.resume && <a className="arrow-link" href={profile.resume} download>Download résumé <ArrowRight size={18} /></a>}</>}
        {panel === "contact" && <><p className="panel-label">LET’S CONNECT</p><h2 id="panel-title">Something in mind?</h2><p className="panel-intro">A project, a collaboration, or a good conversation. Every great thing starts with hello.</p>{profile.email ? <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} ↗</a> : <p className="contact-placeholder">Your email goes here.<small>Contact details will be added later.</small></p>}</>}
      </div>
    </dialog>
  </main>;
}
