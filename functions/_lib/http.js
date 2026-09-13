/* ตัวช่วยตอบกลับ JSON และอ่าน body */
export const json = (data, status=200, headers={}) =>
  new Response(JSON.stringify(data), {
    status, headers:{'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', ...headers}
  });

export const fail = (message, status=400) => json({ok:false, error:message}, status);

export async function readJSON(request, limitBytes=200_000){
  const len = Number(request.headers.get('content-length')||0);
  if(len > limitBytes) throw new HttpError('ข้อมูลใหญ่เกินไป', 413);
  try{ return await request.json(); }
  catch{ throw new HttpError('รูปแบบข้อมูลไม่ถูกต้อง', 400); }
}

export class HttpError extends Error{
  constructor(message, status=400){ super(message); this.status=status; }
}

/* ห่อ handler ให้แปลง HttpError เป็น JSON อัตโนมัติ */
export const handler = fn => async ctx => {
  try{ return await fn(ctx); }
  catch(err){
    if(err instanceof HttpError) return fail(err.message, err.status);
    console.error(err);
    return fail('เกิดข้อผิดพลาดภายในระบบ', 500);
  }
};

/* กัน CSRF: คำขอที่เปลี่ยนข้อมูลต้องมาจาก origin เดียวกัน */
export function assertSameOrigin(request){
  const m=request.method.toUpperCase();
  if(m==='GET'||m==='HEAD'||m==='OPTIONS') return;
  const origin=request.headers.get('origin');
  const self=new URL(request.url).origin;
  if(origin && origin!==self) throw new HttpError('ปฏิเสธคำขอข้ามเว็บไซต์', 403);
}

export const clientIP = request =>
  request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
