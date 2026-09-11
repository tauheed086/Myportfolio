# 3D developer portfolio

A responsive React portfolio with an interactive Three.js wave field, project filters, accessible case study dialogs, and reduced-motion support.

## Personalize

Edit `app/content.ts` to update your name, bio, email, social URLs, résumé, and projects. Project previews are explicitly marked placeholders. To feature real work, replace the copy, set `placeholder: false`, add `liveUrl` and `githubUrl`, and optionally set `image` to a screenshot under `public/` (for example `/projects/my-app.webp`).

Put your résumé in `public/resume.pdf` and set `profile.resume` to `/resume.pdf`. Empty contact and social values render honest placeholders instead of inactive links.

`app/globals.css` contains the colors and responsive layout. `app/wave-scene.tsx` controls the decorative 3D scene. Motion follows the system preference and can be paused using the control below the hero. A CSS illustration remains visible if WebGL is unavailable.

## Run

Install dependencies with `npm ci`, then run `npm run dev`. Build with `npm run build`.

The starter uses React, TypeScript, vinext, and Vite, with a Cloudflare-compatible Sites build. It is a portfolio frontend; Python is represented as a skill, and no backend service is needed for the template.
