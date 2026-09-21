import { profile, projects } from "./content";

export default function PortfolioSections() {
  return <div className="ocean-content">
    <section id="about" data-nav-section aria-labelledby="about-title" className="depth-section">
      <div className="depth-section-inner">
        <p className="depth-eyebrow">01 / ABOUT</p>
        <h2 id="about-title">Curiosity, then code.</h2>
        <p className="depth-intro">{profile.about}</p>
        <p className="depth-description">{profile.aboutMore}</p>
        {profile.resume && <a className="depth-link" href={profile.resume} download>Download résumé ↗</a>}
      </div>
    </section>
    <section id="projects" data-nav-section aria-labelledby="projects-title" className="depth-section">
      <div className="depth-section-inner">
        <p className="depth-eyebrow">02 / PORTFOLIO</p>
        <h2 id="projects-title">{projects.every(project => project.placeholder) ? "Projects, coming soon." : "Selected work."}</h2>
        <div className="depth-projects">
          {projects.map(project => <article key={project.id}>
            <span className="depth-project-number">{project.id}</span>
            <div><h3>{project.placeholder ? `${project.category} project` : project.title}</h3>
              <p>{project.stack.join(" / ")}</p>
              {!project.placeholder && <p>{project.description}</p>}
              {project.liveUrl && <a className="depth-link" href={project.liveUrl} target="_blank" rel="noreferrer">View project ↗</a>}
            </div>
            {project.placeholder && <small>Coming soon</small>}
          </article>)}
        </div>
      </div>
    </section>
  </div>;
}
