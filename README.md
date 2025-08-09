# JSON-driven Multi-page Portfolio (no build)

This repo is a static, multi-page portfolio built for GitHub Pages. All visible content is stored in `content.json` — edit only that file to update text, images, links, and section order.

## Files (root)
- `index.html` — Home
- `education.html` — Education
- `research.html` — Research
- `projects.html` — Projects
- `testscores.html` — Test scores
- `hobbies.html` — Hobbies (travelling/misc)
- `contact.html` — Contact
- `styles.css` — Shared stylesheet
- `scripts.js` — Shared JS (loads `content.json`, renders pages)
- `content.json` — Single source of content (edit this)
- `assets/` — images and icons

## Quick start (upload to GitHub)
1. Create a GitHub repository (public).
2. Upload all files/folders to the repo root.
3. In GitHub: Settings → Pages → Source: choose `main` branch, folder `/ (root)`, Save.
4. Wait ~1 minute, visit `https://<username>.github.io/<repo>/`.

## Edit site content
- Open `content.json` in the repo and change text/images.
- Save & commit. Site updates automatically.

## Replace images
- Place optimized images in `assets/` and update the relevant path in `content.json`.
- Recommended: SVG for logos/icons; compressed WebP/JPEG for photos.

## Enable contact form
- Sign up for Formspree to get an action URL.
- In `content.json` set `sections.contact.form.enabled` to `true` and the `action` to your Formspree URL.

## Local testing
Because the site uses `fetch('content.json')`, open it via a local HTTP server:
- Python 3: `python3 -m http.server 8000` then open `http://localhost:8000`.

## Notes
- All edits should go into `content.json` only.
- Colors, spacing, and fonts are configured in `styles.css` via CSS variables.
- If you want a PDF resume export or extra pages, I can add them.

If you'd like, I can now:
- Fill `content.json` with your real CV details (send them here), or
- Walk you through uploading files to GitHub step-by-step.
