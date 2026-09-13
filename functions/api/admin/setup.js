/* สร้างบัญชีผู้ดูแลระบบคนแรก — ใช้ได้เฉพาะตอนที่ยังไม่มีผู้ใช้เลย */
import { handler, json, fail, readJSON } from '../../_lib/http.js';
import { hashPassword, randomSalt, checkPasswordPolicy, makeSession, sessionCookie, requireSecret, SESSION_TTL } from '../../_lib/auth.js';

const count = db => db.prepare('SELECT COUNT(*) AS n FROM users').first('n');

export const onRequestGet = handler(async ({env}) => json({ok:true, needed: (await count(env.DB))===0}));

export const onRequestPost = handler(async ({request, env}) => {
  if((await count(env.DB))>0) return fail('ระบบมีผู้ใช้อยู่แล้ว', 409);
  const b = await readJSON(request);
  const email = String(b.email||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('อีเมลไม่ถูกต้อง');
  checkPasswordPolicy(b.password);
  const salt = randomSalt(), hash = await hashPassword(b.password, salt), now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO users(email,name,role,pw_hash,pw_salt,created_at,last_login) VALUES(?,?,?,?,?,?,?)')
    .bind(email, String(b.name||'').trim().slice(0,80)||null, 'admin', hash, salt, now, now).run();
  const token = await makeSession(requireSecret(env), {email, role:'admin', exp:Math.floor(Date.now()/1000)+SESSION_TTL});
  return json({ok:true, user:{email, role:'admin', name:b.name||''}}, 200, {'set-cookie':sessionCookie(token)});
});
