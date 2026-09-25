import { profile, projects } from "./content";
import AboutTimeline from "./about-timeline";

export default function PortfolioSections() {
  return (
    <div className="ocean-content">
      {/* 01 // ABOUT - The Developer's Journey */}
      <section id="about" data-nav-section aria-labelledby="about-title" className="depth-section">
        <div className="depth-section-inner">
          <p className="depth-eyebrow">01 / ABOUT</p>
          <h2 id="about-title">Curiosity, then code.</h2>
          <p className="depth-intro">{profile.about}</p>
          <p className="depth-description">{profile.aboutMore}</p>
          {profile.resume && (
            <a className="depth-link" href={profile.resume} download>
              Download résumé ↗
            </a>
          )}

          {/* Scrollytelling Career & Education Timeline */}
          <AboutTimeline />
        </div>
      </section>

      {/* 02 // PORTFOLIO - Selected Work */}
      <section id="projects" data-nav-section aria-labelledby="projects-title" className="depth-section">
        <div className="depth-section-inner">
          <p className="depth-eyebrow">02 / PORTFOLIO</p>
          <h2 id="projects-title">Architected &amp; Shipped.</h2>
          <div className="depth-projects">
            {projects.map((project) => (
              <article key={project.id}>
                <span className="depth-project-number">{project.id}</span>
                <div>
                  <h3>
                    {project.title}
                    {project.subtitle && (
                      <span style={{ display: "block", fontSize: "14px", color: "#6ed3df", fontWeight: "400", marginTop: "4px", letterSpacing: "0.02em" }}>
                        {project.subtitle}
                      </span>
                    )}
                  </h3>
                  <p style={{ color: "#7dc5d4", fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em", marginTop: "8px" }}>
                    {project.stack.join(" · ")}
                  </p>
                  <p style={{ marginTop: "12px", lineHeight: "1.7" }}>{project.description}</p>
                  {project.liveUrl && (
                    <a className="depth-link" href={project.liveUrl} target="_blank" rel="noreferrer">
                      View project ↗
                    </a>
                  )}
                </div>
                {project.type && (
                  <small style={{ color: "#6ed3df", opacity: 0.8, letterSpacing: "0.1em", fontSize: "10px" }}>
                    {project.type}
                  </small>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
