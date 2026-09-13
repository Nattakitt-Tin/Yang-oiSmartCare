/* GET /api/admin/export?from=&to=&tier=  → CSV (UTF-8 BOM เปิดใน Excel ได้ทันที) */
import { handler, fail } from '../../_lib/http.js';

const cell = v => {
  const s = v==null ? '' : String(v);
  return /[",\n\r]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
};

export const onRequestGet = handler(async ({request, env}) => {
  const u = new URL(request.url);
  const tier=u.searchParams.get('tier')||'', from=u.searchParams.get('from')||'', to=u.searchParams.get('to')||'';
  const where=[], args=[];
  if(tier){ where.push('tier_key=?'); args.push(tier); }
  if(from){ where.push('local_date>=?'); args.push(from); }
  if(to){ where.push('local_date<=?'); args.push(to); }
  const W = where.length ? 'WHERE '+where.join(' AND ') : '';
  const rows = await env.DB.prepare(`SELECT model FROM results ${W} ORDER BY created_at ASC LIMIT 20000`).bind(...args).all();

  const headers=[]; const seen=new Set(); const records=[];
  for(const r of rows.results){
    const f = JSON.parse(r.model).fields || {};
    for(const k of Object.keys(f)) if(!seen.has(k)){ seen.add(k); headers.push(k); }
    records.push(f);
  }
  const lines=[headers.map(cell).join(',')];
  for(const f of records) lines.push(headers.map(h=>cell(f[h])).join(','));
  const csv='﻿'+lines.join('\r\n');
  const stamp=new Date().toISOString().slice(0,10).replace(/-/g,'');
  return new Response(csv, {headers:{
    'content-type':'text/csv; charset=utf-8',
    'content-disposition':`attachment; filename="results-${stamp}.csv"; filename*=UTF-8''${encodeURIComponent('ผลการประเมิน-'+stamp)}.csv`,
    'cache-control':'no-store'
  }});
});
