import { handler, json, fail, readJSON } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';
import { hashPassword, randomSalt, checkPasswordPolicy } from '../../../_lib/auth.js';

const adminCount = db => db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").first('n');

export const onRequestPatch = handler(async ({request, params, env, data}) => {
  requireAdmin(data.user);
  const email = decodeURIComponent(params.email).toLowerCase();
  const u = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  if(!u) return fail('ไม่พบผู้ใช้', 404);
  const b = await readJSON(request);
  const sets=[], args=[];
  if(b.role && b.role!==u.role){
    if(u.role==='admin' && (await adminCount(env.DB))<=1) return fail('ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน');
    sets.push('role=?'); args.push(b.role==='admin'?'admin':'staff');
  }
  if(typeof b.name==='string'){ sets.push('name=?'); args.push(b.name.trim().slice(0,80)||null); }
  if(b.password){
    checkPasswordPolicy(b.password);
    const salt=randomSalt(); sets.push('pw_hash=?','pw_salt=?'); args.push(await hashPassword(b.password,salt), salt);
  }
  if(!sets.length) return json({ok:true});
  await env.DB.prepare(`UPDATE users SET ${sets.join(',')} WHERE email=?`).bind(...args, email).run();
  return json({ok:true});
});

export const onRequestDelete = handler(async ({params, env, data}) => {
  requireAdmin(data.user);
  const email = decodeURIComponent(params.email).toLowerCase();
  if(email===data.user.email) return fail('ลบบัญชีตัวเองไม่ได้');
  const u = await env.DB.prepare('SELECT role FROM users WHERE email=?').bind(email).first();
  if(!u) return fail('ไม่พบผู้ใช้', 404);
  if(u.role==='admin' && (await adminCount(env.DB))<=1) return fail('ต้องมีผู้ดูแลระบบอย่างน้อย 1 คน');
  await env.DB.prepare('DELETE FROM users WHERE email=?').bind(email).run();
  return json({ok:true});
});
