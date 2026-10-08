import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tauheedmulla-dev.vercel.app";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tauheed Mulla — Software Developer & System Architect",
    template: "%s | Tauheed Mulla",
  },
  description:
    "Software Developer specializing in system automation, robust endpoint orchestration, and fluid modern web applications. Explore 3D interactive work, projects, and architecture.",
  keywords: [
    "Tauheed Mulla",
    "Software Developer",
    "Full-Stack Developer",
    "Python Developer",
    "React",
    "Next.js",
    "System Automation",
    "Windows Endpoint Telemetry",
    "Turf Hero",
    "Portfolio",
  ],
  authors: [{ name: "Tauheed Mulla", url: SITE_URL }],
  creator: "Tauheed Mulla",
  publisher: "Tauheed Mulla",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "Tauheed Mulla — Software Developer & System Architect",
    description:
      "Specializing in system automation, endpoint orchestration, and fluid modern web applications. Explore interactive 3D work and projects.",
    siteName: "Tauheed Mulla Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tauheed Mulla — Software Developer & System Architect",
      },
      {
        url: "/myportrait.webp",
        width: 941,
        height: 1672,
        alt: "Tauheed Mulla Portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tauheed Mulla — Software Developer & System Architect",
    description:
      "Specializing in system automation, endpoint orchestration, and fluid modern web applications.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-refined.webp",
    apple: "/logo-refined.png",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Tauheed Mulla",
      jobTitle: "Software Developer",
      url: SITE_URL,
      image: `${SITE_URL}/og-image.png`,
      email: "mailto:tauheedbldeacet@gmail.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Thane",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      sameAs: [
        "https://github.com/tauheed086",
        "https://www.linkedin.com/in/tauheedmulla",
      ],
      knowsAbout: [
        "Python",
        "Flask",
        "Django",
        "JavaScript",
        "React",
        "Next.js",
        "System Automation",
        "MySQL",
        "Three.js",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Tauheed Mulla Portfolio",
      description:
        "Software Developer specializing in system automation, endpoint orchestration, and fluid web applications.",
      publisher: {
        "@id": `${SITE_URL}/#person`,
      },
    },
  ],
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
