# Ogeneo

A lightweight travel journal built with plain HTML, CSS, and JavaScript.

## Deploy

This repository is designed for Cloudflare Pages:

- Framework preset: None
- Build command: leave blank
- Build output directory: `/`

## Edit content

Travel cards live in `data/posts.json`.

Replace the sample Unsplash image links with Cloudinary URLs when ready.

## Local preview

Because the page loads JSON, preview it through a small local server rather than opening `index.html` directly.

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
