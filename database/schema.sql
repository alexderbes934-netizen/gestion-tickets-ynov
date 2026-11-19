CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'Ouvert'
    CHECK (statut IN ('Ouvert', 'En cours', 'Résolu')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets (created_at DESC);
