/* ป้องกันทุก endpoint ใต้ /api/admin ยกเว้น login / setup / logout */
import { fail, assertSameOrigin } from '../../_lib/http.js';
import { readSession, getCookie, SESSION_COOKIE, requireSecret } from '../../_lib/auth.js';

const PUBLIC = new Set(['login','setup','logout']);

export async function onRequest({request, env, next, data}){
  try{ assertSameOrigin(request); }
  catch(e){ return fail(e.message, e.status); }

  const seg = new URL(request.url).pathname.replace(/^\/api\/admin\/?/,'').split('/')[0];
  if(PUBLIC.has(seg)) return next();

  let secret;
  try{ secret = requireSecret(env); } catch(e){ return fail(e.message, e.status); }

  const sess = await readSession(secret, getCookie(request, SESSION_COOKIE));
  if(!sess) return fail('กรุณาเข้าสู่ระบบ', 401);

  // ผู้ใช้ต้องยังมีอยู่ในระบบ (กันกรณีถูกลบแล้วแต่คุกกี้ยังไม่หมดอายุ)
  const u = await env.DB.prepare('SELECT email,name,role FROM users WHERE email=?').bind(sess.email).first();
  if(!u) return fail('บัญชีนี้ถูกลบแล้ว', 401);

  data.user = u;
  return next();
}
