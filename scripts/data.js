/** @module data */
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const debounce = (fn, wait = 220) => { let t; const d=(...a)=>{clearTimeout(t); t=setTimeout(()=>fn(...a), wait)}; d.cancel=()=>clearTimeout(t); return d; };
export const slugify = (s) => String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
export const normalizeHex = (h) => { if (typeof h!=='string') return '#000000'; const s=h.trim(); const three=/^#?[0-9a-f]{3}$/i, six=/^#?[0-9a-f]{6}$/i;
  if (three.test(s)){const p=s.replace('#',''); return '#'+[...p].map(c=>c+c).join('');} if(six.test(s)) return '#'+s.replace('#',''); return '#000000'; };
export function hexToRgb(hex){ const h=normalizeHex(hex).slice(1); return { r:parseInt(h.slice(0,2),16), g:parseInt(h.slice(2,4),16), b:parseInt(h.slice(4,6),16) }; }
export const rgbToHex = ({r,g,b}) => '#' + [r,g,b].map(v => clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
export function rgbDistance(aHex, bHex){ const a=hexToRgb(aHex), b=hexToRgb(bHex); const dr=a.r-b.r,dg=a.g-b.g,db=a.b-b.b; return Math.sqrt(dr*dr+dg*dg+db*db); }

function inferBrandFromLink(link=''){ const l=String(link).toLowerCase();
  if (l.includes('filanova')) return 'Filanova'; if (l.includes('/3n3')) return '3n3'; if (l.includes('grilon3')) return 'Grilon3'; if (l.includes('gst3d')) return 'GST3D'; if (l.includes('hoho3d')) return 'Hoho3D'; return '-'; }

export function normalizeFilament(item){
  const name=String(item.name||'Desconocido').trim();
  const hex=normalizeHex(item.hex||'#000000');
  const type=String(item.type||'-').trim();
  const style=String(item.style||'-').trim();
  const brand=String(item.brand||item.marca||inferBrandFromLink(item.link)).trim()||'-';
  const temp=(item.temp&&String(item.temp).trim())||'-';
  const strength=(item.strength&&String(item.strength).trim())||'-';
  const link=(item.link&&String(item.link).trim())||'';
  const id=slugify(`${name}-${brand}`)||('f-'+Math.random().toString(36).slice(2,10));
  const img=item.img?String(item.img):null;
  return { id, name, hex, type, style, brand, temp, strength, link, img };
}
export function normalizeAll(raw){ const seen=new Set(); const out=[]; for(const it of raw){ const n=normalizeFilament(it); if(seen.has(n.id)) continue; seen.add(n.id); out.push(n);} return out; }

// Datos RAW: pega tu array en este archivo JSON y cámbialo a import si lo prefieres.
// Para hacerlo autocontenible, dejamos un pequeño set de ejemplo:
const RAW = [
  {"name":"Azul Ultra Claro","hex":"#79cfff","type":"PLA+","style":"High Speed","marca":"Filanova","temp":"190-220°C","strength":"Alta","link":"https://example.com"},
  {"name":"Naranja Bermellón","hex":"#ff6535","type":"PLA+","style":"High Speed","marca":"Filanova","temp":"190-220°C","strength":"Alta","link":"https://example.com"}
];
let FILAMENTS = normalizeAll(RAW);

export const state = { selectedId: null, filteredIds: [], focusIndex: -1, wheelAngle: 0 };
export function getAll(){ return FILAMENTS; }
export function setRaw(list){ FILAMENTS = normalizeAll(list); }
export function findById(id){ return getAll().find(f=>f.id===id)||null; }
export function selectById(id){ state.selectedId=id; return findById(id); }
export function buildSearchIndex(list = getAll()){
  return list.map((f)=>({ id:f.id, hay:`${f.name} ${f.hex} ${f.brand} ${f.style}`.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase() }));
}
