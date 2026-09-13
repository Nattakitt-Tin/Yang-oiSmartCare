/* GET /api/config — การตั้งค่าปัจจุบันสำหรับหน้าคนไข้ (สาธารณะ) */
import { handler, json } from '../_lib/http.js';
import { getConfig } from '../_lib/db.js';

export const onRequestGet = handler(async ({env}) => {
  const {cfg, updatedAt} = await getConfig(env.DB);
  return json({ok:true, cfg, updatedAt}, 200, {'cache-control':'public, max-age=60'});
});
