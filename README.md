# OgeneO V31 starter build

This package contains:

- `index.html` based on the approved final homepage mockup
- `through-my-eyes.html`
- the current legacy CSS, JavaScript, and posts data for migration reference
- a starter `moments.json`
- the Ventura Pier location image

## Next build step

Split the inline CSS and JavaScript from the approved mockups into:

- `css/site.css`
- `js/site.js`

Then connect the homepage to:

- the existing Cloudflare location endpoint
- `data/moments.json`
- Cloudinary media URLs

## Worker

No Worker update is required for the first visual build. The current endpoint can continue serving the existing location object while the front end is rebuilt.
