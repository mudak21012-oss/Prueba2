import { hexToRgb } from './data.js';
export const IMG_TTL_MS = 1000*60*60*24*7;
const NS='hoho3d:img:v1';
function lsGet(k){ try{const raw=localStorage.getItem(`${NS}:${k}`); if(!raw) return null; const {value,expires}=JSON.parse(raw); if(Date.now()>expires){localStorage.removeItem(`${NS}:${k}`); return null;} return value;}catch{return null;} }
function lsSet(k,v,ttl){ try{localStorage.setItem(`${NS}:${k}`, JSON.stringify({value:v,expires:Date.now()+ttl}));}catch{} }

export function colorDataURL(hex, size=64){
  const c=document.createElement('canvas'); c.width=size; c.height=size;
  const ctx=c.getContext('2d'); const {r,g,b}=hexToRgb(hex);
  ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fillRect(0,0,size,size);
  const g2=ctx.createLinearGradient(0,0,size,size); g2.addColorStop(0,'rgba(255,255,255,0.25)'); g2.addColorStop(1,'rgba(0,0,0,0.25)');
  ctx.fillStyle=g2; ctx.fillRect(0,0,size,size); return c.toDataURL('image/png');
}

export async function resolveOgImage(link){
  if(!link) return null; const key=`img:${link}`; const cached=lsGet(key); if(cached) return cached;
  try{ const res=await fetch(`/api/og?url=${encodeURIComponent(link)}`, { mode:'cors', credentials:'omit' });
    if(!res.ok) return null; const data=await res.json(); if(data&&data.image){ lsSet(key,data.image,IMG_TTL_MS); return data.image; } }catch{}
  return null;
}

export async function safeSwapImage(img, src){
  if(!img||!src) return; const tmp=new Image(); tmp.decoding='async'; tmp.loading='eager'; tmp.src=src;
  try{ await tmp.decode(); }catch{} if(img.isConnected) img.src=src;
}
