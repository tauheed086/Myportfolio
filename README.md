# The Interactive Workshop

A JavaScript React portfolio with a Three.js hero, project case studies, an on-demand interactive lab, capability tabs, an experience/education timeline, and a contact form.

## Run

Use Node.js 22.13.0 or newer. Run `npm ci` on first setup, then `npm run dev` and open the Local URL printed in the terminal. `npm run build` builds the Cloudflare-compatible production output. `npm start` serves the production build.

## Personalize

Edit `app/content.js` for your name, role, social links, email, canonical site URL, projects, timeline, and achievements. Blank links are not rendered. The wave field is a working experiment; the other two projects and timeline entries are explicitly labeled placeholders. Replace these with real work and set `placeholder: false`.

Put your résumé in `public/resume.pdf` and set `profile.resume` to `/resume.pdf`. Add source/demo URLs to each project. Project details appear at `/projects/[slug]`. Update profile.siteUrl if you change the production domain. Pages with the default name or placeholder projects are intentionally marked noindex; real profile information enables homepage indexing. Sitemap entries exclude project placeholders. Private hosting is not discoverable by search engines.

The visual project covers are CSS compositions, not screenshots of claimed client projects. GitHub is linked when configured; contribution counts and achievements are not invented or fetched automatically. The social preview is `public/og.png`.

## Code map

- `app/portfolio.jsx`: page sections, menu, capability tabs, motion state, lab controls.
- `app/wave-scene.jsx`: instanced Three.js geometry, pointer/scroll response, shaders, cleanup.
- `components/Scene.jsx`: viewport-aware lazy loading and fallback.
- `components/ProjectCard.jsx`: project artwork and pointer tilt.
- `components/ContactForm.jsx`: accessible form and delivery states.
- `app/projects/[slug]/page.jsx`: server-rendered case studies and per-project metadata.
- `app/globals.css`: design tokens, layouts, native scroll reveals, reduced-motion rules.
- `app/layout.jsx`, `app/robots.js`, `app/sitemap.js`: metadata and discovery.
- `lib/contact.js`, `app/api/contact/route.js`: bounded request validation and server-side email delivery.

React components use JSX, supporting files use JavaScript, and editor aliases are in `jsconfig.json`. The existing build toolchain still includes TypeScript-related packages. CSS provides native scroll effects and transitions without an additional animation library.

## Contact delivery

Copy `.env.example` to `.env.local` for local configuration. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` using a verified Resend sender. Use hosted runtime secrets for deployment; never expose credentials through client variables or commit them. See https://resend.com/docs/api-reference/emails/send-email.

Until configured, the form returns HTTP 503 with a clear unavailable message. It never claims a message was delivered without a successful provider response. Requests are checked for same-origin submission, valid fields, maximum streamed body size, and honeypot content. A bounded, per-worker throttle is best effort; configure edge rate limiting before enabling delivery on a public site. No mail credentials are included and no real email was sent during automated tests.

## Validation and accessibility

`npm test` builds and checks server-rendered sections, case studies, missing routes, the sitemap, and contact validation/provider outcomes using mocked delivery. `npm run lint` checks source files without traversing unrelated backup folders.

Navigation has a skip link, focus indicators, mobile menu state, and Escape handling. Capability tabs support arrow keys, Home, and End. The scene observes reduced-motion preferences, can be paused, uses a smaller mobile grid, and stops expensive rendering when offscreen or in a hidden tab. The lab is mounted only after explicit launch. Text and links remain usable without WebGL. Performance scores, browser interaction testing, and real email delivery must be measured separately; automated server tests do not prove those outcomes.
