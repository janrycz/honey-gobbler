-- Honey Gobbler leaderboard (D1). Already applied to the live database; kept here for reference.
CREATE TABLE IF NOT EXISTS config (k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS players (
  cid TEXT PRIMARY KEY,            -- Shopify customer id
  name TEXT NOT NULL,
  name_lc TEXT NOT NULL UNIQUE,
  hidden INTEGER NOT NULL DEFAULT 0, -- 1 = removed from the boards
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,             -- ticket handed out when a run starts
  created INTEGER NOT NULL,
  ip TEXT NOT NULL                 -- scrambled, only used to slow down spam
);
CREATE INDEX IF NOT EXISTS runs_ip ON runs (ip, created);
CREATE TABLE IF NOT EXISTS scores (
  board TEXT NOT NULL,             -- endless | crazy | speed
  cid TEXT NOT NULL,
  value REAL NOT NULL,             -- round reached, or seconds for speed
  tie REAL NOT NULL DEFAULT 0,     -- kg, breaks ties on endless and crazy
  run TEXT,
  at INTEGER NOT NULL,
  PRIMARY KEY (board, cid)
);
CREATE INDEX IF NOT EXISTS scores_rank ON scores (board, value, tie);
