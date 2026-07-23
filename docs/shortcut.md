# iPhone Shortcuts: two icons, four jobs

Everything authenticates the same way: header `Authorization` =
`Bearer YOUR_UPLOAD_SECRET` (the value in `.upload-secret.txt`).
Base URL: `https://ogeneo.y5xvsnh5vq.workers.dev`

## Shortcut 1: "Post to OgeneO" (Share Sheet)

The everyday one. Lives in the share sheet, so sharing a photo posts it
with zero extra decisions.

1. Shortcuts app → + → rename to "Post to OgeneO".
2. Info button → enable **Show in Share Sheet** → accept **Images**.
3. Actions:
   1. **Get Details of Images** on Shortcut Input: Date Taken, Location,
      Camera Make, Camera Model, File Name.
   2. **Ask for Input** (Text), prompt "Caption?" — allow empty.
   3. **Get Contents of URL**: POST `/api/upload`, Request Body **Form**:
      - `file` = Shortcut Input
      - `captured_at` = Date Taken (ISO 8601)
      - `lat` / `lng` = Location latitude / longitude
      - `camera_make` / `camera_model` / `filename` = the details
      - `caption` = Provided Input

Meta glasses photos carry `Meta` as camera make and are auto-flagged as
first-person "Through My Eyes" Moments.

## Shortcut 2: "OgeneO" (home screen, opens a menu)

The deliberate one. First action: **Choose from Menu** with three options.

### Menu option A: Comet
1. **Ask for Input** (Text), "What's on your mind?"
2. **Get Current Location**.
3. **Get Contents of URL**: POST `/api/thought`, Form:
   - `body` = Provided Input
   - `lat` / `lng` = Current Location latitude / longitude
   - `place` = Current Location city
   (Skip the location actions and fields for pin-less comets.)

### Menu option B: Update hero
1. **Select Photos** (one photo, optional — skip for text-only updates).
2. **Ask for Input** (Text), "New headline?" — allow empty.
3. **Ask for Input** (Text), "New subtitle?" — allow empty.
4. **Get Contents of URL**: POST `/api/hero`, Form:
   - `file` = Selected Photo (if chosen)
   - `title` = headline input (only sent fields change)
   - `sub` = subtitle input
   A hero image replaces the village line art on the right; send
   `clear_image` = `1` to bring the village back.

### Menu option C: Move the pin
1. **Get Current Location**.
2. **Ask for Input** (Text), "What are you up to here?" — the note.
3. **Get Contents of URL**: POST `/api/wander`, Form:
   - `place` = Current Location city, `lat` / `lng` = coordinates
   - `country` = Current Location country code (drives the flag)
   - `note` = Provided Input

Apollo also moves the pin automatically when a photo lands more than
100 km from the current spot, so option C is for corrections and
photo-less arrivals.

## What the Worker does with uploads

Uploads media to Cloudinary (folder `ogeneo/`), infers tags from the
caption (a caption mentioning Lily flags a Lily appearance), groups the
Moment into an Experience when it is within 8 hours and 30 km of related
Moments, updates Currently Wandering when you have clearly moved, and
publishes immediately.
