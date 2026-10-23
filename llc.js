// LLC sky section + floating island: intro when it scrolls in, CSS animations paused while off-screen.
(()=>{const L=document.getElementById('llc'),I=document.getElementById('isl'),T=document.getElementById('tree');let a=null,b=null;
function vis(e){const r=e.getBoundingClientRect();return r.bottom>-50&&r.top<innerHeight+50;}
(window.FFC_HOOKS=window.FFC_HOOKS||[]).push(()=>{const lv=vis(L),iv=vis(I)||vis(T);
 if(lv!==a){a=lv;L.classList.toggle('idle',!lv);}if(iv!==b){b=iv;I.classList.toggle('idle',!iv);T.classList.toggle('idle',!iv);}
 if(lv&&!L.classList.contains('in')&&L.getBoundingClientRect().top<innerHeight*.55)L.classList.add('in');});})();
