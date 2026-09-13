/**
 * editor.js — หน้าแก้ไขคำถาม เกณฑ์ การแปรผล ตารางกิจวัตร บริการ และหัวรายงาน
 * mountEditor(container, cfg, {onChange}) — แก้ค่าใน cfg โดยตรง แล้วเรียก onChange() ทุกครั้งที่มีการเปลี่ยน
 */
import { maxScore } from './core.js';

const TABS=[
  ['q',   'คำถาม'],
  ['scale','เกณฑ์การให้คะแนน'],
  ['tier','การแปรผล / กลุ่มเสี่ยง'],
  ['routine','ตารางกิจวัตร'],
  ['svc', 'บริการที่แนะนำ'],
  ['rep', 'หัวรายงาน / ตัวชี้วัด']
];

export function mountEditor(container, cfg, {onChange=()=>{}}={}){
  let CFG=cfg, edTab='q', edTier=0;
  const els={
    tabs: el('div',{class:'ed-tabs'}),
    body: el('div',{class:'ed-body'})
  };
  container.innerHTML='';
  container.appendChild(els.tabs); container.appendChild(els.body);

function el(tag,props={},kids=[]){
  const n=document.createElement(tag);
  for(const k in props){
    if(k==='class') n.className=props[k];
    else if(k==='html') n.innerHTML=props[k];
    else if(k==='text') n.textContent=props[k];
    else if(k.startsWith('on')) n[k]=props[k];
    else n.setAttribute(k,props[k]);
  }
  (Array.isArray(kids)?kids:[kids]).forEach(k=>k && n.appendChild(k));
  return n;
}
function fld(label,value,oninput,{type='text',rows=0,opts=null}={}){
  const wrap=el('div');
  if(label) wrap.appendChild(el('label',{class:'ed-lab',text:label}));
  let inp;
  if(opts){
    inp=el('select');
    opts.forEach(([v,t])=>{const o=el('option',{value:v,text:t}); inp.appendChild(o)});
    inp.value=value;
    inp.onchange=e=>{oninput(e.target.value); onChange()};
  }else if(rows){
    inp=el('textarea',{rows});
    inp.value=value;
    inp.oninput=e=>{oninput(e.target.value); onChange()};
  }else{
    inp=el('input',{type});
    inp.value=value;
    inp.oninput=e=>{oninput(type==='number'?Number(e.target.value):e.target.value); onChange()};
  }
  wrap.appendChild(inp);
  return wrap;
}
function iconBtn(txt,title,fn,cls=''){
  return el('button',{class:'ico '+cls,type:'button',title,text:txt,onclick:fn});
}
function moveItem(arr,i,d){
  const j=i+d; if(j<0||j>=arr.length) return;
  [arr[i],arr[j]]=[arr[j],arr[i]]; onChange(); render();
}

function render(){
  const tabs=els.tabs; tabs.innerHTML='';
  TABS.forEach(([k,t])=>tabs.appendChild(
    el('button',{class:'ed-tab'+(edTab===k?' on':''),type:'button',text:t,
                 onclick:()=>{edTab=k; render()}})));
  const b=els.body; b.innerHTML='';
  ({q:paneQ, scale:paneScale, tier:paneTier, routine:paneRoutine, svc:paneSvc, rep:paneRep})[edTab](b);
}

/* ---- คำถาม ---- */
function paneQ(b){
  b.appendChild(el('div',{class:'hintbox',html:
    'แก้ข้อความคำถาม ย้ายลำดับ เพิ่มหรือลบข้อได้ตามต้องการ · <b>หมวด</b> คือหน้าที่คำถามจะไปปรากฏ · '+
    '<b>ธาตุ</b> ใช้คำนวณแถบ “การประเมินสภาวะธาตุ ๔” · <b>ป้ายพิเศษ</b> ตั้งเป็น “คุณภาพการนอน” '+
    'กับข้อที่ถามเรื่องการนอน เพื่อให้รายงานดึงไปแสดงในช่องคุณภาพการนอนหลับ'}));

  const gcard=el('div',{class:'ed-card'},[el('h3',{text:'หมวด (หน้าของแบบสอบถาม)'})]);
  CFG.groups.forEach((g,i)=>{
    const it=el('div',{class:'ed-item'});
    const top=el('div',{class:'top'},[
      el('span',{class:'n',text:`หน้า ${i+2}`}), el('span',{class:'sp'}),
      iconBtn('↑','เลื่อนขึ้น',()=>moveItem(CFG.groups,i,-1)),
      iconBtn('↓','เลื่อนลง',()=>moveItem(CFG.groups,i,1))
    ]);
    it.appendChild(top);
    it.appendChild(el('div',{class:'cols2'},[
      fld('ชื่อหมวด', g.name, v=>g.name=v),
      fld('คำในวงเล็บบนรายงาน', g.short, v=>g.short=v)
    ]));
    it.appendChild(fld('คำอธิบายใต้หัวเรื่อง', g.sub, v=>g.sub=v));
    gcard.appendChild(it);
  });
  b.appendChild(gcard);

  const qcard=el('div',{class:'ed-card'},[
    el('h3',{},[document.createTextNode('คำถาม'),
      el('span',{class:'tag',text:`${CFG.questions.length} ข้อ · เต็ม ${maxScore(CFG)} คะแนน`})])]);
  CFG.questions.forEach((q,i)=>{
    const it=el('div',{class:'ed-item'});
    it.appendChild(el('div',{class:'top'},[
      el('span',{class:'n',text:`ข้อ ${i+1}`}), el('span',{class:'sp'}),
      iconBtn('↑','เลื่อนขึ้น',()=>moveItem(CFG.questions,i,-1)),
      iconBtn('↓','เลื่อนลง',()=>moveItem(CFG.questions,i,1)),
      iconBtn('✕','ลบข้อนี้',()=>{
        if(CFG.questions.length<=1) return alert('ต้องมีคำถามอย่างน้อย 1 ข้อ');
        if(!confirm('ลบคำถามข้อนี้?')) return;
        CFG.questions.splice(i,1); onChange(); render();
      },'del')
    ]));
    it.appendChild(fld('ข้อความคำถาม', q.t, v=>q.t=v, {rows:2}));
    it.appendChild(el('div',{class:'cols3'},[
      fld('หมวด', q.g, v=>{q.g=v; render()}, {opts:CFG.groups.map(g=>[g.key,g.name])}),
      fld('ธาตุที่เกี่ยวข้อง', q.el, v=>q.el=v, {opts:CFG.elements.map(e=>[e.key,e.name])}),
      fld('ป้ายพิเศษ', q.tag||'', v=>q.tag=v, {opts:[['','— ไม่มี —'],['sleep','คุณภาพการนอน']]})
    ]));
    qcard.appendChild(it);
  });
  qcard.appendChild(el('button',{class:'btn ghost sm',type:'button',text:'+ เพิ่มคำถาม',
    onclick:()=>{
      CFG.questions.push({g:CFG.groups[0].key, el:CFG.elements[0].key, tag:'', t:'คำถามใหม่'});
      onChange(); render();
    }}));
  b.appendChild(qcard);
}

/* ---- เกณฑ์คะแนน ---- */
function paneScale(b){
  b.appendChild(el('div',{class:'hintbox',html:
    'ตัวเลือกคำตอบของทุกข้อ · คะแนนคือลำดับของตัวเลือก (เริ่มที่ 0) '+
    'เพิ่มหรือลดตัวเลือกได้ คะแนนเต็มจะคำนวณใหม่ให้อัตโนมัติ'}));
  const c=el('div',{class:'ed-card'},[
    el('h3',{},[document.createTextNode('ตัวเลือกคำตอบ'),
      el('span',{class:'tag',text:`ข้อละ 0–${CFG.scale.length-1} คะแนน`})])]);
  CFG.scale.forEach((s,i)=>{
    const it=el('div',{class:'ed-item'});
    it.appendChild(el('div',{class:'top'},[
      el('span',{class:'n',text:`${i} คะแนน`}), el('span',{class:'sp'}),
      iconBtn('✕','ลบตัวเลือก',()=>{
        if(CFG.scale.length<=2) return alert('ต้องมีอย่างน้อย 2 ตัวเลือก');
        CFG.scale.splice(i,1); onChange(); render();
      },'del')
    ]));
    it.appendChild(el('div',{class:'cols2'},[
      fld('ข้อความหลัก', s.s, v=>s.s=v),
      fld('คำอธิบายย่อย', s.d, v=>s.d=v)
    ]));
    c.appendChild(it);
  });
  c.appendChild(el('button',{class:'btn ghost sm',type:'button',text:'+ เพิ่มตัวเลือก',
    onclick:()=>{CFG.scale.push({s:'ตัวเลือกใหม่',d:''}); onChange(); render()}}));
  b.appendChild(c);
}

/* ---- การแปรผล ---- */
function paneTier(b){
  b.appendChild(el('div',{class:'hintbox',html:
    `คะแนนเต็มปัจจุบันคือ <b>${maxScore(CFG)}</b> คะแนน · ตั้งช่วงคะแนนของแต่ละกลุ่มให้ครอบคลุม 0–${maxScore(CFG)} `+
    'ข้อความในนี้จะไปแสดงบนรายงานทั้งหมด'}));

  CFG.tiers.forEach((t,i)=>{
    const c=el('div',{class:'ed-card'},[
      el('h3',{},[document.createTextNode(t.label||'กลุ่ม '+(i+1)),
        el('span',{class:'tag',text:`${t.min}–${t.max} คะแนน`})])]);
    c.appendChild(el('div',{class:'cols3'},[
      fld('คะแนนต่ำสุด', t.min, v=>t.min=v, {type:'number'}),
      fld('คะแนนสูงสุด', t.max, v=>t.max=v, {type:'number'}),
      fld('สีแสดงผล', t.color, v=>t.color=v,
          {opts:[['green','เขียว (ปกติ)'],['amber','เหลือง (เฝ้าระวัง)'],['red','แดง (เสี่ยง)']]})
    ]));
    c.appendChild(fld('ชื่อกลุ่ม (แสดงในช่องสถานะปัจจุบัน)', t.label, v=>{t.label=v}));
    c.appendChild(fld('ข้อสรุปเชิงวิเคราะห์', t.summary, v=>t.summary=v, {rows:4}));
    c.appendChild(fld('แนวทางหลัก', t.approach, v=>t.approach=v, {rows:2}));
    c.appendChild(fld('หัวข้อตารางกิจวัตร', t.routineTitle, v=>t.routineTitle=v));
    b.appendChild(c);
  });

  const d=el('div',{class:'ed-card'},[el('h3',{text:'คำตัดสินรายหมวด (ตารางธรรมนามัย)'})]);
  d.appendChild(el('div',{class:'hintbox',text:'อ่านจากบนลงล่าง: ใช้แถวแรกที่ร้อยละไม่เกินค่าที่กำหนด'}));
  CFG.domainStates.forEach((s,i)=>{
    d.appendChild(el('div',{class:'cols3'},[
      fld(i===0?'ร้อยละไม่เกิน':'', s.maxPct, v=>s.maxPct=v, {type:'number'}),
      fld(i===0?'ข้อความ':'', s.t, v=>s.t=v),
      fld(i===0?'สี':'', s.c, v=>s.c=v, {opts:[['green','เขียว'],['','ปกติ (ดำ)'],['amber','เหลือง'],['red','แดง']]})
    ]));
  });
  b.appendChild(d);

  const e2=el('div',{class:'ed-card'},[el('h3',{text:'สภาวะธาตุ ๔ (แถบสถานะ)'})]);
  CFG.elementStates.forEach((s,i)=>{
    e2.appendChild(el('div',{class:'cols3'},[
      fld(i===0?'ร้อยละไม่เกิน':'', s.maxPct, v=>s.maxPct=v, {type:'number'}),
      fld(i===0?'ข้อความ':'', s.t, v=>s.t=v),
      fld(i===0?'สี':'', s.c, v=>s.c=v, {opts:[['green','เขียว'],['amber','เหลือง'],['red','แดง']]})
    ]));
  });
  b.appendChild(e2);
}

/* ---- ตารางกิจวัตร ---- */
function tierPicker(onPick){
  const row=el('div',{class:'ed-card'},[el('h3',{text:'เลือกกลุ่มเสี่ยงที่จะแก้ไข'})]);
  const wrap=el('div',{class:'ed-tabs',style:'padding:0;margin:0'});
  CFG.tiers.forEach((t,i)=>wrap.appendChild(
    el('button',{class:'ed-tab'+(edTier===i?' on':''),type:'button',text:t.label,
                 onclick:()=>{edTier=i; render()}})));
  row.appendChild(wrap);
  return row;
}
function paneRoutine(b){
  b.appendChild(tierPicker());
  const t=CFG.tiers[edTier];
  b.appendChild(el('div',{class:'hintbox',html:
    'ช่องกิจกรรมรองรับ HTML อย่างง่าย เช่น <code>&lt;b&gt;ตัวหนา&lt;/b&gt;</code> และ <code>&lt;br&gt;</code> ขึ้นบรรทัดใหม่ · '+
    'ยิ่งเพิ่มแถวมาก รายงานอาจยาวเกิน 1 หน้า A4'}));
  const c=el('div',{class:'ed-card'},[
    el('h3',{},[document.createTextNode(t.routineTitle),
      el('span',{class:'tag',text:`${t.routine.length} ช่วงเวลา`})])]);
  t.routine.forEach((r,i)=>{
    const it=el('div',{class:'ed-item'});
    it.appendChild(el('div',{class:'top'},[
      el('span',{class:'n',text:`ช่วงที่ ${i+1}`}), el('span',{class:'sp'}),
      iconBtn('↑','เลื่อนขึ้น',()=>moveItem(t.routine,i,-1)),
      iconBtn('↓','เลื่อนลง',()=>moveItem(t.routine,i,1)),
      iconBtn('✕','ลบแถวนี้',()=>{
        if(!confirm('ลบช่วงเวลานี้?')) return;
        t.routine.splice(i,1); onChange(); render();
      },'del')
    ]));
    it.appendChild(el('div',{class:'cols2'},[
      fld('เวลา', r[0], v=>r[0]=v),
      fld('ชื่อช่วง (กาลสมุฏฐาน)', r[1], v=>r[1]=v)
    ]));
    it.appendChild(fld('กิจกรรมส่งเสริมสุขภาพบำบัด', r[2], v=>r[2]=v, {rows:4}));
    c.appendChild(it);
  });
  c.appendChild(el('button',{class:'btn ghost sm',type:'button',text:'+ เพิ่มช่วงเวลา',
    onclick:()=>{t.routine.push(['00:00 - 00:00','','']); onChange(); render()}}));
  b.appendChild(c);
}

/* ---- บริการ ---- */
function paneSvc(b){
  b.appendChild(tierPicker());
  const t=CFG.tiers[edTier];
  const c=el('div',{class:'ed-card'},[el('h3',{text:'บริการที่แนะนำสำหรับ '+t.label})]);
  t.services.forEach((s,i)=>{
    const it=el('div',{class:'ed-item'});
    it.appendChild(el('div',{class:'top'},[
      el('span',{class:'n',text:`รายการที่ ${i+1}`}), el('span',{class:'sp'}),
      iconBtn('↑','เลื่อนขึ้น',()=>moveItem(t.services,i,-1)),
      iconBtn('↓','เลื่อนลง',()=>moveItem(t.services,i,1)),
      iconBtn('✕','ลบ',()=>{t.services.splice(i,1); onChange(); render()},'del')
    ]));
    it.appendChild(el('div',{class:'cols2'},[
      fld('ชื่อบริการ', s[0], v=>s[0]=v),
      fld('รายละเอียดด้านขวา (เช่น 90 นาที)', s[1], v=>s[1]=v)
    ]));
    c.appendChild(it);
  });
  c.appendChild(el('button',{class:'btn ghost sm',type:'button',text:'+ เพิ่มบริการ',
    onclick:()=>{t.services.push(['บริการใหม่','']); onChange(); render()}}));
  b.appendChild(c);
}

/* ---- หัวรายงาน / ตัวชี้วัด ---- */
function paneRep(b){
  const o=CFG.org;
  const c=el('div',{class:'ed-card'},[el('h3',{text:'หัวรายงานและข้อความทั่วไป'})]);
  c.appendChild(el('div',{class:'cols2'},[
    fld('ชื่อแบรนด์ (บนหน้าแบบสอบถาม)', o.brand, v=>o.brand=v),
    fld('คำนำหน้ารหัส ID', o.idPrefix, v=>o.idPrefix=v)
  ]));
  c.appendChild(fld('ชื่อรายงาน', o.title, v=>o.title=v));
  c.appendChild(fld('ชื่อรองใต้หัวรายงาน', o.subtitle, v=>o.subtitle=v));
  c.appendChild(el('div',{class:'cols2'},[
    fld('หัวข้อหน้าข้อมูลผู้รับบริการ', o.intakeTitle, v=>o.intakeTitle=v),
    fld('คำอธิบายหน้าข้อมูลผู้รับบริการ', o.intakeSub, v=>o.intakeSub=v)
  ]));
  c.appendChild(el('div',{class:'cols3'},[
    fld('หัวข้อตารางธรรมนามัย', o.domTitle, v=>o.domTitle=v),
    fld('หัวข้อสภาวะธาตุ', o.elTitle, v=>o.elTitle=v),
    fld('หัวข้อบริการที่แนะนำ', o.svcTitle, v=>o.svcTitle=v)
  ]));
  c.appendChild(fld('หัวข้อกล่องคะแนน', o.scoreTitle, v=>o.scoreTitle=v));
  c.appendChild(fld('หมายเหตุใต้คะแนน', o.scoreNote, v=>o.scoreNote=v, {rows:2}));
  c.appendChild(fld('ข้อความปฏิเสธความรับผิด', o.disclaimer, v=>o.disclaimer=v, {rows:3}));
  c.appendChild(fld('ข้อความท้ายหน้า', o.footer, v=>o.footer=v));
  c.appendChild(fld('ข้อความขอความยินยอม (แสดงก่อนเริ่มทำแบบประเมิน)', o.consent||'', v=>o.consent=v, {rows:2}));
  b.appendChild(c);

  const r=el('div',{class:'ed-card'},[el('h3',{text:'ตัวชี้วัดในตาราง “การประเมินความเสี่ยง”'})]);
  r.appendChild(el('div',{class:'hintbox',text:
    'ผลประเมินคำนวณจากร้อยละของหมวดที่เลือก แล้วแบ่งเป็นระดับตามจำนวนข้อความที่ใส่ (คั่นด้วยเครื่องหมายจุลภาค) เรียงจากดีที่สุดไปแย่ที่สุด'}));
  CFG.risks.forEach((rk,i)=>{
    const it=el('div',{class:'ed-item'});
    it.appendChild(el('div',{class:'top'},[
      el('span',{class:'n',text:`ตัวชี้วัดที่ ${i+1}`}), el('span',{class:'sp'}),
      iconBtn('✕','ลบ',()=>{CFG.risks.splice(i,1); onChange(); render()},'del')
    ]));
    it.appendChild(el('div',{class:'cols2'},[
      fld('ชื่อตัวชี้วัด', rk.name, v=>rk.name=v),
      fld('คำนวณจากหมวด', rk.from, v=>rk.from=v, {opts:CFG.groups.map(g=>[g.key,g.name])})
    ]));
    it.appendChild(fld('ระดับผลประเมิน (คั่นด้วย ,)', rk.levels.join(', '),
      v=>rk.levels=v.split(',').map(s=>s.trim()).filter(Boolean)));
    r.appendChild(it);
  });
  r.appendChild(el('button',{class:'btn ghost sm',type:'button',text:'+ เพิ่มตัวชี้วัด',
    onclick:()=>{CFG.risks.push({name:'ตัวชี้วัดใหม่',from:CFG.groups[0].key,levels:['ปกติ','เฝ้าระวัง','สูง']});
                 onChange(); render()}}));
  b.appendChild(r);

  const s=el('div',{class:'ed-card'},[el('h3',{text:'ช่องอื่นในเป้าหมายการปรับสมดุล'})]);
  s.appendChild(el('div',{class:'cols2'},[
    fld('ระดับความเครียดคำนวณจากหมวด', CFG.stressFrom, v=>CFG.stressFrom=v,
        {opts:CFG.groups.map(g=>[g.key,g.name])}),
    fld('ระดับคุณภาพการนอน (คั่นด้วย ,)', CFG.sleepLevels.join(', '),
        v=>CFG.sleepLevels=v.split(',').map(x=>x.trim()).filter(Boolean))
  ]));
  b.appendChild(s);
}


  render();
  return { render, setConfig(c){ CFG=c; render(); } };
}
