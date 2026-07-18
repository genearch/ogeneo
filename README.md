# OgeneO V31.1

Upload the contents of this folder to Cloudflare Pages.

## Included
- `index.html`
- `css/site.css`
- `js/site.js`
- `data/posts.json`

## Existing backend
No Worker update is required.

The location endpoint is already configured in `js/site.js`:

`https://ogeneo-location-api.y5xvsnh5vq.workers.dev/api/location`

## Moments data
The page accepts any of these top-level JSON shapes:

- an array
- `{ "posts": [...] }`
- `{ "moments": [...] }`
- `{ "items": [...] }`

Common field names are normalized automatically, including `title`, `caption`, `imageUrl`, `cloudinaryUrl`, `createdAt`, `timestamp`, `locationName`, `camera`, and `device`.

## Avatar
There is only one avatar, in the top-right corner.

To use an image, set `avatarUrl` in `js/site.js`. If left blank, initials are shown and no broken image icon appears.
