/* GET ตั้งค่าเต็ม / PUT บันทึก (ผู้ดูแลระบบเท่านั้น) */
import { handler, json, fail, readJSON } from '../../_lib/http.js';
import { getConfig, saveConfig } from '../../_lib/db.js';
import { requireAdmin } from '../../_lib/auth.js';
import { mergeCfg } from '../../../public/assets/core.js';

export const onRequestGet = handler(async ({env}) => {
  const {cfg, updatedAt} = await getConfig(env.DB);
  return json({ok:true, cfg, updatedAt});
});

export const onRequestPut = handler(async ({request, env, data}) => {
  requireAdmin(data.user);
  const b = await readJSON(request, 2_000_000);
  const cfg = mergeCfg(b.cfg);
  if(!cfg.questions?.length) return fail('ต้องมีคำถามอย่างน้อย 1 ข้อ');
  if(!(cfg.scale?.length>=2)) return fail('ต้องมีตัวเลือกคำตอบอย่างน้อย 2 ตัวเลือก');
  if(!cfg.groups?.length || !cfg.tiers?.length) return fail('ข้อมูลหมวดหรือกลุ่มเสี่ยงไม่ครบ');
  for(const q of cfg.questions) if(!cfg.groups.some(g=>g.key===q.g)) return fail('มีคำถามที่อ้างถึงหมวดที่ไม่มีอยู่');
  const updatedAt = await saveConfig(env.DB, cfg, data.user.email);
  return json({ok:true, updatedAt});
});
