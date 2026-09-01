CREATE TABLE IF NOT EXISTS log (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       TEXT,      -- server timestamp (ISO)
  event    TEXT,      -- "done"
  plan     TEXT,      -- main / three / two
  day      TEXT,      -- d1..d5 / u,l,f / a,b
  exercise TEXT,      -- exercise name
  sr       TEXT,      -- prescribed sets × reps
  target   TEXT,      -- muscles
  weight   REAL,      -- kg logged (nullable); for event 'waist' this is inches
  mode     TEXT,      -- weight-entry convention: each|bar|stack|bw (blank for body-log events)
  entry_id TEXT,      -- stable per-set id (plan_day_idx_date); an "undo" event with same id retracts it
  mins     REAL,      -- activity duration in minutes (event 'activity'; nullable)
  dist     REAL       -- activity distance in miles (event 'activity'; nullable)
);
CREATE INDEX IF NOT EXISTS idx_log_ex_ts ON log(exercise, ts);
-- If upgrading an existing table, run once:
--   ALTER TABLE log ADD COLUMN entry_id TEXT;
--   ALTER TABLE log ADD COLUMN mins REAL;
--   ALTER TABLE log ADD COLUMN dist REAL;
