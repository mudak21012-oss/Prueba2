import { clamp } from './data.js';

export class VirtualList {
  constructor(container, opts){
    this.c=container; this.rowHeight=opts.rowHeight??64; this.overscan=opts.overscan??6; this.renderRow=opts.renderRow; this.getKey=opts.getKey;
    this.total=0; this.topSpacer=document.createElement('div'); this.topSpacer.className='vspacer';
    this.holder=document.createElement('div'); this.holder.setAttribute('role','group');
    this.bottomSpacer=document.createElement('div'); this.bottomSpacer.className='vspacer';
    this.c.innerHTML=''; this.c.append(this.topSpacer,this.holder,this.bottomSpacer);
    this.pool=[]; this.first=0; this.last=0; this._raf=null; this._onScroll=this._onScroll.bind(this);
    this.c.addEventListener('scroll', this._onScroll, { passive:true });
  }
  setTotal(n){
    this.total=n|0; const viewportH=this.c.clientHeight||420;
    const visible=Math.ceil(viewportH/this.rowHeight)+this.overscan*2;
    const poolSize=Math.min(this.total, visible);
    while(this.pool.length<poolSize){ const el=document.createElement('div'); el.className='result-row'; el.setAttribute('role','option'); el.tabIndex=-1; this.pool.push(el); this.holder.appendChild(el); }
    while(this.pool.length>poolSize){ const el=this.pool.pop(); el.remove(); }
    this._updateWindow(true);
  }
  _onScroll(){ if(this._raf) return; this._raf=requestAnimationFrame(()=>{ this._raf=null; this._updateWindow(false); }); }
  _updateWindow(reset){
    const viewportH=this.c.clientHeight||420; const scrollTop=this.c.scrollTop|0;
    const first=clamp(Math.floor(scrollTop/this.rowHeight)-this.overscan,0,Math.max(0,this.total-1));
    const last=clamp(first+Math.ceil(viewportH/this.rowHeight)+this.overscan*2,0,this.total);
    this.first=first; this.last=last;
    this.topSpacer.style.height=(first*this.rowHeight)+'px'; this.bottomSpacer.style.height=Math.max(0,(this.total-last)*this.rowHeight)+'px';
    for(let i=0;i<this.pool.length;i++){ const index=first+i; const el=this.pool[i];
      if(index<this.total){ el.hidden=false; const id=this.getKey(index); el.id=`opt-${id}`; el.setAttribute('data-id', id); this.renderRow(el,id,index); }
      else { el.hidden=true; }
    }
    if(reset) this.c.scrollTop=0;
  }
  destroy(){ this.c.removeEventListener('scroll', this._onScroll); cancelAnimationFrame(this._raf); }
}
