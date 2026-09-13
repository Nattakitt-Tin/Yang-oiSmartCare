/* GET /api/admin/results?q=&tier=&from=&to=&page=&size= */
import { handler, json } from '../../../_lib/http.js';

export const onRequestGet = handler(async ({request, env}) => {
  const u = new URL(request.url);
  const q    = (u.searchParams.get('q')||'').trim();
  const tier = u.searchParams.get('tier')||'';
  const from = u.searchParams.get('from')||'';
  const to   = u.searchParams.get('to')||'';
  const size = Math.min(200, Math.max(10, Number(u.searchParams.get('size')||50)));
  const page = Math.max(1, Number(u.searchParams.get('page')||1));

  const where=[], args=[];
  if(q){ where.push('(name LIKE ? OR id LIKE ?)'); args.push(`%${q}%`, `%${q}%`); }
  if(tier){ where.push('tier_key=?'); args.push(tier); }
  if(from){ where.push('local_date>=?'); args.push(from); }
  if(to){ where.push('local_date<=?'); args.push(to); }
  const W = where.length ? 'WHERE '+where.join(' AND ') : '';

  const total = await env.DB.prepare(`SELECT COUNT(*) AS n FROM results ${W}`).bind(...args).first('n');
  const rows  = await env.DB.prepare(
    `SELECT id,created_at,local_date,name,dhatu,total,max_score,balance,tier_key,tier_label
     FROM results ${W} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...args, size, (page-1)*size).all();

  return json({ok:true, total, page, size, items: rows.results});
});
