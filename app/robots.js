import { profile } from "./content";
export default function robots() { return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, ...(profile.siteUrl ? { sitemap: `${profile.siteUrl}/sitemap.xml` } : {}) }; }
