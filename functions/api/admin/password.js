/* เปลี่ยนรหัสผ่านของตัวเอง */
import { handler, json, fail, readJSON } from '../../_lib/http.js';
import { hashPassword, randomSalt, checkPasswordPolicy } from '../../_lib/auth.js';

export const onRequestPost = handler(async ({request, env, data}) => {
  const b = await readJSON(request);
  const u = await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(data.user.email).first();
  if((await hashPassword(String(b.current||''), u.pw_salt))!==u.pw_hash) return fail('รหัสผ่านเดิมไม่ถูกต้อง', 401);
  checkPasswordPolicy(b.password);
  const salt=randomSalt(), hash=await hashPassword(b.password, salt);
  await env.DB.prepare('UPDATE users SET pw_hash=?, pw_salt=? WHERE email=?').bind(hash, salt, u.email).run();
  return json({ok:true});
});
