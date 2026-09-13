/* รหัสผ่าน (PBKDF2) และคุกกี้ session (HMAC) ด้วย Web Crypto ล้วน */
import { HttpError } from './http.js';

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));

export const SESSION_COOKIE='ttm_sess';
export const SESSION_TTL=12*60*60; // 12 ชั่วโมง

export function randomSalt(){ return b64u(crypto.getRandomValues(new Uint8Array(16))); }

export async function hashPassword(password, salt){
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    {name:'PBKDF2', hash:'SHA-256', salt:unb64u(salt), iterations:100_000}, key, 256);
  return b64u(bits);
}

export function checkPasswordPolicy(pw){
  if(typeof pw!=='string' || pw.length<8) throw new HttpError('รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร');
  if(pw.length>200) throw new HttpError('รหัสผ่านยาวเกินไป');
}

async function hmacKey(secret){
  return crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign','verify']);
}

export async function makeSession(secret, payload){
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const sig  = b64u(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(body)));
  return `${body}.${sig}`;
}

export async function readSession(secret, token){
  if(!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  try{
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64u(sig), enc.encode(body));
    if(!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(unb64u(body)));
    if(!payload.exp || payload.exp < Date.now()/1000) return null;
    return payload;
  }catch{ return null; }
}

export function getCookie(request, name){
  const c=request.headers.get('cookie')||'';
  const m=c.match(new RegExp('(?:^|;\\s*)'+name+'=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function sessionCookie(token, maxAge=SESSION_TTL){
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
export const clearCookie = () => sessionCookie('', 0);

export function requireSecret(env){
  if(!env.SESSION_SECRET || env.SESSION_SECRET.length<16)
    throw new HttpError('ระบบยังไม่ได้ตั้งค่า SESSION_SECRET', 500);
  return env.SESSION_SECRET;
}

export function requireAdmin(user){
  if(user?.role!=='admin') throw new HttpError('ต้องเป็นผู้ดูแลระบบเท่านั้น', 403);
}
