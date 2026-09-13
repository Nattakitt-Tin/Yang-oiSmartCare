import { handler, json, fail } from '../../../_lib/http.js';
import { requireAdmin } from '../../../_lib/auth.js';

export const onRequestGet = handler(async ({params, env}) => {
  const row = await env.DB.prepare('SELECT model FROM results WHERE id=?').bind(params.id).first();
  if(!row) return fail('ไม่พบรายการ', 404);
  return json({ok:true, model: JSON.parse(row.model)});
});

export const onRequestDelete = handler(async ({params, env, data}) => {
  requireAdmin(data.user);
  const r = await env.DB.prepare('DELETE FROM results WHERE id=?').bind(params.id).run();
  if(!r.meta.changes) return fail('ไม่พบรายการ', 404);
  return json({ok:true});
});
