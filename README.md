# 3D developer portfolio

A minimal, full-screen React portfolio with a pale Three.js cube field, pointer-driven ripples, subtle blue shading and RGB edge separation. The camera looks almost straight down onto tightly spaced columns. A simple text overlay follows the visual direction of the supplied reference.

## Personalize

Edit `app/content.ts` to update your name, bio, email, social URLs, résumé, and project data. The Projects panel currently contains clearly labeled placeholders. Set `placeholder: false`, replace a project's title and description, and add `liveUrl` when ready. The longer case-study fields are retained for a future expansion.

Put your résumé in `public/resume.pdf` and set `profile.resume` to `/resume.pdf`. Empty contact and social values render honest placeholders instead of inactive links.

`app/globals.css` contains the colors and responsive overlay. `app/wave-scene.tsx` controls the 3D scene. Move the pointer or tap to send ripples through the grid; gentle ripples appear when idle. Motion follows the system preference and can be paused at the bottom right. “View scene only” hides the overlay. A CSS grid remains visible if WebGL is unavailable. Navigation opens keyboard-accessible panels without leaving the scene.

## Run

Install dependencies with `npm ci`, then run `npm run dev`. Build with `npm run build`.

The starter uses React, TypeScript, vinext, and Vite, with a Cloudflare-compatible Sites build. It is a portfolio frontend; Python is represented as a skill, and no backend service is needed for the template.
