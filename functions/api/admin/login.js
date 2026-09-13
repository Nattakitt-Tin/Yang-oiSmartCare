import { handler, json, fail, readJSON, clientIP } from '../../_lib/http.js';
import { hashPassword, makeSession, sessionCookie, requireSecret, SESSION_TTL } from '../../_lib/auth.js';

const WINDOW_MIN=15, MAX_FAILS=5;

export const onRequestPost = handler(async ({request, env}) => {
  const b = await readJSON(request);
  const email = String(b.email||'').trim().toLowerCase();
  const password = String(b.password||'');
  const ip = clientIP(request);
  const since = new Date(Date.now()-WINDOW_MIN*60_000).toISOString();

  const fails = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM login_attempts WHERE ok=0 AND at>? AND (email=? OR ip=?)')
    .bind(since, email, ip).first('n');
  if(fails>=MAX_FAILS) return fail(`พยายามเข้าสู่ระบบผิดหลายครั้ง กรุณารอ ${WINDOW_MIN} นาที`, 429);

  const u = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
  const ok = u ? (await hashPassword(password, u.pw_salt))===u.pw_hash : false;

  await env.DB.prepare('INSERT INTO login_attempts(email,ip,at,ok) VALUES(?,?,?,?)')
    .bind(email, ip, new Date().toISOString(), ok?1:0).run();
  if(!ok) return fail('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);

  await env.DB.prepare('UPDATE users SET last_login=? WHERE email=?').bind(new Date().toISOString(), email).run();
  const token = await makeSession(requireSecret(env), {email, role:u.role, exp:Math.floor(Date.now()/1000)+SESSION_TTL});
  return json({ok:true, user:{email, name:u.name, role:u.role}}, 200, {'set-cookie':sessionCookie(token)});
});
