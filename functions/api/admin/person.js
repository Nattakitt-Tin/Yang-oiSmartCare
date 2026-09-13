/* GET /api/admin/person?key=<name_key> — ประวัติทุกครั้งของคนเดิม พร้อม model 2 ครั้งล่าสุดไว้เทียบ */
import { handler, json, fail } from '../../_lib/http.js';
import { getConfig } from '../../_lib/db.js';

export const onRequestGet = handler(async ({request, env}) => {
  const key = (new URL(request.url).searchParams.get('key')||'').trim();
  if(!key) return fail('ไม่ระบุชื่อ');
  const rows = await env.DB.prepare(
    `SELECT id,created_at,local_date,name,dhatu,total,max_score,balance,tier_key,tier_label,answers,domains,elements
     FROM results WHERE name_key=? ORDER BY created_at ASC`).bind(key).all();
  if(!rows.results.length) return fail('ไม่พบประวัติ', 404);

  const visits = rows.results.map(r=>({
    ...r, answers:JSON.parse(r.answers), domains:JSON.parse(r.domains), elements:JSON.parse(r.elements)
  }));
  const ids = visits.slice(-2).map(v=>v.id);
  const models = {};
  for(const id of ids){
    const m = await env.DB.prepare('SELECT model FROM results WHERE id=?').bind(id).first('model');
    models[id] = JSON.parse(m);
  }
  const {cfg} = await getConfig(env.DB);
  return json({ok:true, visits,
    latest: models[ids[ids.length-1]], previous: ids.length>1 ? models[ids[0]] : null,
    questions: cfg.questions.map(q=>q.t), groups: cfg.groups, elements: cfg.elements});
});
