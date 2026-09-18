"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, X } from "lucide-react";
import WaveScene from "./wave-scene";
import { profile, projects } from "./content";

type Panel = "projects" | "about" | "contact" | null;

export default function Portfolio() {
  const [paused, setPaused] = useState(true);
  const [sceneOnly, setSceneOnly] = useState(false);
  const [time, setTime] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setPaused(preference.matches);
    motion();
    preference.addEventListener("change", motion);
    const clock = () => setTime(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZoneName: "short" }).format(new Date()));
    clock();
    const interval = window.setInterval(clock, 30_000);
    return () => { preference.removeEventListener("change", motion); window.clearInterval(interval); };
  }, []);
  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);

  return <main className={`wave-portfolio ${sceneOnly ? "scene-only" : ""}`}>
    <WaveScene paused={paused || panel !== null} />
    <div className="portfolio-overlay" inert={sceneOnly}>
      <header className="top-nav">
        <a className="wordmark" href="#" aria-label="Home" onClick={event => { event.preventDefault(); setPanel(null); }}>{profile.wordmark}</a>
        <nav className="nav-links" aria-label="Main navigation"><button onClick={() => setPanel("projects")}>Projects</button><button onClick={() => setPanel("about")}>About</button><button onClick={() => setPanel("contact")}>Contact</button></nav>
        <div className="nav-socials">{profile.github ? <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a> : <span title="Add your GitHub link later">GitHub <small>soon</small></span>}{profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a> : <span title="Add your LinkedIn link later">LinkedIn <small>soon</small></span>}</div>
        <time className="local-time" aria-label="Your local time">{time}</time>
      </header>

      <section className="intro" aria-label="Introduction"><h1>{profile.name} is a full-stack developer building thoughtful interfaces and the systems behind them. <span>Working with React, Python, and the MERN stack — with curiosity at the heart of every project.</span></h1></section>

      <footer className="bottom-bar"><p>React · Python · MERN</p><button className="arrow-link" onClick={() => setPanel("projects")}>Explore my projects <ArrowRight size={18} strokeWidth={1.3} /></button><button className="arrow-link" onClick={() => setPanel("contact")}>Contact me <ArrowRight size={18} strokeWidth={1.3} /></button></footer>
    </div>

    <div className="scene-controls"><button onClick={() => setSceneOnly(!sceneOnly)} aria-pressed={sceneOnly}>{sceneOnly ? "Show portfolio" : "View scene only"}</button><span /> <button className="motion-button" aria-label={paused ? "Play animation" : "Pause animation"} onClick={() => setPaused(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}</button></div>

    <dialog ref={dialog} className="info-panel" aria-labelledby="panel-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}>
      <div className="panel-content"><button className="close-panel" aria-label="Close panel" onClick={() => setPanel(null)}><X size={23} strokeWidth={1.4} /></button>
        {panel === "projects" && <><p className="panel-label">SELECTED WORK</p><h2 id="panel-title">Projects, coming soon.</h2><p className="panel-intro">This space is ready for your work. Add your projects when you’re ready.</p><div className="project-list">{projects.map(project => <article key={project.id}><span>{project.id}</span><div><h3>{project.placeholder ? `${project.category} project` : project.title}</h3><p>{project.stack.join(" / ")}</p>{!project.placeholder && <p>{project.description}</p>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">View project ↗</a>}</div><small>{project.placeholder ? "Coming soon" : ""}</small></article>)}</div></>}
        {panel === "about" && <><p className="panel-label">A LITTLE ABOUT ME</p><h2 id="panel-title">Curiosity, then code.</h2><p className="panel-intro">{profile.about}</p><p className="panel-intro">{profile.aboutMore}</p>{profile.resume && <a className="arrow-link" href={profile.resume} download>Download résumé <ArrowRight size={18} /></a>}</>}
        {panel === "contact" && <><p className="panel-label">LET’S CONNECT</p><h2 id="panel-title">Something in mind?</h2><p className="panel-intro">A project, a collaboration, or a good conversation. Every great thing starts with hello.</p>{profile.email ? <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} ↗</a> : <p className="contact-placeholder">Your email goes here.<small>Contact details will be added later.</small></p>}</>}
      </div>
    </dialog>
  </main>;
}
