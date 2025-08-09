import { hexToRgb } from './data.js';

export function createPreview(canvas){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx=canvas.getContext('2d'); let raf=null, running=false, color='#1e90ff';
  function drawOnce(hex,time){
    const W=canvas.width,H=canvas.height; ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#0d304e'); bg.addColorStop(1,'#0a2336'); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    const cx=W/2, cy=H/2, r=Math.min(W,H)*0.35; const base=hexToRgb(hex);
    const light=(time*0.001)%(Math.PI*2); const lx=cx+Math.cos(light)*r*0.6, ly=cy+Math.sin(light)*r*0.6;
    const grad=ctx.createRadialGradient(lx,ly,r*0.1,cx,cy,r); grad.addColorStop(0,'rgba(255,255,255,0.6)'); grad.addColorStop(0.2,`rgba(${base.r},${base.g},${base.b},1)`); grad.addColorStop(1,'rgba(0,0,0,0.35)');
    ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(lx-r*0.15,ly-r*0.15,r*0.08,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2; ctx.stroke();
  }
  function loop(ts){ drawOnce(color, ts); raf=requestAnimationFrame(loop); }
  function start(){ if(running||prefersReduced||document.hidden) return; running=true; raf=requestAnimationFrame(loop); }
  function stop(){ if(raf) cancelAnimationFrame(raf); raf=null; running=false; }
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stop(); else start(); });
  return { draw(hex){ color=hex; if(prefersReduced){ const now=performance.now(); stop(); drawOnce(color, now);} else { start(); } }, start, stop };
}
