import { rgbToHex } from './data.js';

const TABLE = Array.from({length:360},(_,h)=>{
  const s=1,v=1,c=v*s,x=c*(1-Math.abs(((h/60)%2)-1)),m=v-c; let r=0,g=0,b=0;
  if (0<=h&&h<60)[r,g,b]=[c,x,0]; else if (60<=h&&h<120)[r,g,b]=[x,c,0];
  else if (120<=h&&h<180)[r,g,b]=[0,c,x]; else if (180<=h&&h<240)[r,g,b]=[0,x,c];
  else if (240<=h&&h<300)[r,g,b]=[x,0,c]; else [r,g,b]=[c,0,x];
  return rgbToHex({ r:(r+m)*255, g:(g+m)*255, b:(b+m)*255 });
});
export function hueToHex(h){ return TABLE[((h%360)+360)%360]; }

export function initWheel(wheel, onChange){
  let angle=0; const ind=wheel.querySelector('.wheel-indicator');
  function setAngle(a){
    angle=((a%360)+360)%360;
    wheel.setAttribute('aria-valuenow', String(Math.round(angle)));
    wheel.setAttribute('aria-valuetext', `Ángulo ${Math.round(angle)} grados`);
    const rad=(angle-90)*Math.PI/180; const R=140; const cx=160+Math.cos(rad)*R; const cy=160+Math.sin(rad)*R;
    ind.style.left=cx+'px'; ind.style.top=cy+'px'; onChange(TABLE[Math.round(angle)], angle);
  }
  const eventToAngle=(x,y)=>{ const r=wheel.getBoundingClientRect(); const dx=x-r.left-r.width/2; const dy=y-r.top-r.height/2; return ((Math.atan2(dy,dx)*180/Math.PI+90)%360+360)%360; };
  wheel.addEventListener('pointerdown', (e)=>{ wheel.setPointerCapture(e.pointerId); setAngle(eventToAngle(e.clientX,e.clientY)); });
  wheel.addEventListener('pointermove', (e)=>{ if(e.pressure===0) return; setAngle(eventToAngle(e.clientX,e.clientY)); });
  wheel.addEventListener('keydown', (e)=>{ const step=e.shiftKey?10:3;
    if(e.key==='ArrowRight'){e.preventDefault(); setAngle(angle+step);} if(e.key==='ArrowLeft'){e.preventDefault(); setAngle(angle-step);}
    if(e.key==='Home'){e.preventDefault(); setAngle(0);} if(e.key==='End'){e.preventDefault(); setAngle(359);} });
  setAngle(200); return { setAngle };
}
