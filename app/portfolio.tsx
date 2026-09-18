"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown, ArrowRight, ArrowUp, Code2, Braces, Database, GitFork as Github, ContactRound as Linkedin, Mail, Menu, X, Pause, Play, Sparkles, Layers, Terminal, ExternalLink, FileDown } from "lucide-react";
import WaveScene from "./wave-scene";
import { profile, projects, type Project } from "./content";

function ProjectVisual({ variant }: { variant: Project["visual"] }) {
  return <div className={`project-art ${variant}`} aria-hidden="true">
    <div className="art-grid" />
    {variant === "dashboard" ? <div className="mini-dashboard">
      <div className="mini-sidebar"><span className="mini-logo"><Layers size={16} /> workspace</span><i /><i /><i /><i /><span className="mini-avatar">Y</span></div>
      <div className="mini-main"><div className="mini-top"><span>Overview</span><span>↗</span></div><div className="mini-stats"><div><small>ACTIVITY</small><b>At a glance</b><em>Everything in one place</em></div><div className="mini-ring" /></div><div className="mini-chart">{[28, 43, 37, 59, 48, 72, 65, 86, 74, 96, 82, 110].map((height, i) => <i key={i} style={{ height }} />)}</div><div className="mini-bottom"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div></div>
    </div> : variant === "terminal" ? <div className="mini-terminal"><div className="terminal-top"><span><i /><i /><i /></span><small>app / main.py</small><Terminal size={13} /></div><div className="terminal-code"><p><span>01</span><i>from</i> fastapi <i>import</i> FastAPI</p><p><span>02</span></p><p><span>03</span>app = <b>FastAPI</b>()</p><p><span>04</span></p><p><span>05</span><em>@app.get</em>(<strong>"/possibilities"</strong>)</p><p><span>06</span><i>async def</i> <b>build_something</b>():</p><p><span>07</span>    <i>return</i> {"{"}<strong>"status"</strong>: <strong>"ready"</strong>{"}"}</p></div><div className="terminal-status"><span className="dot" /> Ready for your next idea <span>Python</span></div></div>
    : <div className="architecture"><div className="architecture-node"><Code2 /><span>React</span><small>THE EXPERIENCE</small></div><span className="connector"><i />HTTP</span><div className="architecture-node central"><Braces /><span>Node.js</span><small>THE LOGIC</small></div><span className="connector"><i />DATA</span><div className="architecture-node"><Database /><span>MongoDB</span><small>THE FOUNDATION</small></div></div>}
    <span className="visual-caption">ILLUSTRATIVE PREVIEW</span>
  </div>;
}

export default function Portfolio() {
  const [filter, setFilter] = useState("All work");
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [paused, setPaused] = useState(true);
  const [burst, setBurst] = useState(0);
  const [selected, setSelected] = useState<Project | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(media.matches);
    const onChange = () => setPaused(media.matches);
    media.addEventListener("change", onChange);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: "-20% 0px -50% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach(section => observer.observe(section));
    return () => { media.removeEventListener("change", onChange); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (selected) { dialog.current?.showModal(); document.body.style.overflow = "hidden"; }
    else { dialog.current?.close(); document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);
  const visibleProjects = projects.filter(project => filter === "All work" || project.category === filter);

  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Home"><span className="brand-symbol"><Braces size={19} /></span>{profile.wordmark}<span className="brand-dot">.</span></a>
      <nav id="main-navigation" className={menuOpen ? "navigation open" : "navigation"} aria-label="Main navigation">
        {[["work", "Work"], ["about", "About"], ["stack", "Stack"]].map(([id, title]) => <a href={`#${id}`} key={id} className={active === id ? "active" : ""} aria-current={active === id ? "location" : undefined} onClick={() => setMenuOpen(false)}>{title}</a>)}
        <a href="#contact" className="nav-contact" onClick={() => setMenuOpen(false)}>Let’s talk <ArrowUpRight size={15} /></a>
      </nav>
      <button className="menu-toggle icon-button" aria-controls="main-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    <main id="main">
      <section id="home" className="hero">
        <div className="hero-topline mono"><span><span className="dot" /> FULL-STACK DEVELOPER</span><span>INDEPENDENT MIND. CONNECTED SYSTEMS.</span></div>
        <div className="hero-content"><div className="hero-copy">
          <p className="hello">Hello, I’m <span>{profile.name}</span> <span className="small-cross">✳</span></p>
          <h1>Ideas into<br />interfaces.<br /><span>And beyond.</span></h1>
          <p className="hero-description">{profile.intro}</p>
          <div className="hero-actions"><a href="#work" className="button primary">Explore my work <ArrowDown size={16} /></a><a href="#about" className="text-link">A little about me <ArrowUpRight size={16} /></a></div>
        </div><div className="hero-visual"><div className="scene-halo" /><WaveScene paused={paused} burst={burst} /><div className="scene-caption mono"><span className="crosshair">+</span> IDEAS, TAKING SHAPE.</div></div></div>
        <div className="hero-bottom"><a href="#work" className="scroll-cue mono"><span className="scroll-line" /> SCROLL TO EXPLORE</a><div className="scene-controls"><span className="mono scene-label">01 / WAVE FIELD</span><button className="icon-button" aria-label={paused ? "Play 3D animation" : "Pause 3D animation"} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={14} /> : <Pause size={14} />}</button><button className="ripple-button" disabled={paused} onClick={() => setBurst(burst + 1)}><Sparkles size={13} /> Make a wave</button></div></div>
      </section>
      <div className="stack-strip"><span className="mono">FROM CLIENT TO SERVER</span><div><span>React</span><i>+</i><span>Python</span><i>+</i><span>Node.js</span><i>+</i><span>MongoDB</span><i>+</i><span>Express</span></div><span className="strip-end">One connected experience <ArrowUpRight size={14} /></span></div>

      <section id="work" className="section work-section">
        <div className="section-heading"><div><p className="eyebrow"><span>01 /</span> SELECTED WORK</p><h2>Built to solve.<br /><span>Designed to feel.</span></h2></div><p className="section-intro">A closer look at the interfaces, systems,<br className="desktop-break" /> and ideas I bring together.</p></div>
        <div className="work-toolbar"><div className="filters" role="group" aria-label="Filter projects">{["All work", "React", "Python", "MERN"].map(item => <button key={item} aria-pressed={filter === item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}{item === "All work" && <span>{String(projects.length).padStart(2, "0")}</span>}</button>)}</div>{projects.some(project => project.placeholder) && <span className="template-note"><span className="dot" /> Project placeholders</span>}</div>
        <div className="project-grid" aria-live="polite">{visibleProjects.map(project => <article className={`project-card project-${project.visual}`} key={project.id}>
          <button className="project-open" onClick={() => setSelected(project)} aria-label={`View ${project.placeholder ? "placeholder for " : ""}${project.title}`}>
            {project.image ? <div className="project-art"><img src={project.image} alt={`${project.title} preview`} /></div> : <ProjectVisual variant={project.visual} />}
            <div className="project-text"><div className="project-kicker mono"><span>{project.id} / {project.type}</span><span>{project.placeholder ? "YOUR PROJECT HERE" : "CASE STUDY"}</span></div><div className="project-title"><h3>{project.title}</h3><span className="project-arrow"><ArrowUpRight size={22} /></span></div><p>{project.description}</p><div className="tags">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div></div>
          </button>
        </article>)}</div>
        <div className="work-footer"><span>Good work starts with a good problem.</span><a href="#contact" className="text-link">Have one in mind? <ArrowUpRight size={15} /></a></div>
      </section>

      <section id="about" className="section about-section">
        <div><p className="eyebrow"><span>02 /</span> THE PERSON BEHIND THE CODE</p><h2>Curious by nature.<br /><span>Builder by choice.</span></h2><div className="about-copy"><p>{profile.about}</p><p>{profile.aboutMore}</p></div>{profile.resume ? <a className="text-link" href={profile.resume} download>Download résumé <FileDown size={16} /></a> : <span className="subtle-label">YOUR STORY GOES HERE — MAKE IT YOUR OWN</span>}</div>
        <div className="about-card"><div className="about-card-header"><span className="mono">README.md</span><Code2 size={18} /></div><div className="about-monogram"><span>{"{ "}</span>you<span>{" }"}</span><i /></div><div className="about-card-footer"><div><h3>{profile.name}</h3><p>{profile.role}</p></div><span className="blue-badge">Always building <span>↗</span></span></div><div className="about-interests"><span>Thoughtful UI</span><span>Useful systems</span><span>Endless curiosity</span></div></div>
      </section>

      <section id="stack" className="section stack-section"><div className="section-heading"><div><p className="eyebrow"><span>03 /</span> MY TOOLKIT</p><h2>The right tools.<br /><span>The whole picture.</span></h2></div><p className="section-intro">From the first component to the final endpoint.<br />A stack that connects both sides.</p></div><div className="skill-grid">{[
        { icon: Code2, n: "01", title: "The interface", sub: "WHAT YOU SEE & FEEL", tags: ["React", "JavaScript", "HTML & CSS"], text: "Responsive interfaces, reusable components, and interactions that feel natural." },
        { icon: Terminal, n: "02", title: "The logic", sub: "WHAT MAKES IT WORK", tags: ["Python", "Node.js", "Express"], text: "APIs and application logic that turn a polished frontend into a working product." },
        { icon: Database, n: "03", title: "The connection", sub: "WHAT BRINGS IT TOGETHER", tags: ["MongoDB", "REST APIs", "Git"], text: "Data, integrations, and workflows that connect each part of the application." },
      ].map(skill => <div className="skill-card" key={skill.n}><div className="skill-top"><skill.icon size={25} strokeWidth={1.5} /><span className="mono">/{skill.n}</span></div><p className="mono skill-subtitle">{skill.sub}</p><h3>{skill.title}</h3><p className="skill-description">{skill.text}</p><div className="tags">{skill.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>)}</div></section>

      <section id="contact" className="section contact-section"><div className="contact-orbit" aria-hidden="true" /><p className="eyebrow"><span>04 /</span> NEXT CHAPTER</p><div className="contact-layout"><h2>Something in mind?<br /><span>Let’s build it.</span><span className="contact-asterisk" aria-hidden="true">✳</span></h2><div className="contact-aside"><p>A project, a collaboration, or a good conversation.<br />Every great thing starts with hello.</p>{profile.email ? <a className="button primary" href={`mailto:${profile.email}`}>Say hello <ArrowUpRight size={18} /></a> : <div className="contact-placeholder"><Mail size={17} /><span>Your email goes here<small>Contact details coming soon</small></span></div>}</div></div><div className="contact-bottom"><span className="mono">LET’S CONNECT THE DOTS.</span><div className="social-links">{[{ label: "GitHub", url: profile.github, icon: Github }, { label: "LinkedIn", url: profile.linkedin, icon: Linkedin }].map(social => social.url ? <a key={social.label} href={social.url} target="_blank" rel="noreferrer"><social.icon size={15} />{social.label}<ArrowUpRight size={13} /></a> : <span key={social.label} title={`${social.label} profile will be added later`}><social.icon size={15} />{social.label}<small>soon</small></span>)}</div></div></section>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {profile.name}</span><span>Thoughtfully built. Always evolving.</span><a href="#home">Back to top <ArrowUp size={14} /></a></footer>

    <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" onCancel={() => setSelected(null)} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>
      {selected && <div className="dialog-inner"><div className="dialog-heading"><span className="eyebrow">{selected.placeholder ? "CASE STUDY TEMPLATE" : "CASE STUDY"} / {selected.id}</span><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close project"><X size={22} /></button></div><h2 id="project-dialog-title">{selected.title}</h2><div className="tags">{selected.stack.map(tag => <span key={tag}>{tag}</span>)}</div>{selected.placeholder && <p className="dialog-notice">This is a placeholder for your future project. The preview is illustrative; replace it with your own work when you’re ready.</p>}{selected.image ? <div className="project-art"><img src={selected.image} alt={`${selected.title} preview`} /></div> : <ProjectVisual variant={selected.visual} />}<div className="case-study">{[["The problem", selected.problem], ["The approach", selected.approach], ["The outcome", selected.outcome]].map(([title, copy], index) => <div key={title}><span className="mono">0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div><div className="dialog-actions">{selected.liveUrl && <a className="button primary" href={selected.liveUrl} target="_blank" rel="noreferrer">Live project <ExternalLink size={16} /></a>}{selected.githubUrl && <a className="button secondary" href={selected.githubUrl} target="_blank" rel="noreferrer">Source code <Github size={16} /></a>}<button className="text-link" onClick={() => setSelected(null)}>Back to work <ArrowRight size={15} /></button></div></div>}
    </dialog>
  </>;
}
