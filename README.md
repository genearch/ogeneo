# Ogeneo travel v4

A mobile-first travel journal built with plain HTML, CSS, JavaScript, and JSON.

## Cloudflare Pages settings

- Framework preset: None
- Build command: leave blank
- Build output directory: /

## Updating posts

Edit `data/posts.json`.

Each image card supports these sizes:

- `hero`
- `wide`
- `medium`
- `tall`
- `small`

Photos currently use temporary Unsplash URLs. Replace them with your own Cloudinary URLs.

## Deploy

Upload the contents of this folder to the root of the GitHub repository. Cloudflare Pages will publish the commit automatically.


## Editorial focus

Ogeneo is strictly about travel and adventure. Moments should relate to places, movement, food, lodging, architecture, scenery, or the experience of being somewhere new.


v5: Updated PieCaken story for Yorkshire Thanksgiving.


v6: Curated homepage (9 featured moments), 'Recently' heading.


## v7

- Removed the duplicate hero location block.
- Added a subtle click-to-reveal current-location Easter egg.


## v8

- Connected the Currently Wandering Easter egg to the live Cloudflare Worker.
- Loads the latest location, note, timezone, and update timestamp from the iPhone Shortcut.
- Displays live local time and date for the published location.
- Includes a graceful fallback if the location service is unavailable.


## v9

- Redesigned the Currently Wandering popup.
- Smaller two-line location heading with country on its own line.
- Added a live mini map using the published latitude and longitude.
- Added a pushpin trigger and brighter text treatment.
- Kept the travel note in one place only.
- Added polished desktop and mobile layouts.


## v10

- Restyled the live map as a darker, quieter travel card.
- Added a custom gold map pin layered above the live map.
- Reduced visual clutter with muted saturation, lower brightness, and a soft vignette.
- Added a small location caption inside the map card.
- Preserved click-through to Google Maps.


## v11

- Reduced the size of the Currently Wandering panel.
- Switched from an iframe to a true static OpenStreetMap image.
- Kept the custom gold pin centered above the map.
- Made the travel note more prominent.
- Reduced the location headline and info-card sizes.
- Added OpenStreetMap attribution and click-through.
