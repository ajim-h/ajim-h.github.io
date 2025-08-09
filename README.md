# Static Personal Site (GitHub Pages) — Single JSON editing, no build

This repository is a production-ready static personal site built for GitHub Pages. All visible content is read from `content.json` — **no build step, no frameworks**.

## Files

- `index.html` — Semantic HTML scaffold.
- `styles.css` — Mobile-first styles, CSS variables for quick theme edits, print stylesheet.
- `scripts.js` — Vanilla JS: fetches `content.json`, renders the content, micro-interactions (fade-in on scroll, collapsibles, search & highlight).
- `content.json` — **Single source of truth**. Edit this file to change site content.
- `assets/` — Placeholder images (SVGs). Replace with optimized images.

## How to edit content

1. Open `content.json` and update fields under `site` and `sections`.
2. `site.navOrder` controls the order of sections and nav entries.
3. For images, place optimized files into `assets/` and update the path in `content.json`.

**Important:** `content.json` must be valid JSON. Use a linter or the GitHub editor preview to avoid syntax errors.

## Replace images

- Replace files in `assets/` with your images (SVG, WebP, JPEG).
- Prefer vector (SVG) for logos and icons; use compressed WebP/JPEG for photos.
- Filenames referenced in `content.json` must match those in the `assets/` folder.

## Publish on GitHub Pages

1. Create a GitHub repository and push these files to the root of the default branch (e.g., `main`).
2. On GitHub: **Settings → Pages** (or Settings → Pages & Deployments).
3. Under "Build and deployment": choose the branch (`main`) and folder `/ (root)` then save.
4. Your site will be available at `https://<username>.github.io/<repo>/` (or `https://<username>.github.io` for a user site).
5. Wait a minute and visit the URL; if content doesn't load, check the browser console for JSON fetch errors.

## Contact form (optional — Formspree)

To enable the static contact form:
1. Sign up on [Formspree](https://formspree.io/) to get a form `action` URL.
2. In `content.json`, under `sections.contact.form` set:
   - `"enabled": true`
   - `"action": "https://formspree.io/f/your-id"`
3. The form will POST to Formspree and send email per their service.

## Accessibility & Performance

- Semantic HTML (header, main, section, footer).
- Skip link, visible focus outlines, ARIA attributes on toggles.
- `prefers-reduced-motion` respected.
- Minimal external requests: only Google Fonts.

## Quick tips

- To change color theme, edit CSS variables at the top of `styles.css`.
- To add a new section:
  1. Add a new key under `sections` in `content.json`.
  2. Add the key to `site.navOrder` (to control order).
  3. If the section uses a custom structure, you can extend `renderSection()` in `scripts.js`.

---

If you'd like, I can:
- Convert your real CV into `content.json` ready to drop in.
- Add dark-mode toggle using the same JSON-driven approach.
- Add PDF download of the printable resume generated serverless (client-side).

Which one would you like next?
