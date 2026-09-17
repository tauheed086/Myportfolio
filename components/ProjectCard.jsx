"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function ProjectVisual({ variant }) {
  return <div className={`project-art art-${variant}`} aria-hidden="true">
    {variant === "wave" ? <div className="mini-wave">{Array.from({ length: 49 }, (_, i) => <i key={i} style={{ "--i": i, "--h": `${12 + Math.sin(i * .7) * 9}px` }} />)}</div>
      : variant === "interface" ? <div className="interface-demo"><div className="demo-sidebar"><b>◒</b><i /><i /><i /></div><div className="demo-body"><span>Overview</span><div className="demo-chart">{[25, 48, 35, 65, 55, 80, 69, 95].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="demo-lines"><i /><i /><i /></div></div></div>
      : <div className="system-demo"><span>interface</span><i /><div><span>API</span><span>logic</span></div><i /><span>database</span></div>}
  </div>;
}
export default function ProjectCard({ project, reduced }) {
  const reset = event => { event.currentTarget.style.setProperty("--rx", "0deg"); event.currentTarget.style.setProperty("--ry", "0deg"); };
  const tilt = event => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--rx", `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 6}deg`);
    event.currentTarget.style.setProperty("--ry", `${(event.clientX - rect.left - rect.width / 2) / rect.width * 6}deg`);
  };
  return <article className="project-card" onPointerMove={tilt} onPointerLeave={reset}>
    <Link className="project-image-link" href={`/projects/${project.slug}`} aria-label={`${project.title}: ${project.placeholder ? "project placeholder" : "read case study"}`}><ProjectVisual variant={project.visual} /><span className="project-badge">{project.placeholder ? "PROJECT SLOT" : "LIVE EXPERIMENT"}</span><span className="round-arrow"><ArrowUpRight size={20} /></span></Link>
    <div className="project-caption"><span className="eyebrow">{project.id} / {project.category}</span><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><div className="tags">{project.stack.map(item => <span key={item}>{item}</span>)}</div><div className="project-links"><Link href={`/projects/${project.slug}`}>{project.placeholder ? "View project outline" : "Read case study"} <ArrowUpRight size={14} /></Link>{project.liveUrl && <a href={project.liveUrl}>Live demo ↗</a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>}</div></div>
  </article>;
}
