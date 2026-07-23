-- Demo seed data. Cloudinary IDs use the `demo` cloud's public sample images
-- so the site renders before your own cloud is wired up.
DELETE FROM moments; DELETE FROM experiences; DELETE FROM thoughts; DELETE FROM settings;

INSERT INTO experiences (id, title, summary, start_at, end_at, place, lat, lng) VALUES
(1, 'A morning on the coast', 'Fog burned off by ten. Everything smelled like salt and coffee.', '2026-07-18T07:12:00Z', '2026-07-18T13:40:00Z', 'Mendocino, CA', 39.3076, -123.7995),
(2, 'Back roads home', 'Took the long way. No regrets, one wrong turn, two good sandwiches.', '2026-07-19T15:02:00Z', '2026-07-19T20:15:00Z', 'Anderson Valley, CA', 39.0126, -123.3703);

INSERT INTO moments (captured_at, source, caption, camera_make, camera_model, lat, lng, place, cloudinary_public_id, width, height, ai_tags, is_lily, experience_id) VALUES
('2026-07-18T07:12:00Z', 'iphone', 'First light through the fog.', 'Apple', 'iPhone 16 Pro', 39.3076, -123.7995, 'Mendocino, CA', 'samples/landscapes/beach-boat', 1024, 683, '["coast","fog","morning"]', 0, 1),
('2026-07-18T09:45:00Z', 'meta', 'What I was actually looking at when the whale breached.', 'Meta', 'Ray-Ban Meta', 39.3079, -123.8010, 'Mendocino Headlands', 'samples/landscapes/nature-mountains', 1280, 853, '["ocean","first-person","whale"]', 0, 1),
('2026-07-18T11:30:00Z', 'iphone', 'Lily found the one sunbeam in the whole cafe.', 'Apple', 'iPhone 16 Pro', 39.3055, -123.7990, 'Mendocino, CA', 'samples/animals/kitten-playing', 640, 425, '["lily","cafe"]', 1, 1),
('2026-07-19T15:02:00Z', 'iphone', 'The road had other plans.', 'Apple', 'iPhone 16 Pro', 39.0126, -123.3703, 'Anderson Valley, CA', 'samples/landscapes/girl-urban-view', 1024, 683, '["roadtrip","golden-hour"]', 0, 2),
('2026-07-19T18:40:00Z', 'meta', 'Hands on the wheel, eyes on this.', 'Meta', 'Ray-Ban Meta', 38.9850, -123.3500, 'Highway 128', 'samples/landscapes/architecture-signs', 1280, 853, '["first-person","drive"]', 0, 2),
('2026-07-21T08:15:00Z', 'iphone', 'Home. The garden survived without me, barely.', 'Apple', 'iPhone 16 Pro', NULL, NULL, NULL, 'samples/food/spices', 1024, 683, '["home","garden"]', 0, NULL);

INSERT INTO thoughts (body, created_at, lat, lng, place) VALUES
('The best part of a trip is the hour after you stop taking pictures of it.', '2026-07-18T21:00:00Z', 39.3076, -123.7995, 'Mendocino, CA'),
('Fog is just a cloud that showed up early.', '2026-07-18T08:00:00Z', 39.3055, -123.7990, 'Mendocino, CA'),
('63 years in and I still cannot pack light.', '2026-07-17T19:30:00Z', NULL, NULL, NULL);

INSERT INTO settings (key, value) VALUES
('currently_wandering', '{"place":"Pépieux, France","note":"Researching village cafés ☕","since":"2026-07-20","lat":43.2919,"lng":2.6786,"country":"FR","timezone":"Europe/Paris"}'),
('home', '{"place":"home","lat":34.2164,"lng":-119.0376}');
