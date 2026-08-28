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
  mode     TEXT       -- weight-entry convention: each|bar|stack|bw (blank for body-log events)
);
CREATE INDEX IF NOT EXISTS idx_log_ex_ts ON log(exercise, ts);
