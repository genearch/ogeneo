export interface Moment {
  id: number;
  captured_at: string;
  created_at: string;
  source: 'iphone' | 'meta' | 'other';
  caption: string | null;
  filename: string | null;
  camera_make: string | null;
  camera_model: string | null;
  lat: number | null;
  lng: number | null;
  place: string | null;
  cloudinary_public_id: string | null;
  width: number | null;
  height: number | null;
  ai_tags: string | null;
  is_lily: number;
  experience_id: number | null;
}

export interface Experience {
  id: number;
  title: string;
  summary: string | null;
  start_at: string;
  end_at: string;
  place: string | null;
  lat: number | null;
  lng: number | null;
  moment_count?: number;
  cover_public_id?: string | null;
}

export interface Thought {
  id: number;
  body: string;
  created_at: string;
}

export interface Wandering {
  place: string;
  note: string;
  since: string;
}

export interface Env {
  DB: D1Database;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  UPLOAD_SECRET: string;
}
