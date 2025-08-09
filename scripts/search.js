import { debounce, buildSearchIndex } from './data.js';
let index = [];
export function setIndexFrom(list){ index = buildSearchIndex(list); }
export function searchIds(q){
  const s = (q||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if (!s) return index.map(x=>x.id);
  const out=[]; for (const row of index) if (row.hay.includes(s)) out.push(row.id); return out;
}
export function createSearchHandler(cb){ return debounce((q)=>cb(searchIds(q)), 220); }
