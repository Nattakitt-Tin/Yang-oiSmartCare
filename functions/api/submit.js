/* POST /api/submit — รับคำตอบ คำนวณ ออกเลขที่ บันทึก แล้วส่ง model กลับ */
import { handler, json, readJSON, fail, assertSameOrigin, clientIP } from '../_lib/http.js';
import { getConfig, nextReportId } from '../_lib/db.js';
import { computeReport, validateAnswers, localDate } from '../../public/assets/core.js';

export const onRequestPost = handler(async ({request, env, waitUntil}) => {
  assertSameOrigin(request);
  const body = await readJSON(request, 50_000);
  const {cfg} = await getConfig(env.DB);

  const answers = Array.isArray(body.answers) ? body.answers.map(Number) : [];
  const err = validateAnswers(cfg, answers);
  if(err) return fail(err);
  if(body.consent!==true) return fail('ต้องยืนยันความยินยอมก่อนบันทึก');

  const intake = {
    name:  String(body.intake?.name||'').trim().slice(0,120),
    dhatu: String(body.intake?.dhatu||'').slice(0,40),
    month: (body.intake?.month===''||body.intake?.month==null) ? '' : String(Number(body.intake.month))
  };
  if(intake.month!=='' && !(Number(intake.month)>=0 && Number(intake.month)<=11)) intake.month='';

  const now = new Date();
  const id  = await nextReportId(env.DB, cfg.org.idPrefix||'YA', now);
  const model = computeReport(cfg, answers, intake, {id, date:now});

  const domains  = Object.fromEntries(model.domains.map(d=>[d.key, d.pct]));
  const elements = Object.fromEntries(model.elements.map(e=>[e.key, e.pct]));

  await env.DB.prepare(`INSERT INTO results
      (id,created_at,local_date,name,dhatu,birth_month,total,max_score,balance,tier_key,tier_label,answers,domains,elements,model)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(id, model.createdAt, localDate(now), intake.name||null, intake.dhatu||null,
          intake.month===''?null:Number(intake.month),
          model.total, model.max, model.balance, model.tier.key, model.tier.label,
          JSON.stringify(answers), JSON.stringify(domains), JSON.stringify(elements), JSON.stringify(model))
    .run();

  /* ซิงก์ไป Google Sheet ด้วย (ถ้าตั้งค่าไว้) โดยไม่ให้ผู้ใช้ต้องรอ */
  if(env.SHEET_URL){
    waitUntil(fetch(env.SHEET_URL, {
      method:'POST', headers:{'content-type':'text/plain;charset=utf-8'},
      body: JSON.stringify({secret:env.SHEET_SECRET||'', id, fields:model.fields})
    }).catch(e=>console.error('sheet sync failed', e)));
  }

  return json({ok:true, model});
});
