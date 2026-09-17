import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, profile } from "../../content";
import { ProjectVisual } from "../../../components/ProjectCard";
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) return { title: "Project not found" };
  return { title: `${project.title} — ${profile.name}`, description: project.description, robots: project.placeholder ? { index: false, follow: true } : undefined, ...(profile.siteUrl ? { alternates: { canonical: `${profile.siteUrl}/projects/${slug}` } } : {}) };
}
export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return <main className="case-page"><Link className="case-back" href="/#work">← Back to selected work</Link><p className="eyebrow">{project.category} / {project.placeholder ? "PROJECT OUTLINE" : "CASE STUDY"}</p><h1>{project.title}</h1><p className="case-intro">{project.description}</p>{project.placeholder && <p className="placeholder-label">This is a project slot, not a claim of completed work.</p>}<ProjectVisual variant={project.visual} /><div className="case-details"><aside><p className="eyebrow">ROLE</p><p>{project.role}</p><div className="tags">{project.stack.map(item => <span key={item}>{item}</span>)}</div></aside><div>{[["The challenge", project.problem], ["The approach", project.approach], ["The result", project.outcome]].map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}<div className="case-actions">{project.liveUrl && <a className="button button-dark" href={project.liveUrl}>Try the live experiment ↗</a>}{project.githubUrl && <a className="button button-outline" href={project.githubUrl} target="_blank" rel="noreferrer">View source ↗</a>}<Link className="button button-outline" href="/#contact">Let’s work together ↗</Link></div></div></div></main>;
}
