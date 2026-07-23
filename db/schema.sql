-- OgeneO V33 schema
CREATE TABLE IF NOT EXISTS experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT,
  start_at TEXT NOT NULL,          -- ISO 8601
  end_at TEXT NOT NULL,
  place TEXT,                      -- human-readable anchor place
  lat REAL,
  lng REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS moments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  captured_at TEXT NOT NULL,       -- from EXIF / Shortcut
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'iphone',  -- 'iphone' | 'meta' | 'other'
  caption TEXT,
  filename TEXT,
  camera_make TEXT,
  camera_model TEXT,
  lat REAL,
  lng REAL,
  place TEXT,                      -- reverse-geocoded or manual
  cloudinary_public_id TEXT,       -- null for thought-only moments
  width INTEGER,
  height INTEGER,
  ai_tags TEXT,                    -- JSON array of strings
  is_lily INTEGER NOT NULL DEFAULT 0,  -- Lily appearance flag
  experience_id INTEGER REFERENCES experiences(id)
);

CREATE INDEX IF NOT EXISTS idx_moments_captured ON moments(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_moments_experience ON moments(experience_id);

CREATE TABLE IF NOT EXISTS thoughts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  lat REAL,
  lng REAL,
  place TEXT
);

-- single-row-per-key settings, e.g. currently_wandering
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,             -- JSON
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
