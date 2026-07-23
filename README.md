# OgeneO (V33)

A private-first visual journal built around Moments rather than albums.
Astro on Cloudflare Workers, D1 for data, Cloudinary for media.

## Stack

Site and API are one Cloudflare Worker (Astro server output). Data lives in
D1 (`db/schema.sql`), media in Cloudinary. The upload endpoint
`POST /api/upload` receives images from an iPhone Shortcut
(`docs/shortcut.md`), enriches them, and groups related Moments into
Experiences by time and distance.

## Pages

Home is the editorial feed: Moments (iPhone and Meta glasses, each with its
glyph), rolling thought cards, Experience features, Currently Wandering, an
"on this day" anniversary card and journey milestones. Also: `/map`,
`/experiences`, `/search`, and detail pages for Moments and Experiences.

## Deploy

```bash
./deploy.sh
```

That script logs into Cloudflare, creates the D1 database, applies the
schema, asks for your Cloudinary credentials, sets secrets and deploys.

## Local development

```bash
npm install
npm run db:migrate:local && npm run db:seed:local
npm run build && npx wrangler dev
```

Put dev secrets in `.dev.vars` (UPLOAD_SECRET, CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET).

## Design

Dark editorial theme: gold Cormorant Garamond wordmark, EB Garamond body,
Caveat for handwritten thought cards, burgundy active accents. Mobile shows
the bottom tab bar (Home, Map, Collections, Search); desktop moves nav into
the header. Seed images use Cloudinary's public demo cloud until your own
cloud is configured.
