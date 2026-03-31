import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'agconcursos',
  user:     process.env.DB_USER     || 'agconcursos',
  password: process.env.DB_PASSWORD,
  max: 60,
  min: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS decks (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      discipline  TEXT NOT NULL DEFAULT '',
      icon        TEXT NOT NULL DEFAULT 'layers',
      parent_id   INT REFERENCES decks(id) ON DELETE CASCADE,
      card_count  INT NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cards (
      id                SERIAL PRIMARY KEY,
      deck_id           INT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      front             TEXT NOT NULL DEFAULT '',
      back              TEXT NOT NULL DEFAULT '',
      hint              TEXT NOT NULL DEFAULT '',
      tags              TEXT[] NOT NULL DEFAULT '{}',
      active            BOOLEAN NOT NULL DEFAULT TRUE,
      occlusion_note_id INT,
      shape_index       INT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS card_states (
      id             SERIAL PRIMARY KEY,
      card_id        INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      session_id     TEXT NOT NULL,
      state          TEXT NOT NULL DEFAULT 'new',
      stability      FLOAT NOT NULL DEFAULT 0.1,
      difficulty     FLOAT NOT NULL DEFAULT 7.2102,
      ease_factor    FLOAT NOT NULL DEFAULT 0.1,
      interval_days  FLOAT NOT NULL DEFAULT 0,
      scheduled_days FLOAT NOT NULL DEFAULT 0,
      elapsed_days   FLOAT NOT NULL DEFAULT 0,
      reps           INT NOT NULL DEFAULT 0,
      lapses         INT NOT NULL DEFAULT 0,
      due            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_review    TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (card_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS review_logs (
      id             SERIAL PRIMARY KEY,
      card_id        INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      session_id     TEXT NOT NULL,
      rating         INT NOT NULL,
      state_before   TEXT NOT NULL DEFAULT 'new',
      state_after    TEXT NOT NULL DEFAULT 'new',
      elapsed_days   FLOAT NOT NULL DEFAULT 0,
      scheduled_days FLOAT NOT NULL DEFAULT 0,
      ease_factor    FLOAT NOT NULL DEFAULT 0,
      reviewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS occlusion_notes (
      id         SERIAL PRIMARY KEY,
      deck_id    INT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      image_data TEXT NOT NULL,
      shapes     JSONB NOT NULL DEFAULT '[]',
      mode       TEXT NOT NULL DEFAULT 'hide_all',
      header     TEXT NOT NULL DEFAULT '',
      footer     TEXT NOT NULL DEFAULT '',
      remarks    TEXT NOT NULL DEFAULT '',
      sources    TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT NOT NULL DEFAULT '',
      role          TEXT NOT NULL DEFAULT 'temporario',
      google_id     TEXT UNIQUE,
      picture       TEXT,
      password_hash TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    -- Migração incremental para tabelas já existentes
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role          TEXT NOT NULL DEFAULT 'temporario';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR NOT NULL COLLATE "default",
      sess   JSON    NOT NULL,
      expire TIMESTAMPTZ NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid)
    );
    CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_cards_deck_active       ON cards (deck_id, active);
    CREATE INDEX IF NOT EXISTS idx_cards_occlusion         ON cards (occlusion_note_id) WHERE occlusion_note_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_card_states_session_due  ON card_states (session_id, due);
    CREATE INDEX IF NOT EXISTS idx_card_states_card_session ON card_states (card_id, session_id);
    CREATE INDEX IF NOT EXISTS idx_review_logs_session      ON review_logs (session_id, reviewed_at);
    CREATE INDEX IF NOT EXISTS idx_decks_parent             ON decks (parent_id);
    CREATE INDEX IF NOT EXISTS idx_users_google_id          ON users (google_id) WHERE google_id IS NOT NULL;
  `);
  console.log('Database schema ready.');
}

export { pool };
export default pool;
