import { json } from '../../_lib/http.js';
export const onRequestGet = ({data}) => json({ok:true, user:data.user});
