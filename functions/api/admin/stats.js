/* GET /api/admin/stats — ตัวเลขสำหรับแดชบอร์ด */
import { handler, json } from '../../_lib/http.js';
import { getConfig } from '../../_lib/db.js';
import { localDate } from '../../../public/assets/core.js';

export const onRequestGet = handler(async ({env}) => {
  const db=env.DB, {cfg}=await getConfig(db);
  const today=localDate(new Date());
  const d = n => localDate(new Date(Date.now()-n*86400_000));
  const weekAgo=d(6), monthAgo=d(29);

  const [all, todayN, weekN, monthN, byTier, byDay, recent] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n, AVG(balance) AS avg_balance FROM results').first(),
    db.prepare('SELECT COUNT(*) AS n FROM results WHERE local_date=?').bind(today).first('n'),
    db.prepare('SELECT COUNT(*) AS n FROM results WHERE local_date>=?').bind(weekAgo).first('n'),
    db.prepare('SELECT COUNT(*) AS n FROM results WHERE local_date>=?').bind(monthAgo).first('n'),
    db.prepare('SELECT tier_key, tier_label, COUNT(*) AS n FROM results GROUP BY tier_key').all(),
    db.prepare('SELECT local_date, COUNT(*) AS n FROM results WHERE local_date>=? GROUP BY local_date').bind(monthAgo).all(),
    db.prepare('SELECT answers, domains, elements FROM results ORDER BY created_at DESC LIMIT 2000').all()
  ]);

  /* ค่าเฉลี่ยรายหมวด/ธาตุ และข้อที่ได้คะแนนสูงบ่อย จาก 2,000 รายการล่าสุด */
  const n=recent.results.length;
  const domSum={}, elSum={}, qHigh=new Array(cfg.questions.length).fill(0), qSum=new Array(cfg.questions.length).fill(0);
  const top=cfg.scale.length-1;
  for(const r of recent.results){
    const dm=JSON.parse(r.domains), el=JSON.parse(r.elements), an=JSON.parse(r.answers);
    for(const k in dm) domSum[k]=(domSum[k]||0)+dm[k];
    for(const k in el) elSum[k]=(elSum[k]||0)+el[k];
    an.forEach((v,i)=>{ if(i<qSum.length){ qSum[i]+=v; if(v===top) qHigh[i]++; } });
  }
  const series=[]; for(let i=29;i>=0;i--){ const dd=d(i); series.push({date:dd, n:(byDay.results.find(x=>x.local_date===dd)||{}).n||0}); }

  return json({ok:true,
    total: all.n, avgBalance: all.avg_balance==null?null:Math.round(all.avg_balance),
    today: todayN, week: weekN, month: monthN,
    tiers: cfg.tiers.map(t=>({key:t.key, label:t.label, color:t.color, n:(byTier.results.find(x=>x.tier_key===t.key)||{}).n||0})),
    series,
    domains: cfg.groups.map(g=>({key:g.key, name:g.name, avgPct: n?Math.round((domSum[g.key]||0)/n):0})),
    elements: cfg.elements.map(e=>({key:e.key, name:e.name, avgPct: n?Math.round((elSum[e.key]||0)/n):0})),
    questions: cfg.questions.map((q,i)=>({i:i+1, text:q.t, avg: n?Number((qSum[i]/n).toFixed(2)):0, highPct: n?Math.round(qHigh[i]/n*100):0})),
    sampleSize:n
  });
});
