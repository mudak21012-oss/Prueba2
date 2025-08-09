export function bindSlashFocus(input){
  window.addEventListener('keydown', (e)=>{
    if(e.key==='/' && !e.altKey && !e.ctrlKey && !e.metaKey){
      const t=e.target; if(!(t instanceof HTMLInputElement)&&!(t instanceof HTMLTextAreaElement)&&!t.isContentEditable){ e.preventDefault(); input.focus(); }
    }
  });
}
export function politeAnnounce(el, msg){ if(!el) return; el.textContent = msg; }
export function setComboExpanded(fieldEl, expanded){ fieldEl.setAttribute('aria-expanded', String(expanded)); }
export function setActiveDescendant(fieldEl, optionId){ fieldEl.setAttribute('aria-activedescendant', optionId || ''); }
