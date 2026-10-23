// Sticky Board section: cursor-"mice" carry letter notes in, smooth splat reveals the board. Delta-time, idle off-screen.
(()=>{
const SB='https://rainbowroar14.github.io/FinleyChang.com-Unblocked24/';
const COLORS=['#FFE566','#FFB4A2','#B8F2E6','#A0C4FF','#CDB4DB','#FFD6A5','#CAFFBF','#FF8FAB','#9BF6FF'];
const NAMES=['Finyey','Guest','Cooper','Maxwell','Doge','Cheems','Pog','Kappa','Guest','Finley'];
const sec=document.getElementById('sticky'),cv=document.getElementById('splat'),cx=cv.getContext('2d');
const board=document.getElementById('sboard'),word=document.getElementById('sword'),extras=document.getElementById('sextras');
const ease=t=>1-Math.pow(1-t,3),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const elastic=t=>{t=clamp(t);const c1=2.4,c3=c1+1,u=t-1;return 1+c3*u*u*u+c1*u*u;}; // ease-out-back: overshoot then settle
let state=0,t=0,items=[],W=0,H=0,DPR=1,pat=null,blobs=[],drops=[];
// --- letter notes + their cursor carriers
const LET='STICKY BOARD';
function rnd(a,b){return a+Math.random()*(b-a);}
function build(){
  [...LET].forEach((ch,i)=>{if(ch===' ')return;
    const n=document.createElement('div');n.className='lnote';n.textContent=ch;
    n.style.background=COLORS[i%COLORS.length];n.dataset.tilt=rnd(-9,9).toFixed(1);
    const m=document.createElement('div');m.className='mouse';m.innerHTML='<span class="mc"></span><span class="mn">'+NAMES[i%NAMES.length]+'</span>';
    word.append(n);sec.append(m);items.push({ch,i,n,m});});
}
function targets(){
  const r=sec.getBoundingClientRect();W=r.width;H=r.height;
  const two=W<760,sz=Math.round(Math.min(two?W/7.6:W/17,96,H/(two?5.2:4.4)));
  sec.style.setProperty('--ns',sz+'px');
  const rows=two?[[0,6],[7,12]]:[[0,12]];let k=0;
  rows.forEach(([a,b],ri)=>{const cnt=b-a,step=sz*1.12,x0=W/2-(cnt-1)*step/2,y=H/2+(ri-(rows.length-1)/2)*sz*1.25;
    for(let j=a;j<b;j++){const it=items.find(o=>o.i===j);if(!it){continue;}it.tx=x0+(j-a)*step;it.ty=y;}});
  items.forEach((it,j)=>{const e=j%4;const far=Math.max(W,H)*.65;
    it.sx=e==0?-80:e==1?W+80:it.tx+rnd(-200,200);it.sy=e==2?-80:e==3?H+80:it.ty+rnd(-150,150);
    if(e>=2&&false)it.sy=0;
    it.ex=it.tx<W/2?-120:W+120;it.ey=it.ty+rnd(-H*.4,H*.4);it.d=.15+j*.17;});
}
function place(it,x,y,rot,s){it.n.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) rotate(${rot}deg) scale(${s})`;}
function mouse(it,x,y,sq,show){it.m.style.opacity=show?1:0;it.m.style.transform=`translate(${x}px,${y}px) scale(${1+sq},${1-sq})`;}
// --- splat (smooth closed curve through lobed points + metaball-ish satellite blobs)
function mkPat(){const c=document.createElement('canvas');c.width=c.height=28;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,28,28);g.fillStyle='#e7e5e4';g.beginPath();g.arc(14,14,1.3,0,7);g.fill();return cx.createPattern(c,'repeat');}
function seedSplat(){blobs=[];drops=[];const L=18;const ph=[...Array(L)].map(()=>[rnd(.75,1.25),rnd(0,1)]);blobs.push({ph});
  for(let i=0;i<26;i++){const a=rnd(0,6.283);drops.push({a,v:rnd(.5,1.4),r:rnd(5,16),dl:rnd(0,.15)});}}
function smooth(pts){const n=pts.length;cx.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];cx.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}cx.closePath();}
function drawSplat(u){ // u: 0..~1.2 time
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);
  const ox=W/2,oy=H/2,Rmax=Math.hypot(W,H)*.62,R=Rmax*(.04+.96*elastic(u/1.25));
  const ph=blobs[0].ph,L=ph.length,pts=[];
  for(let i=0;i<L;i++){const a=i/L*6.283,w=1+.22*(ph[i][0]-1)*(1-clamp(u-.4))+.07*Math.sin(u*9+i*2.1);
    const rr=R*(i%2?w*.86:w*1.08);pts.push([ox+Math.cos(a)*rr,oy+Math.sin(a)*rr*.82]);}
  cx.beginPath();smooth(pts);
  for(const d of drops){const k=clamp((u-d.dl)/1.3);if(k<=0)continue;const dist=R*.9+Rmax*.5*ease(k)*d.v,r=d.r*(1-k*.5);
    const x=ox+Math.cos(d.a)*dist,y=oy+Math.sin(d.a)*dist*.82+k*k*40;cx.moveTo(x+r,y);cx.arc(x,y,r,0,6.283);}
  cx.lineJoin='round';cx.lineWidth=10;cx.strokeStyle='#FF8FAB';cx.stroke();cx.lineWidth=4;cx.strokeStyle='#FFE566';cx.stroke();
  cx.fillStyle=pat;cx.fill();
}
function resize(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(1.5,devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;}
function finalState(){state=3;sec.classList.add('done');cv.style.display='none';targets();
  items.forEach(it=>{place(it,it.tx,it.ty,+it.n.dataset.tilt,1);it.n.style.opacity=1;mouse(it,0,0,0,false);});}
function visible(){const r=sec.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function hook(dt){
  if(state===3)return;
  if(state===0){const r=sec.getBoundingClientRect();
    if(r.bottom<0){finalState();return;}           // loaded scrolled past it
    if(r.top<innerHeight*.55&&r.bottom>innerHeight*.3){state=1;t=0;targets();resize();pat=mkPat();seedSplat();items.forEach(it=>it.n.style.opacity=1);}else return;}
  if(!visible())return;                             // skip all work off-screen
  t+=Math.min(dt,.05);
  if(state===1){let done=true;
    for(const it of items){const k=t-it.d;
      if(k<0){place(it,it.sx,it.sy,0,1);it.n.style.opacity=0;done=false;continue;}it.n.style.opacity=1;
      const tilt=+it.n.dataset.tilt;
      if(k<1.1){const e=ease(clamp(k/1.1)),x=it.sx+(it.tx-it.sx)*e,y=it.sy+(it.ty-it.sy)*e-Math.sin(e*Math.PI)*40+Math.sin(k*28)*2;
        place(it,x,y,tilt*e+Math.sin(k*20)*3,1.06);mouse(it,x+12,y+8,Math.sin(k*30)*.12,true);done=false;}
      else if(k<1.4){const s=(k-1.1)/.3,sq=Math.sin(s*Math.PI)*(1-s);place(it,it.tx,it.ty,tilt,1+(s<.3?-.14*Math.sin(s/.3*Math.PI):sq*.1));mouse(it,it.tx+12,it.ty+8,-.15*(1-s),true);done=false;}
      else if(k<2.3){const e=ease(clamp((k-1.4)/.9)),x=it.tx+12+(it.ex-it.tx)*e,y=it.ty+8+(it.ey-it.ty)*e;place(it,it.tx,it.ty,tilt,1);mouse(it,x,y,Math.sin(k*34)*.15,e<1);if(e<1)done=false;}
      else mouse(it,0,0,0,false);}
    if(done){state=2;t=0;}}
  else if(state===2){drawSplat(t);if(t>1.25)sec.classList.add('done');if(t>1.9){finalState();}}
}
build();
(window.FFC_HOOKS=window.FFC_HOOKS||[]).push(hook);
addEventListener('resize',()=>{if(state===3)targets(),finalState();else if(state>0){resize();targets();}});
// tic-tac-toe
const g=document.getElementById('ttt'),st=document.getElementById('tttst');let b=Array(9).fill(''),p='X',over=false;
const L3=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function draw(){g.querySelectorAll('button').forEach((c,i)=>c.textContent=b[i]);}
g.querySelectorAll('button').forEach((c,i)=>c.onclick=()=>{if(over||b[i])return;b[i]=p;draw();
  const w=L3.find(l=>l.every(j=>b[j]===p));if(w){over=true;st.textContent=p+' wins!';}else if(b.every(Boolean)){over=true;st.textContent='Draw';}else{p=p==='X'?'O':'X';st.textContent=p+' to move';}});
document.getElementById('tttr').onclick=()=>{b=Array(9).fill('');p='X';over=false;st.textContent='X to move';draw();};
})();
