/**
 * core.js — ตรรกะกลางที่ใช้ร่วมกันระหว่างหน้าเว็บ (เบราว์เซอร์) และ Pages Functions (เซิร์ฟเวอร์)
 * ไม่มีการแตะ DOM ในไฟล์นี้ เพื่อให้รันได้ทั้งสองฝั่ง
 */

export const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                       'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
export const DHATU  = ['วาตะ (ลม)','ปิตตะ (ไฟ)','อาโป (น้ำ)','ปถวี (ดิน)'];

/* ธาตุเจ้าเรือนตามเดือนเกิด (ตำราแพทย์แผนไทย) */
export function dhatuOfMonth(m){
  const n=Number(m);
  if(Number.isNaN(n)) return DHATU[0];
  return n<=2 ? 'ปิตตะ (ไฟ)' : n<=5 ? 'อาโป (น้ำ)' : n<=8 ? 'วาตะ (ลม)' : 'ปถวี (ดิน)';
}

export const DEFAULT_CFG = {
  org:{
    brand:'Yang-oiSmartCare · คลินิกการแพทย์แผนไทย รพ.สต.บ้านยางอ้อย',
    title:'รายงานการวิเคราะห์สมดุลองค์รวม',
    subtitle:'คลินิกการแพทย์แผนไทย รพ.สต.บ้านยางอ้อย',
    footer:'คลินิกการแพทย์แผนไทย รพ.สต.บ้านยางอ้อย',
    idPrefix:'YA',
    scoreTitle:'คะแนนสมดุลองค์รวม',
    scoreNote:'*คะแนนรวมสะท้อนถึงมูลค่าความสมดุลของร่างกายและจิตใจ ผู้ที่อยู่ในภาวะสมดุลจะได้คะแนนเข้าใกล้ 100 คะแนน',
    domTitle:'การวิเคราะห์ธรรมนามัย ๓ ประการ',
    elTitle:'การประเมินสภาวะธาตุ ๔',
    svcTitle:'บริการที่แนะนำ',
    disclaimer:'*รายงานนี้ประมวลผลตามหลักเวชกรรมแผนไทยประยุกต์ เพื่อเป็นแนวทางในการดูแลสุขภาพเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์แผนปัจจุบัน',
    intakeTitle:'ข้อมูลผู้รับบริการ',
    intakeSub:'กรอกข้อมูลเบื้องต้นก่อนเริ่มแบบประเมิน ข้อมูลนี้จะแสดงบนหัวรายงาน',
    consent:'ข้าพเจ้ายินยอมให้คลินิกเก็บรวบรวมชื่อและผลการประเมินสุขภาพนี้ เพื่อใช้ในการดูแลสุขภาพและติดตามผลของข้าพเจ้าเท่านั้น'
  },
  scale:[
    {s:'ไม่เคยมี',   d:'สุขภาพดีประจำ'},
    {s:'นานๆ ครั้ง', d:'1–2 ครั้ง/สัปดาห์'},
    {s:'บ่อย',       d:'3–4 ครั้ง/สัปดาห์'},
    {s:'ทุกวัน',     d:'กระทบชีวิตประจำวัน'}
  ],
  elements:[
    {key:'earth', name:'ปฐวีธาตุ (ดิน)'},
    {key:'water', name:'อาโปธาตุ (น้ำ)'},
    {key:'wind',  name:'วาโยธาตุ (ลม)'},
    {key:'fire',  name:'เตโชธาตุ (ไฟ)'}
  ],
  groups:[
    {key:'kaya',    name:'กายานามัย',  short:'โครงสร้าง',  sub:'โครงสร้างร่างกาย การเคลื่อนไหว และความตึงตัวของกล้ามเนื้อ'},
    {key:'jitta',   name:'จิตตานามัย', short:'อารมณ์',     sub:'อารมณ์ ความเครียด การพักผ่อนของจิตใจ และคุณภาพการนอน'},
    {key:'chivita', name:'ชีวิตานามัย', short:'พฤติกรรม',  sub:'พฤติกรรมการกิน การขับถ่าย และสภาพแวดล้อมรอบตัว'}
  ],
  questions:[
    {g:'kaya',    el:'wind',  tag:'', t:'การอยู่ในอิริยาบถเดิมนานเกิน 2 ชั่วโมง หรือมีอาการชา ยึดติด เคลื่อนไหวไม่คล่องตัว'},
    {g:'kaya',    el:'earth', tag:'', t:'อาการปวด ตึง ร้าว บริเวณกล้ามเนื้อและข้อต่อ'},
    {g:'kaya',    el:'earth', tag:'', t:'ขาดการยืดเหยียดหรือออกกำลังกาย'},
    {g:'jitta',   el:'fire',  tag:'', t:'ความรู้สึกหงุดหงิด เครียด หรือวิตกกังวล'},
    {g:'jitta',   el:'water', tag:'sleep', t:'ปัญหาการนอนหลับ (หลับยาก, ตื่นกลางดึก, ตื่นมาไม่สดชื่น)'},
    {g:'jitta',   el:'wind',  tag:'', t:'การขาดช่วงเวลาพักผ่อนจิตใจหรือการทำสมาธิ'},
    {g:'chivita', el:'fire',  tag:'', t:'การทานอาหารรสจัด ของทอด หรือทานไม่ตรงเวลา'},
    {g:'chivita', el:'water', tag:'', t:'ปัญหาการขับถ่าย หรือการกลั้นอุจจาระ/ปัสสาวะ'},
    {g:'chivita', el:'wind',  tag:'', t:'การอยู่ในสภาพแวดล้อมที่ร้อนจัด เย็นจัด หรืออากาศไม่ถ่ายเท'}
  ],
  domainStates:[
    {maxPct:38,  t:'สมดุลดี',  c:'green'},
    {maxPct:72,  t:'มาตรฐาน',  c:''},
    {maxPct:100, t:'เฝ้าระวัง', c:'red'}
  ],
  elementStates:[
    {maxPct:24,  t:'ปกติ',           c:'green'},
    {maxPct:49,  t:'หย่อน',           c:'amber'},
    {maxPct:74,  t:'กำเริบเล็กน้อย',  c:'amber'},
    {maxPct:100, t:'กำเริบ',          c:'red'}
  ],
  stressFrom:'jitta',
  risks:[
    {name:'กลุ่มอาการออฟฟิศซินโดรม', from:'kaya',    levels:['ไม่พบ','ระยะเริ่มต้น','ระยะชัดเจน','ระยะเรื้อรัง']},
    {name:'ภาวะหทัยวาต (ความกังวล)', from:'jitta',   levels:['ปกติ','เล็กน้อย','ปานกลาง','สูง']},
    {name:'ไฟย่อยอาหาร (ปาจกเตโช)',  from:'chivita', levels:['ปกติ','อ่อนกำลัง','กำเริบ','พิการ']}
  ],
  sleepLevels:['ดีมาก','ปกติ','ต่ำกว่าเกณฑ์','ต่ำกว่าเกณฑ์มาก'],
  tiers:[
    {
      key:'green', min:0, max:9, color:'green', label:'กลุ่มเสี่ยงน้อย (0-9)',
      summary:'ร่างกายและจิตใจอยู่ในเกณฑ์สมดุลดี ธาตุทั้ง 4 ทำงานประสานกันได้ดี เป้าหมายของการดูแลจึงไม่ใช่การรักษาอาการเจ็บป่วย แต่คือการส่งเสริมสุขภาพ (Health Promotion) และการชะลอวัย (Longevity) เพื่อรักษาสมดุลธาตุให้อยู่ในสภาวะที่เหมาะสมไปนานๆ',
      approach:'ส่งเสริม — แนะนำการดูแลสุขภาพพื้นฐานเพื่อการผ่อนคลาย หรือชาสมุนไพรบำรุงธาตุ',
      routineTitle:'ตารางกิจวัตรประจำวัน: สมดุลแห่งกาลเวลา',
      routine:[
        ['06:00 - 08:00','ช่วงเสมหะ','<b>ชีวิตานามัย:</b> ดื่มน้ำอุ่น 1–2 แก้วทันทีที่ตื่น เพื่อกระตุ้นลำไส้และขับถ่ายให้เป็นเวลา<br><b>กายานามัย:</b> ยืดเหยียดด้วยท่าฤๅษีดัดตนเบาๆ เช่น ท่าแก้เกียจ 5–10 นาที เพื่อเปิดประตูลม'],
        ['08:00 - 10:00','ช่วงเสมหะ','<b>ชีวิตานามัย:</b> ทานมื้อเช้าที่มีรสอุ่น ขม หรือฝาดจางๆ ลดความหนืดของเสมหะ หลีกเลี่ยงของมันทอด'],
        ['10:00 - 14:00','ช่วงปิตตะ','<b>ชีวิตานามัย:</b> ทานมื้อเที่ยงเป็นมื้อหลัก หลีกเลี่ยงอาหารรสจัดจ้านที่จะไปสุมไฟปิตตะ<br><b>จิตตานามัย:</b> หากทำงานหน้าคอมพิวเตอร์ ควรพักสายตา 5 นาที ทุกๆ ชั่วโมง หายใจเข้าออกลึกๆ'],
        ['14:00 - 18:00','ช่วงวาตะ','<b>กายานามัย:</b> ช่วงเวลาที่เหมาะสมที่สุดในการออกกำลังกายหรือทำกิจกรรมที่ต้องเคลื่อนไหว<br><b>ชีวิตานามัย:</b> หากล้า จิบชาสมุนไพรกลิ่นหอม เช่น ชาดอกไม้ ชามะลิ เพื่อคุมลมไม่ให้ตีขึ้นเบื้องบน'],
        ['18:00 - 20:00','ช่วงเสมหะ','<b>ชีวิตานามัย:</b> มื้อเย็นย่อยง่าย รสจืดหรือเย็น เช่น แกงจืด ผักต้ม ไม่ควรทานอิ่มเกินไป<br><b>กายานามัย:</b> อาบน้ำอุ่นเพื่อคลายความตึงเครียดของกล้ามเนื้อ'],
        ['20:00 - 22:00','ช่วงเข้าสู่ปิตตะ','<b>จิตตานามัย:</b> งดรับสื่อดิจิทัล ทำสมาธิหรือฟังเสียงธรรมชาติ 15 นาที<br><b>ชีวิตานามัย:</b> เข้านอนก่อน 22:00 น. ให้ธาตุไฟทำงานซ่อมแซมร่างกายระหว่างหลับได้เต็มที่']
      ],
      services:[['1. นวดผ่อนคลายส่งเสริมสุขภาพ','60 นาที'],['2. อบไอน้ำสมุนไพร','20 นาที'],['3. ชาบำรุงธาตุเจ้าเรือน','สูตรตามธาตุ']]
    },
    {
      key:'yellow', min:10, max:18, color:'amber', label:'กลุ่มเสี่ยงปานกลาง (10-18)',
      summary:'ร่างกายและจิตใจเริ่มส่งสัญญาณความไม่สมดุลทางธาตุอย่างเห็นได้ชัด เช่น ลมพัดติดขัด (ตึงบ่า ไหล่ ปวดเมื่อยจากออฟฟิศซินโดรม) ธาตุไฟกำเริบ (เครียดสะสม ท้องอืด ย่อยอาหารไม่ดี) และลมในหัวใจ (หทัยวาต) แปรปรวน ทำให้นอนหลับไม่สนิท',
      approach:'ป้องกัน — นวดปรับสมดุลธาตุ จ่ายท่าฤๅษีดัดตนเฉพาะส่วน ปรับพฤติกรรมการกินตามธาตุเจ้าเรือน',
      routineTitle:'ตารางกิจวัตรประจำวัน: บำบัดและปรับสมดุล',
      routine:[
        ['06:00 - 08:00','ช่วงเสมหะ','<b>กายานามัย (เปิดประตูลม):</b> ดื่มน้ำอุ่นผสมน้ำมะนาวหรือขิงฝานบางๆ เพื่อปลุกไฟย่อย (เตโชธาตุ) · ฝึกท่าฤๅษีดัดตนเฉพาะจุด 15 นาที เน้นท่าแก้ลมขัดข้อ คอ และไหล่ เพื่อระบายลมที่อั้นในเส้นเอ็น'],
        ['08:00 - 10:00','ช่วงเสมหะ','<b>ชีวิตานามัย (ปลุกไฟย่อย):</b> มื้อเช้ามีสมุนไพรรสเผ็ดร้อนอ่อนๆ เช่น ขิง ข่า ตะไคร้ พริกไทย · หลีกเลี่ยงนม เนย หรืออาหารฤทธิ์เย็นจัดที่ทำให้เกิดลมในทางเดินอาหาร'],
        ['10:00 - 14:00','ช่วงปิตตะ','<b>จิตตานามัย (คุมธาตุไฟ):</b> ฝึกปราณายามะ หายใจเข้า–ออกลึกช้าสลับรูจมูก 5 นาที ทุกๆ 2 ชั่วโมง<br><b>ชีวิตานามัย:</b> มื้อเที่ยงเน้นรสจืด เย็น ขม เช่น มะระ ผักบุ้ง แกงจืด เพื่อดับพิษร้อน'],
        ['14:00 - 18:00','ช่วงวาตะ','<b>ชีวิตานามัย (ขับลมปลายปัตคาต):</b> จิบชารสสุขุมหอมขับลม เช่น ชามะตูมผสมตะไคร้ หรือชากะเพราอุ่น<br><b>กายานามัย:</b> ลุกขึ้นยืดเหยียดอย่างน้อย 5 นาทีทุกชั่วโมง เพื่อสลายลมติดขัด'],
        ['18:00 - 20:00','ช่วงเสมหะ','<b>ชีวิตานามัย:</b> มื้อเย็นย่อยง่ายมาก เช่น โจ๊ก แกงเลียง ซุปผัก ไม่ทานเนื้อสัตว์ใหญ่<br><b>กายานามัย:</b> แช่เท้าด้วยน้ำต้มสมุนไพรอุ่น (ขิง ตะไคร้ ผิวมะกรูด เกลือ) 15–20 นาที ดึงความร้อนลงเบื้องล่าง'],
        ['20:00 - 22:00','ช่วงเข้าสู่ปิตตะ','<b>จิตตานามัย (สยบหทัยวาต):</b> งดมือถือและหน้าจอคอมพิวเตอร์เด็ดขาด · นั่งสมาธิรู้ลมหายใจ “อานาปานสติ” 10–15 นาที · เข้านอนไม่เกิน 22:00 น.']
      ],
      services:[['1. นวดปรับสมดุลธาตุ','90 นาที'],['2. ประคบร้อนสมุนไพร','30 นาที'],['3. ชาปรับสมดุลธาตุ','สูตรมะตูม-ตะไคร้']]
    },
    {
      key:'red', min:19, max:27, color:'red', label:'กลุ่มเสี่ยงมาก (19-27)',
      summary:'ร่างกายและจิตใจอยู่ในสภาวะที่ธาตุทั้ง 4 ทำงานผิดปกติอย่างรุนแรง (ธาตุพิการ หรือธาตุกำเริบขั้นสุด) เช่น ปวดเรื้อรังจนรบกวนการใช้ชีวิต นอนไม่หลับติดต่อกันยาวนาน ท้องผูกเรื้อรัง หรือเครียดสะสมจนส่งผลต่อระบบภูมิคุ้มกันและฮอร์โมน',
      approach:'บำบัดรักษา — ต้องได้รับการประเมินเชิงลึก จ่ายยาสมุนไพรรักษาอาการ นวดรักษาเส้นประธาน หรือใช้หัตถการเฉพาะทาง',
      routineTitle:'ตารางกิจวัตรประจำวัน: ฟื้นฟูธาตุเชิงลึก',
      routine:[
        ['06:00 - 08:00','ช่วงเสมหะ','<b>ชีวิตานามัย (ดีท็อกซ์ของเสีย):</b> ดื่มน้ำอุ่นจัด 2 แก้ว หรือจิบชาตรีผลาปรับสมดุลลำไส้ เพื่อกวาดล้างเมือกมันและกระตุ้นการขับถ่ายให้หมดจด<br><b>กายานามัย (คลายเส้นเอ็น):</b> ใช้ลูกประคบร้อนประคบคอ บ่า ไหล่ หรือจุดที่ปวดเรื้อรัง 15 นาที เพื่อสลายลมปลายปัตคาตที่จับตัวแข็ง'],
        ['08:00 - 10:00','ช่วงเสมหะ','<b>ชีวิตานามัย (ฟื้นฟูไฟย่อย):</b> มื้อเช้าย่อยง่ายที่สุด เช่น ข้าวต้ม หรือซุปอุ่นๆ หลีกเลี่ยงอาหารแปรรูป ของทอด ของมัน และผลิตภัณฑ์นมวัวโดยเด็ดขาด'],
        ['10:00 - 14:00','ช่วงปิตตะ','<b>ชีวิตานามัย:</b> ทานมื้อเที่ยงตรงเวลา ห้ามปล่อยให้ท้องว่างจนเกิดลมในกระเพาะ<br><b>จิตตานามัย (ตัดวงจรความเครียด):</b> ละสายตาจากงานทุกๆ 45 นาที หลับตาทำสมาธิบำบัด หรือหายใจเข้าลึก–ออกยาว 3 นาที'],
        ['14:00 - 18:00','ช่วงวาตะ','<b>กายานามัย (หยุดพักการใช้กล้ามเนื้อ):</b> หากปวดรุนแรง ห้ามฝืนยืดเหยียดหรือนวดเค้นเอง ให้ประคบร้อน หรือทานยาสมุนไพรบรรเทาปวดตามที่แพทย์แผนไทยสั่ง<br><b>ชีวิตานามัย:</b> จิบน้ำอุ่นหรือชาฤทธิ์สุขุมตลอดบ่าย ป้องกันภาวะขาดน้ำที่ทำให้เส้นเอ็นแห้งตึง'],
        ['18:00 - 20:00','ช่วงเสมหะ','<b>ชีวิตานามัย (ลดภาระร่างกาย):</b> มื้อเย็นน้อยที่สุดและก่อน 19:00 น. หากไม่หิวสามารถงดมื้อเย็น (IF) เพื่อให้กระเพาะได้พัก<br><b>กายานามัย:</b> อาบน้ำอุ่นจัดหรือแช่น้ำอุ่นทั้งตัว กระตุ้นระบบไหลเวียนเลือด'],
        ['20:00 - 22:00','ช่วงเข้าสู่ปิตตะ','<b>จิตตานามัย (ชัตดาวน์ระบบประสาท):</b> งดหน้าจอทุกชนิดหลัง 20:00 น. · นวดน้ำมันสมุนไพรอุ่นบริเวณฝ่าเท้าและท้ายทอยเบาๆ · จัดห้องนอนให้มืดสนิทและเงียบ เข้านอนทันทีเมื่อง่วง ห้ามฝืนร่างกาย']
      ],
      services:[['1. นวดรักษาเส้นประธาน','120 นาที'],['2. ประคบร้อน + แช่เท้าสมุนไพร','45 นาที'],['3. ชาตรีผลาปรับสมดุลลำไส้','สูตรเข้มข้น']]
    }
  ]
};

/* ================= ตัวช่วยคำนวณ ================= */
export const maxScore  = cfg => cfg.questions.length*(cfg.scale.length-1);
export const qIdxOf    = (cfg,gkey) => cfg.questions.map((q,i)=>q.g===gkey?i:-1).filter(i=>i>=0);
export const pad       = n => String(n).padStart(2,'0');
const pickState = (list,pct) => list.find(s=>pct<=s.maxPct) || list[list.length-1];
const levelIdx  = (pct,n) => Math.min(n-1, Math.floor(pct/(100/n)));
export const tierOf = (cfg,total) =>
  cfg.tiers.find(t=>total>=t.min && total<=t.max) || cfg.tiers[cfg.tiers.length-1];

/* รวมค่าที่บันทึกไว้เข้ากับค่าเริ่มต้น (กรณีมีคีย์ใหม่เพิ่มในเวอร์ชันหลัง) */
export function mergeCfg(saved){
  const base = structuredClone(DEFAULT_CFG);
  if(!saved || typeof saved!=='object') return base;
  const out = Object.assign(base, saved);
  out.org = Object.assign(structuredClone(DEFAULT_CFG.org), saved.org||{});
  return out;
}

/* ตรวจความถูกต้องของคำตอบเทียบกับ config */
export function validateAnswers(cfg, answers){
  if(!Array.isArray(answers) || answers.length!==cfg.questions.length) return 'จำนวนคำตอบไม่ตรงกับจำนวนคำถาม';
  const top = cfg.scale.length-1;
  for(const a of answers){
    if(!Number.isInteger(a) || a<0 || a>top) return 'ค่าคำตอบไม่ถูกต้อง';
  }
  return null;
}

/**
 * คำนวณรายงานทั้งหมดจากคำตอบ → model ที่พร้อมนำไปแสดงผลหรือเก็บ
 * @param cfg     config ปัจจุบัน
 * @param answers array ของคะแนน 0..N ตามลำดับคำถาม
 * @param intake  {name, dhatu, month}
 * @param meta    {id, date:Date}
 */
export function computeReport(cfg, answers, intake={}, meta={}){
  const date = meta.date instanceof Date ? meta.date : new Date();
  const total = answers.reduce((a,v)=>a+(v||0),0);
  const max   = maxScore(cfg);
  const balance = max ? Math.round((max-total)/max*100) : 0;
  const tier  = tierOf(cfg,total);
  const F={};

  const timeText = fmtBangkok(date);
  F['เวลาบันทึก']   = timeText;
  F['รหัสอ้างอิง']  = meta.id || '';
  F['ชื่อ']         = intake.name || '';
  F['ธาตุเจ้าเรือน'] = intake.dhatu || '';
  F['เดือนเกิด']    = (intake.month===''||intake.month==null) ? '' : (MONTHS[Number(intake.month)]||'');
  F['คะแนนรวม']     = total;
  F['คะแนนเต็ม']    = max;
  F['คะแนนสมดุล']   = balance;
  F['กลุ่มเสี่ยง']   = tier.label;

  const domains = cfg.groups.map(g=>{
    const idxs=qIdxOf(cfg,g.key);
    const score=idxs.reduce((a,i)=>a+(answers[i]||0),0);
    const m=idxs.length*(cfg.scale.length-1);
    const pct=m?score/m*100:0;
    const st=pickState(cfg.domainStates,pct);
    F[g.name]=score; F[g.name+' (%)']=Number(pct.toFixed(1)); F[g.name+' (ประเมิน)']=st.t;
    return {key:g.key, name:g.name, short:g.short||'', score, max:m, pct:Number(pct.toFixed(1)), verdict:{t:st.t,c:st.c}};
  });

  const elements = cfg.elements.map(el=>{
    const idxs=cfg.questions.map((q,i)=>q.el===el.key?i:-1).filter(i=>i>=0);
    if(!idxs.length) return null;
    const m=idxs.length*(cfg.scale.length-1);
    const pct=Math.round(idxs.reduce((a,i)=>a+(answers[i]||0),0)/m*100);
    const st=pickState(cfg.elementStates,pct);
    F[el.name]=st.t;
    return {key:el.key, name:el.name, pct, state:{t:st.t,c:st.c}};
  }).filter(Boolean);

  const sg = domains.find(d=>d.key===cfg.stressFrom) || domains[0];
  const sPct = sg ? Math.round(sg.pct) : 0;
  const stress = {pct:sPct, txt: sPct>=67?'สูง':sPct>=34?'ปานกลาง':'ต่ำ',
                  c: sPct>=67?'red':sPct>=34?'amber':'green'};
  F['ระดับความเครียดสะสม']=`${stress.txt} (${sPct}%)`;

  const sleepQ = cfg.questions.findIndex(q=>q.tag==='sleep');
  const sMax = cfg.scale.length-1;
  const sVal = sleepQ>=0 ? (answers[sleepQ]||0) : Math.round(sPct/100*sMax);
  const sLv  = levelIdx(sVal/sMax*100, cfg.sleepLevels.length);
  const sleep = {lv:sLv, txt:cfg.sleepLevels[sLv], c: sLv>=2?'red':sLv===1?'amber':'green'};
  F['คุณภาพการนอนหลับ']=sleep.txt;

  const risks = cfg.risks.map(r=>{
    const d=domains.find(x=>x.key===r.from);
    const i=levelIdx(d?d.pct:0, r.levels.length);
    F[r.name]=r.levels[i];
    return {name:r.name, level:r.levels[i], bad:i>=2};
  });

  F['บริการที่แนะนำ']=tier.services.map(([k,v])=>`${k} (${v})`).join(' / ');
  answers.forEach((v,i)=>{ F['ข้อ '+(i+1)] = v==null?'':v; });

  const o=cfg.org;
  return {
    id: meta.id||'', createdAt: date.toISOString(), timeText,
    org:{title:o.title, subtitle:o.subtitle, footer:o.footer, scoreTitle:o.scoreTitle, scoreNote:o.scoreNote,
         domTitle:o.domTitle, elTitle:o.elTitle, svcTitle:o.svcTitle, disclaimer:o.disclaimer},
    intake:{name:intake.name||'', dhatu:intake.dhatu||'', month:intake.month??''},
    total, max, balance,
    tier:{key:tier.key, label:tier.label, color:tier.color, summary:tier.summary, approach:tier.approach,
          routineTitle:tier.routineTitle, routine:tier.routine, services:tier.services},
    domains, elements, stress, sleep, risks,
    answers:[...answers], fields:F
  };
}

/* วันเวลาแบบไทย โซนกรุงเทพฯ  dd/mm/yyyy HH:MM:SS */
export function fmtBangkok(date){
  const p = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',
    day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})
    .formatToParts(date).reduce((a,x)=>(a[x.type]=x.value,a),{});
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}:${p.second}`;
}
/* วันที่แบบ YYYY-MM-DD โซนกรุงเทพฯ ใช้จัดกลุ่มสถิติ */
export function localDate(date){
  const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'})
    .formatToParts(date).reduce((a,x)=>(a[x.type]=x.value,a),{});
  return `${p.year}-${p.month}-${p.day}`;
}
