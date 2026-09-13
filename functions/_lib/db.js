import { DEFAULT_CFG, mergeCfg } from '../../public/assets/core.js';

/* config ปัจจุบัน: จากฐานข้อมูล ถ้ายังไม่มีใช้ค่าเริ่มต้น */
export async function getConfig(db){
  const row = await db.prepare('SELECT json, updated_at FROM config WHERE id=1').first();
  if(!row) return { cfg: structuredClone(DEFAULT_CFG), updatedAt:null };
  try{ return { cfg: mergeCfg(JSON.parse(row.json)), updatedAt: row.updated_at }; }
  catch{ return { cfg: structuredClone(DEFAULT_CFG), updatedAt:null }; }
}

export async function saveConfig(db, cfg, by){
  const json=JSON.stringify(cfg), now=new Date().toISOString();
  await db.batch([
    db.prepare(`INSERT INTO config(id,json,updated_at,updated_by) VALUES(1,?,?,?)
                ON CONFLICT(id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at, updated_by=excluded.updated_by`)
      .bind(json, now, by),
    db.prepare('INSERT INTO config_history(json,updated_at,updated_by) VALUES(?,?,?)').bind(json, now, by)
  ]);
  return now;
}

/* ออกเลขที่รายงานรายเดือน เช่น YA-2609-001 (เวลาไทย) */
export async function nextReportId(db, prefix, date=new Date()){
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'2-digit',month:'2-digit'})
    .formatToParts(date).reduce((a,x)=>(a[x.type]=x.value,a),{});
  const key = `${p.year}${p.month}`;
  const row = await db.prepare(
    `INSERT INTO counters(key,value) VALUES(?,1)
     ON CONFLICT(key) DO UPDATE SET value=value+1 RETURNING value`).bind(key).first();
  return `${prefix}-${key}-${String(row.value).padStart(3,'0')}`;
}
