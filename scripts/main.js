import { getAll, setRaw, state, clamp, findById, selectById } from './data.js';
import { setIndexFrom, createSearchHandler } from './search.js';
import { VirtualList } from './list-virtualized.js';
import { resolveOgImage, colorDataURL, safeSwapImage } from './images.js';
import { initWheel } from './wheel.js';
import { createPreview } from './preview3d.js';
import { bindSlashFocus, politeAnnounce, setComboExpanded, setActiveDescendant } from './a11y.js';

const $listbox = document.getElementById('results-listbox');
const $searchField = document.getElementById('search-field');
const $search = document.getElementById('search-input');
const $selectedName = document.getElementById('selected-name');
const $selectedHex = document.getElementById('selected-hex');
const $detailName = document.getElementById('detail-name');
const $detailHex = document.getElementById('detail-hex');
const $detailType = document.getElementById('detail-type');
const $detailStyle = document.getElementById('detail-style');
const $detailTemp = document.getElementById('detail-temp');
const $detailStrength = document.getElementById('detail-strength');
const $detailBrand = document.getElementById('detail-brand');
const $detailColorbox = document.getElementById('detail-colorbox');
const $detailFigure = document.getElementById('detail-image');
const $detailLink = document.getElementById('detail-link');
const $detailImg = document.getElementById('detail-img');
const $ideaOut = document.getElementById('random-idea-output');
const $wheel = document.getElementById('color-wheel');
const $canvas = document.getElementById('preview-canvas');

bindSlashFocus($search);
const preview = createPreview($canvas);

// Index inicial
setIndexFrom(getAll());

function renderRow(el, id){
  const item = findById(id);
  el.setAttribute('aria-selected', String(state.selectedId === id));
  el.tabIndex = -1;

  if (!el._built) {
    const thumb=document.createElement('div'); thumb.className='thumb';
    const img=document.createElement('img'); img.width=38; img.height=38; img.loading='lazy'; img.decoding='async'; thumb.appendChild(img);
    const main=document.createElement('div'); main.className='item-main';
    const title=document.createElement('div'); title.className='item-title';
    const sub=document.createElement('div'); sub.className='item-sub'; main.append(title, sub);
    const brand=document.createElement('div'); brand.className='brand-badge';
    el.append(thumb, main, brand);

    el.addEventListener('click', ()=>select(id));
    el.addEventListener('keydown', (ev)=>{
      const len=state.filteredIds.length;
      switch(ev.key){
        case 'Enter': case ' ': ev.preventDefault(); select(id); break;
        case 'ArrowDown': ev.preventDefault(); focusMove(1); break;
        case 'ArrowUp': ev.preventDefault(); focusMove(-1); break;
        case 'Home': ev.preventDefault(); focusAt(0); break;
        case 'End': ev.preventDefault(); focusAt(len-1); break;
        case 'PageDown': ev.preventDefault(); focusMove(10); break;
        case 'PageUp': ev.preventDefault(); focusMove(-10); break;
        case 'Escape': ev.preventDefault(); $search.value=''; onSearch(''); break;
      }
    });

    el._refs = { img, title, sub, brand };
    el._built = true;
  }

  const { img, title, sub, brand } = el._refs;
  title.textContent = item.name;
  sub.textContent = `${item.hex} • ${item.type} • ${item.style}`;
  brand.textContent = item.brand || '-';
  img.alt = `Imagen ${item.name} (${item.brand})`;

  if (item.img) {
    safeSwapImage(img, item.img);
  } else {
    const fallback = colorDataURL(item.hex, 64);
    if (img.src !== fallback) img.src = fallback;
    requestIdleCallback?.(()=>resolveOgImage(item.link).then(url=>{
      if (url) { item.img = url; safeSwapImage(img, url); }
    }), {timeout:1500});
  }
}

const vlist = new VirtualList($listbox, {
  rowHeight: 64, overscan: 6,
  renderRow,
  getKey: (i)=>state.filteredIds[i]
});

function applyFilter(ids){
  state.filteredIds = ids;
  state.focusIndex = ids.length ? 0 : -1;
  vlist.setTotal(ids.length);
  setComboExpanded($searchField, true);
  const id = ids[0]; setActiveDescendant($searchField, id ? `opt-${id}` : '');
}
const { createSearchHandler } = await import('./search.js'); // redundant-safe
const onSearch = createSearchHandler(applyFilter);
$search.addEventListener('input', (e)=> onSearch(e.target.value));
$search.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowDown'){ e.preventDefault(); focusMove(1); }
  if(e.key==='ArrowUp'){ e.preventDefault(); focusMove(-1); }
  if(e.key==='Enter'){ e.preventDefault(); if(state.focusIndex>=0) select(state.filteredIds[state.focusIndex]); }
  if(e.key==='Escape'){ e.preventDefault(); $search.value=''; onSearch(''); setComboExpanded($searchField,false); }
});
$listbox.addEventListener('focus', ()=> setComboExpanded($searchField, true));
$listbox.addEventListener('blur', ()=> setComboExpanded($searchField, false), true);

function focusMove(delta){
  const len=state.filteredIds.length; if(!len) return;
  state.focusIndex = clamp((state.focusIndex<0?0:state.focusIndex)+delta, 0, len-1);
  const targetId=state.filteredIds[state.focusIndex];
  setActiveDescendant($searchField, `opt-${targetId}`);
  $listbox.querySelector(`[data-id="${targetId}"]`)?.focus({preventScroll:false});
}
function focusAt(index){ focusMove(index - (state.focusIndex<0?0:state.focusIndex)); }

function select(id){
  selectById(id);
  $listbox.querySelectorAll('.result-row').forEach(el => el.setAttribute('aria-selected', String(el.getAttribute('data-id') === id)));
  const item = findById(id); if(!item) return;

  $selectedName.textContent = item.name;
  $selectedHex.textContent = item.hex;

  $detailName.textContent = item.name;
  $detailHex.textContent = item.hex;
  $detailType.textContent = item.type || '-';
  $detailStyle.textContent = item.style || '-';
  $detailTemp.textContent = item.temp || '-';
  $detailStrength.textContent = item.strength || '-';
  $detailBrand.textContent = item.brand || '-';
  $detailColorbox.style.background = item.hex;

  if (item.link) {
    $detailLink.href = item.link;
    safeSwapImage($detailImg, item.img || colorDataURL(item.hex, 560));
    $detailImg.alt = `Imagen del producto ${item.name} (${item.brand})`;
    $detailFigure.hidden = false;
  } else {
    $detailFigure.hidden = true;
  }
  preview.draw(item.hex);
}

initWheel($wheel, (hex)=>{
  $selectedName.textContent='Color desde rueda';
  $selectedHex.textContent=hex;
  let best=null,bestD=Infinity;
  for(const f of getAll()){ const ar=parseInt(hex.slice(1,3),16),ag=parseInt(hex.slice(3,5),16),ab=parseInt(hex.slice(5,7),16);
    const br=parseInt(f.hex.slice(1,3),16),bg=parseInt(f.hex.slice(3,5),16),bb=parseInt(f.hex.slice(5,7),16);
    const d=(ar-br)**2+(ag-bg)**2+(ab-bb)**2; if(d<bestD){ bestD=d; best=f; } }
  if(best) select(best.id);
});

const ideas=[
  (i)=>`Imprime una carcasa para Raspberry en ${i.hex} que combine con ${i.brand}.`,
  (i)=>`Soporte de auriculares ${i.style} con ${i.type} en ${i.hex}.`,
  (i)=>`Llavero geométrico ${i.hex} con acentos negro mate.`,
  (i)=>`Soporte de teléfono Voronoi en ${i.hex} — capas 0.2mm.`,
  (i)=>`Organizador de cables (${i.type}) en ${i.hex}.`
];
document.getElementById('random-idea-btn').addEventListener('click', ()=>{
  const current = findById(state.selectedId) || getAll()[0];
  const fn = ideas[Math.floor(Math.random()*ideas.length)];
  politeAnnounce($ideaOut, fn(current));
});

function boot(){ onSearch(''); if(getAll().length) select(getAll()[0].id); }
boot();
