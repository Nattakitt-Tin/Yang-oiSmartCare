/**
 * สร้างข้อมูลจำลองแบบเหมือนจริงย้อนหลัง N วัน → ไฟล์ SQL สำหรับ wrangler d1 execute
 * ทุกแถวมี model.mock = true ลบทิ้งภายหลังได้ด้วย:
 *   DELETE FROM results WHERE json_extract(model,'$.mock')=1;
 *
 * ใช้:  START=2609:51 node scripts/seed-mock.mjs [days=92] [outDir=.tmp-seed] [configUrl]
 *       (START = เลขที่ล่าสุดของแต่ละเดือนที่มีอยู่แล้ว เพื่อไม่ให้เลขชนกัน)
 */
import { computeReport, nameKey, localDate, dhatuOfMonth, DEFAULT_CFG, mergeCfg } from '../public/assets/core.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const DAYS   = Number(process.argv[2]||92);
const OUT    = process.argv[3]||'.tmp-seed';
const CFGURL = process.argv[4]||'https://yang-oismartcare.pages.dev/api/config';
const ID_PREFIX = 'YA';
/* เลขที่เริ่มต้นต่อจากที่มีอยู่จริง เช่น START=2609:51 */
const START = Object.fromEntries((process.env.START||'').split(',').filter(Boolean).map(x=>{const [k,v]=x.split(':'); return [k,Number(v)]}));

/* ---------- สุ่มแบบกำหนด seed ให้ผลซ้ำได้ ---------- */
let seed = 20260915;
const rnd = () => { seed = (seed*1664525 + 1013904223) % 4294967296; return seed/4294967296; };
const pick = a => a[Math.floor(rnd()*a.length)];
const poisson = m => { let L=Math.exp(-m), k=0, p=1; do{ k++; p*=rnd(); }while(p>L); return k-1; };
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- ชื่อไทยสมจริง ---------- */
const FIRST_F = ['วิภา','สมหญิง','มาลี','กนกวรรณ','สุภาพร','จันทร์เพ็ญ','บัวผัน','ศรีนวล','ดวงใจ','พรทิพย์','อรุณี','นงลักษณ์','สายฝน','บุญมี','ทองใบ','คำปัน','แสงดาว','พิมพ์ใจ','รัตนา','ปราณี','อัมพร','ยุพิน','นิภา','เพ็ญศรี','สุดารัตน์','ชนิดา','ศิริพร','วันเพ็ญ','จิราภรณ์','ละมัย'];
const FIRST_M = ['สมชาย','ประยุทธ์','อนันต์','ธีรพล','บุญส่ง','คำมูล','ทองดี','สุรชัย','วิชัย','ประสิทธิ์','จำลอง','สมพงษ์','บุญเลิศ','พิชัย','ชาญชัย','อุดม','สุพจน์','เกรียงไกร','ณรงค์','ไพบูลย์','สมบัติ','ศักดิ์ชัย','วีระ','บรรจง','เสน่ห์'];
const LAST = ['ใจดี','รักสุข','แข็งแรง','ศรีสุข','พอเพียง','สายใจ','มั่นคง','คำแสน','บุญมา','ปัญญาดี','แก้วมณี','อินทะวงศ์','จันทร์แก้ว','ทองคำ','สุขเกษม','วงศ์ใหญ่','ไชยวงศ์','คำภีระ','ศรีวิชัย','ธรรมรักษ์','กันทะวงศ์','ปินตา','ตาคำ','อุ่นเรือน','เรือนคำ','สิงห์แก้ว','บุญเรือง','ดวงดี','คำลือ','สุวรรณ'];
const PREFIX_F = ['นาง','นางสาว','คุณ','','น.ส.'];
const PREFIX_M = ['นาย','คุณ','',''];

function makePerson(){
  const female = rnd()<0.62;                       // คลินิกแผนไทย ผู้หญิงมาเยอะกว่า
  const first = female?pick(FIRST_F):pick(FIRST_M), surname=pick(LAST);
  const month = Math.floor(rnd()*12);
  return {first,surname,female,month, dhatu:dhatuOfMonth(month), profile: pickProfile()};
}
const displayName = p => (p.female?pick(PREFIX_F):pick(PREFIX_M)) + p.first + ' ' + p.surname;

/* ---------- โปรไฟล์อาการ: ค่าเฉลี่ยรายข้อ (ข้อ 1-9) ---------- */
function pickProfile(){
  const r=rnd();
  if(r<0.36) return {name:'healthy',  mean:[0.5,0.6,0.9,0.6,0.6,0.9,0.8,0.4,0.6]};
  if(r<0.62) return {name:'office',   mean:[2.2,2.4,2.0,1.4,1.3,1.5,1.2,0.7,1.0]};
  if(r<0.82) return {name:'stress',   mean:[1.2,1.3,1.5,2.4,2.3,2.2,1.4,1.0,0.9]};
  if(r<0.91) return {name:'lifestyle',mean:[1.0,1.1,1.8,1.2,1.4,1.3,2.4,2.0,1.6]};
  return          {name:'severe',   mean:[2.6,2.7,2.5,2.6,2.7,2.5,2.3,2.2,2.0]};
}
function sampleAnswers(mean, shift=0){
  return mean.map(m=>{ const v=m+shift+(rnd()-0.5)*1.6; return clamp(Math.round(v),0,3); });
}

/* ---------- ปฏิทิน ---------- */
const HOLIDAYS = new Set(['2026-06-03','2026-07-28','2026-08-12','2026-10-13','2026-10-23']);
function dailyVolume(d){
  const ds=localDate(d), dow=d.getDay();
  if(HOLIDAYS.has(ds)) return 0;
  if(dow===0) return 0;
  if(dow===6) return poisson(1.2);
  return poisson(dow===1||dow===2 ? 6 : 4.5);      // จันทร์-อังคารคนเยอะ
}
function randomTime(base){
  const mins = 8*60+30 + Math.floor(Math.pow(rnd(),1.4)*(7*60));  // 08:30–15:30 หนักช่วงเช้า
  return new Date(base.getTime() + mins*60_000);
}

/* ---------- สร้างการมา ---------- */
async function main(){
  let cfg;
  try{ const d=await (await fetch(CFGURL)).json(); cfg=mergeCfg(d.cfg); console.error('ใช้ config จาก', CFGURL); }
  catch{ cfg=structuredClone(DEFAULT_CFG); console.error('ใช้ config ค่าเริ่มต้น'); }

  const today = new Date(); today.setUTCHours(0,0,0,0);
  const start = new Date(today.getTime() - DAYS*86400_000);
  const visits=[]; const people=[];

  for(let d=new Date(start); d<=today; d=new Date(d.getTime()+86400_000)){
    // base = 00:00 เวลาไทย = 17:00 UTC วันก่อน
    const baseTH = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), -7));
    const n = dailyVolume(baseTH.getTime()+12*3600_000 > today.getTime()+86400_000 ? d : new Date(baseTH.getTime()+12*3600_000));
    for(let i=0;i<n;i++){
      const t = randomTime(baseTH);
      if(t > new Date()) continue;
      // 35% เป็นคนเดิมที่มาซ้ำ (ถ้ามีคนที่มาเกิน 3 สัปดาห์แล้ว)
      const eligible = people.filter(p=> t - p.lastVisit > 21*86400_000 && p.visits<4);
      let p;
      if(eligible.length && rnd()<0.35){ p=pick(eligible); }
      else { p=makePerson(); p.visits=0; people.push(p); }
      // ครั้งถัดไปอิงคำตอบครั้งก่อน: ส่วนใหญ่ดีขึ้นเล็กน้อย บางส่วนเท่าเดิม บางส่วนแย่ลง
      let answers;
      if(p.visits>0){
        const r=rnd(); const delta = r<0.6 ? -(0.4+rnd()*0.6) : r<0.85 ? 0 : (0.3+rnd()*0.5);
        answers = p.lastAnswers.map(a=>clamp(Math.round(a + delta + (rnd()-0.5)*0.9), 0, 3));
      }else answers = sampleAnswers(p.profile.mean, 0);
      p.visits++; p.lastVisit=t; p.lastAnswers=answers;
      visits.push({t, p, answers, name: displayName(p)});
    }
  }
  visits.sort((a,b)=>a.t-b.t);

  /* เลขที่รายเดือน */
  const counters={...START};
  const rows = visits.map(v=>{
    const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'2-digit',month:'2-digit'}).formatToParts(v.t).reduce((a,x)=>(a[x.type]=x.value,a),{});
    const key=`${p.year}${p.month}`; counters[key]=(counters[key]||0)+1;
    const id=`${ID_PREFIX}-${key}-${String(counters[key]).padStart(3,'0')}`;
    const intake={name:v.name, dhatu:v.p.dhatu, month:String(v.p.month)};
    const model=computeReport(cfg, v.answers, intake, {id, date:v.t});
    model.mock=true;
    return {id, key, model, intake, answers:v.answers, t:v.t};
  });

  /* SQL */
  const q = s => `'${String(s).replace(/'/g,"''")}'`;
  const stmts = rows.map(r=>{
    const m=r.model;
    const domains=Object.fromEntries(m.domains.map(d=>[d.key,d.pct]));
    const elements=Object.fromEntries(m.elements.map(e=>[e.key,e.pct]));
    return `INSERT OR IGNORE INTO results (id,created_at,local_date,name,name_key,dhatu,birth_month,total,max_score,balance,tier_key,tier_label,answers,domains,elements,model) VALUES (${[
      q(r.id), q(m.createdAt), q(localDate(r.t)), q(r.intake.name), q(nameKey(r.intake.name)), q(r.intake.dhatu), Number(r.intake.month),
      m.total, m.max, m.balance, q(m.tier.key), q(m.tier.label), q(JSON.stringify(r.answers)), q(JSON.stringify(domains)), q(JSON.stringify(elements)), q(JSON.stringify(m))
    ].join(',')});`;
  });

  mkdirSync(OUT,{recursive:true});
  const CH=40; let files=[];
  for(let i=0;i<stmts.length;i+=CH){ const f=`${OUT}/seed-${String(i/CH+1).padStart(3,'0')}.sql`; writeFileSync(f, stmts.slice(i,i+CH).join('\n')+'\n'); files.push(f); }
  // ตัวนับ: ตั้งให้ ≥ เลขสูงสุดที่ใช้ (กันเลขซ้ำกับของจริงที่มีอยู่)
  const cnt = Object.entries(counters).map(([k,v])=>`INSERT INTO counters(key,value) VALUES('${k}',${v}) ON CONFLICT(key) DO UPDATE SET value=MAX(value, ${v});`).join('\n');
  writeFileSync(`${OUT}/seed-counters.sql`, cnt+'\n'); files.push(`${OUT}/seed-counters.sql`);

  const tiers={}; rows.forEach(r=>tiers[r.model.tier.key]=(tiers[r.model.tier.key]||0)+1);
  const repeat = people.filter(p=>p.visits>1).length;
  console.error(`สร้าง ${rows.length} รายการ · ${people.length} คน (มาซ้ำ ${repeat} คน) · ${Object.entries(counters).map(([k,v])=>k+':'+v).join(' ')} · กลุ่มเสี่ยง ${JSON.stringify(tiers)}`);
  console.log(files.join('\n'));
}
main();
