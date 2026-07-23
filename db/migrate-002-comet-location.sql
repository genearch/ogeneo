-- Migration 002: comets (thoughts) get an optional location
ALTER TABLE thoughts ADD COLUMN lat REAL;
ALTER TABLE thoughts ADD COLUMN lng REAL;
ALTER TABLE thoughts ADD COLUMN place TEXT;
