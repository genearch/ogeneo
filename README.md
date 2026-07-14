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


## v12

- Added a nearly invisible, selectable build stamp in the bottom-left corner.
- Shows version, package build time, and browser-reported server modified time to the second.
- Hovering or highlighting reveals the text.
- Package build timestamp: 2026-07-14T04:59:40Z


## v13

- Replaced the unreliable external static-map image service.
- Uses OpenStreetMap's own embedded map endpoint.
- Keeps the dark visual treatment and custom gold pin.
- Preserves click-through to the full map.
- Repositioned attribution and map caption to prevent overlap.


## v14

- Replaced the failed free-map embeds with Mapbox Static Images.
- Uses the Mapbox dark style and a red location pin.
- Opens Google Maps when the map card is clicked.
- Removed the duplicate decorative pin.
- Included `worker-v14.js` with corrected public GET CORS behavior.
- Added `ogeneo.pages.dev` to the allowed site origins.


## v15

- Redesigned the Currently Wandering panel as a compact travel postcard.
- Made the note the visual focus.
- Reduced the map to a smaller accent card.
- Removed the Mapbox token from all website files.
- Added a Worker `/api/map` proxy so the token stays in Cloudflare.
- Included `worker-v15.js`.
- Requires a Cloudflare Worker secret named `MAPBOX_TOKEN`.


## v16

- Fixed the Mapbox static-image request.
- Changed 720x720@2x (1440x1440, over Mapbox's limit) to 600x600@2x (1200x1200).
- Website layout is unchanged from v15.
- Deploy `worker-v16.js` to Cloudflare.


## v17

- Removed the live map and all map-service dependencies.
- Replaced the map with a city-only travel postcard panel.
- Public location API no longer exposes latitude or longitude.
- Shortcut may still send coordinates, but they remain private in KV.
- Included `worker-v17.js`.
- `MAPBOX_TOKEN` is no longer needed and can be removed from Cloudflare.


## v18

- Fixed the JavaScript syntax error that disabled Currently Wandering.
- Added reliable dialog open, close, and backdrop-click behavior.
- Replaced the stale v12 stamp with a clean v18 publish timestamp.
- Removed the permanently stuck `served checking...` text.
- Build timestamp: 2026-07-14T06:08:43Z
- Worker logic is unchanged from v17.


## v20

- Rebuilt Currently Wandering as Option A: Photo Journal.
- Shortcut note appears as Today's Journal.
- Weather is captured by the Worker at update time and shown in F and C.
- Added live world times for the current location, Los Angeles, New York, London, and Paris.
- Added automatic Home / On the Road journey state and day count.
- Added recent stops, recorded when the city changes.
- Public API still hides coordinates.
- Photo URL is optional; a local travel image is used until photo upload arrives.
- Included `worker-v20.js`.
- Build timestamp: 2026-07-14T06:40:27Z


## v21

- Mobile-first typography and spacing pass.
- Photo leads the experience on iPhone.
- Larger location, journal, weather, metadata, world clocks, and recent stops.
- Reduced nested-card styling in favor of a continuous editorial surface.
- Added: Imagined by Gene • Crafted with ChatGPT.
- Worker behavior remains unchanged from v20.
- Build timestamp: 2026-07-14T14:24:00Z


## v22

- Rebuilt Currently Wandering from scratch as one continuous editorial page.
- Added the supplied Camarillo vineyard sunset as the home image.
- Added cache-busting query strings to CSS and JavaScript.
- Removed the old two-column dashboard/card layout.
- Photo, location, journal, weather, journey, clocks, and recent stops now flow naturally.
- Added a curated location-image resolver ready for more cities.
- Worker logic is unchanged from v21.
- Build timestamp: 2026-07-14T14:39:46Z
