import { profile, projects } from "./content";
export default function sitemap() {
  if (!profile.siteUrl) return [];
  return [{ url: profile.siteUrl, priority: 1 }, ...projects.filter(project => !project.placeholder).map(project => ({ url: `${profile.siteUrl}/projects/${project.slug}`, priority: .8 }))];
}
