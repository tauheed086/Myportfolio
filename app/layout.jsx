import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { profile } from "./content";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export async function generateMetadata() {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host");
    const origin = host ? `${host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"}://${host}` : profile.siteUrl;
    const title = `${profile.name} — Creative Web Developer`;
    const description = "Interactive interfaces, real-time 3D experiments, and considered engineering. Explore the projects and process behind the work.";
    return { title, description, ...(profile.siteUrl ? { alternates: { canonical: profile.siteUrl } } : {}), robots: { index: profile.name !== "Your Name", follow: true }, openGraph: { title, description, type: "website", images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "Interfaces you can feel — The Interactive Workshop" }] }, twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] } };
}
export default function RootLayout({ children, }) {
    return (<html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        {profile.name !== "Your Name" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.role, url: profile.siteUrl, sameAs: [profile.github, profile.linkedin].filter(Boolean) }).replace(/</g, "\\u003c") }} />}
      </body>
    </html>);
}
