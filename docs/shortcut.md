# iPhone Shortcut: Share Sheet → OgeneO

Creates the pipeline from the V33 spec: Share Sheet → Shortcut → Worker →
Cloudinary → AI enrichment → Website.

## Build the Shortcut

1. Shortcuts app → + → rename to "Post to OgeneO".
2. Tap the info button → enable **Show in Share Sheet** → accept **Images**.
3. Add these actions in order:

   1. **Get Details of Images** on Shortcut Input:
      add variables for Date Taken, Location, Camera Make, Camera Model, File Name.
   2. **Ask for Input** (Text), prompt "Caption?" — allow empty.
   3. **Get Contents of URL**:
      - URL: `https://YOUR-WORKER.workers.dev/api/upload`
      - Method: POST
      - Headers: `Authorization` = `Bearer YOUR_UPLOAD_SECRET`
      - Request Body: **Form**
        - `file` = Shortcut Input (the image)
        - `captured_at` = Date Taken (formatted ISO 8601)
        - `lat` = Location latitude, `lng` = Location longitude
        - `camera_make` = Camera Make, `camera_model` = Camera Model
        - `filename` = File Name
        - `caption` = Provided Input
   4. (Optional) **Show Result** to see the JSON response.

## Meta glasses captures

Photos imported from the Meta AI app carry `Meta` as camera make; the Worker
auto-tags them `source=meta` and the site shows the glasses glyph
("Through My Eyes"). You can also force it by adding a `source` = `meta`
form field in a second Shortcut variant.

## What the Worker does

Uploads media to Cloudinary (folder `ogeneo/`), infers tags from the caption
(a caption mentioning Lily flags a Lily appearance), groups the Moment into
an Experience when it is within 8 hours and 30 km of related Moments, and
publishes immediately.
