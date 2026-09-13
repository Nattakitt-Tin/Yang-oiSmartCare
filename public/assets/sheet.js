/**
 * sheet.js — แปลง model จาก computeReport() เป็น HTML ของรายงาน A4
 * ใช้ทั้งหน้าคนไข้ (แสดงผลทันที) และหน้าแอดมิน (เปิดรายงานเก่า)
 */
export const esc = s => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const CLR = {green:'c-green', amber:'c-amber', red:'c-red', '':''};
const BG  = {green:'bg-green', amber:'bg-amber', red:'bg-red', '':'bg-green'};

export function sheetHTML(m){
  const o=m.org;
  return `
    <div class="rp-head">
      <h1>${esc(o.title)}</h1>
      <p>${esc(o.subtitle)}</p>
    </div>
    <div class="rp-info">
      <div><b>ID:</b> ${esc(m.id||'—')}</div>
      <div><b>ชื่อ:</b> ${esc(m.intake.name||'—')}</div>
      <div><b>ธาตุเจ้าเรือน:</b> ${esc(m.intake.dhatu||'—')}</div>
      <div><b>เวลาทดสอบ:</b> ${esc(m.timeText)}</div>
    </div>
    <div class="rp-summary">
      <b>ข้อสรุปเชิงวิเคราะห์:</b> ${esc(m.tier.summary)}<br>
      <b>แนวทางหลัก:</b> ${esc(m.tier.approach)}
    </div>
    <div class="cols">
      <div class="col-l">
        <h2 class="sec">${esc(o.domTitle)}</h2>
        <table class="rt">
          <thead><tr><th>องค์ประกอบ</th><th>คะแนนที่ได้</th><th>ร้อยละ (%)</th><th>การประเมิน</th></tr></thead>
          <tbody>${m.domains.map(d=>`
            <tr><td>${esc(d.name)}${d.short?' ('+esc(d.short)+')':''}</td>
                <td class="c">${d.score.toFixed(1)} (0.0-${d.max.toFixed(1)})</td>
                <td class="c">${d.pct.toFixed(1)}</td>
                <td class="c ${CLR[d.verdict.c]||''}"><b>${esc(d.verdict.t)}</b></td></tr>`).join('')}
          </tbody>
        </table>
        <h2 class="sec">${esc(o.elTitle)}</h2>
        ${m.elements.map(e=>`
          <div class="el">
            <div class="el-top"><span class="nm">${esc(e.name)}</span><span class="st ${CLR[e.state.c]||''}">${esc(e.state.t)}</span></div>
            <div class="bar"><i class="${BG[e.state.c]||''}" style="width:${Math.max(e.pct,4)}%"></i></div>
          </div>`).join('')}
        <h2 class="sec">${esc(m.tier.routineTitle)}</h2>
        <table class="routine">
          <thead><tr><th style="width:25%">เวลา (กาลสมุฏฐาน)</th><th>กิจกรรมส่งเสริมสุขภาพบำบัด (ตามหลักธรรมนามัย)</th></tr></thead>
          <tbody>${m.tier.routine.map(([tm,ph,act])=>`
            <tr><td class="tm">${esc(tm)}${ph?`<em>(${esc(ph)})</em>`:''}</td><td>${act}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="col-r">
        <div class="scorebox">
          <h3>${esc(o.scoreTitle)}</h3>
          <div class="big"><span>${m.balance}</span><span class="unit"> / 100 คะแนน</span></div>
          <p class="fn">${esc(o.scoreNote)}</p>
        </div>
        <h2 class="sec">เป้าหมายการปรับสมดุล</h2>
        <div class="kv"><span class="k">สถานะปัจจุบัน</span><span class="v ${CLR[m.tier.color]||''}">${esc(m.tier.label)}</span></div>
        <div class="kv"><span class="k">ระดับความเครียดสะสม</span><span class="v ${CLR[m.stress.c]}">${esc(m.stress.txt)} (${m.stress.pct}%)</span></div>
        <div class="kv"><span class="k">คุณภาพการนอนหลับ</span><span class="v ${CLR[m.sleep.c]}">${esc(m.sleep.txt)}</span></div>
        <h2 class="sec">การประเมินความเสี่ยง</h2>
        <table class="rt dark">
          <thead><tr><th>ตัวชี้วัด</th><th>ผลประเมิน</th></tr></thead>
          <tbody>${m.risks.map(r=>`
            <tr><td>${esc(r.name)}</td><td class="c ${r.bad?'c-red':''}"><b>${esc(r.level)}</b></td></tr>`).join('')}
          </tbody>
        </table>
        <h2 class="sec">${esc(o.svcTitle)}</h2>
        ${m.tier.services.map(([k,v])=>`
          <div class="kv"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
        <p class="disclaimer">${esc(o.disclaimer)}</p>
      </div>
    </div>
    <div class="rp-foot">
      <span>${esc(o.footer)}</span>
      <span>เลขที่รายงาน ${esc(m.id||'—')}</span>
    </div>`;
}
