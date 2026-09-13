import { handler, json, fail, readJSON } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';
import { hashPassword, randomSalt, checkPasswordPolicy } from '../../../_lib/auth.js';

export const onRequestGet = handler(async ({env, data}) => {
  requireAdmin(data.user);
  const rows = await env.DB.prepare('SELECT email,name,role,created_at,last_login FROM users ORDER BY created_at').all();
  return json({ok:true, users: rows.results});
});

export const onRequestPost = handler(async ({request, env, data}) => {
  requireAdmin(data.user);
  const b = await readJSON(request);
  const email = String(b.email||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('อีเมลไม่ถูกต้อง');
  const role = b.role==='admin' ? 'admin' : 'staff';
  checkPasswordPolicy(b.password);
  if(await env.DB.prepare('SELECT 1 FROM users WHERE email=?').bind(email).first()) return fail('มีอีเมลนี้อยู่แล้ว', 409);
  const salt=randomSalt(), hash=await hashPassword(b.password, salt);
  await env.DB.prepare('INSERT INTO users(email,name,role,pw_hash,pw_salt,created_at) VALUES(?,?,?,?,?,?)')
    .bind(email, String(b.name||'').trim().slice(0,80)||null, role, hash, salt, new Date().toISOString()).run();
  return json({ok:true});
});
