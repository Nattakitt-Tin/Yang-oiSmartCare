-- คีย์ชื่อแบบปรับรูป (ตัดคำนำหน้า/ช่องว่าง) ใช้จับคู่ว่าเป็นคนเดิม
ALTER TABLE results ADD COLUMN name_key TEXT;
CREATE INDEX IF NOT EXISTS idx_results_name_key ON results(name_key);
