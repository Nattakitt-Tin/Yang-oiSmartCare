-- ผลการประเมินแต่ละครั้ง
CREATE TABLE IF NOT EXISTS results (
  id          TEXT PRIMARY KEY,              -- YA-2609-001 (ออกโดยเซิร์ฟเวอร์)
  created_at  TEXT NOT NULL,                 -- ISO UTC
  local_date  TEXT NOT NULL,                 -- YYYY-MM-DD เวลาไทย ใช้จัดกลุ่มสถิติ
  name        TEXT,
  dhatu       TEXT,
  birth_month INTEGER,
  total       INTEGER NOT NULL,
  max_score   INTEGER NOT NULL,
  balance     INTEGER NOT NULL,
  tier_key    TEXT NOT NULL,
  tier_label  TEXT NOT NULL,
  answers     TEXT NOT NULL,                 -- JSON array
  domains     TEXT NOT NULL,                 -- JSON {key: pct}
  elements    TEXT NOT NULL,                 -- JSON {key: pct}
  model       TEXT NOT NULL                  -- JSON model เต็ม ใช้เปิดรายงานย้อนหลัง
);
CREATE INDEX IF NOT EXISTS idx_results_date ON results(local_date);
CREATE INDEX IF NOT EXISTS idx_results_name ON results(name);
CREATE INDEX IF NOT EXISTS idx_results_tier ON results(tier_key);

-- การตั้งค่าคำถาม/ผลลัพธ์ (แถวเดียว)
CREATE TABLE IF NOT EXISTS config (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  json        TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT
);
CREATE TABLE IF NOT EXISTS config_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  json        TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT
);

-- ผู้ใช้ฝั่งแอดมิน
CREATE TABLE IF NOT EXISTS users (
  email       TEXT PRIMARY KEY,
  name        TEXT,
  role        TEXT NOT NULL DEFAULT 'staff', -- admin | staff
  pw_hash     TEXT NOT NULL,
  pw_salt     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  last_login  TEXT
);

-- ตัวนับเลขที่รายงานรายเดือน
CREATE TABLE IF NOT EXISTS counters (
  key         TEXT PRIMARY KEY,
  value       INTEGER NOT NULL
);

-- ประวัติการล็อกอิน ใช้จำกัดการเดารหัสผ่าน
CREATE TABLE IF NOT EXISTS login_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT,
  ip          TEXT,
  at          TEXT NOT NULL,
  ok          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_at ON login_attempts(at);
