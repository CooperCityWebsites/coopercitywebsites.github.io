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
  const two=true,sz=Math.round(Math.min(W/7.6,H/11,96));
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
const backE=(t,c=1.6)=>{t=clamp(t);const u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
// ---- polygon reveal: a cream triangle forms at the centre, then rounds of cursor-mice grab each edge's midpoint and drag it
// outward (new vertex, elastic snap on release): 3 -> 6 -> 12 -> 24 points, growing until it spans the section.
const R_T=.46,ROUNDS=[.7,.9,1.06],T0=.6,RD=1.7;           // triangle radius, per-round pull radius, timings (s)
const V=[];                                                // vertices: {a,born,round}
[-90,30,150].forEach(d=>V.push({a:d*Math.PI/180,born:0}));
for(let k=1;k<=ROUNDS.length;k++){const old=V.filter(v=>v.born<k).sort((p,q)=>p.a-q.a);
  for(let i=0;i<old.length;i++){const A=old[i],B=old[(i+1)%old.length];let b=B.a;if(b<=A.a)b+=6.283;
    V.push({a:(A.a+b)/2,born:k,A,B,name:NAMES[(i+k*3)%NAMES.length]});}}
V.sort((p,q)=>((p.a%6.283)+6.283)%6.283-((q.a%6.283)+6.283)%6.283);
const springE=s=>s<=0?0:1+Math.exp(-5.5*s)*Math.sin(16*s)*.09;  // elastic snap after release
const smooth3=x=>{x=clamp(x);return x*x*(3-2*x);};
// fixed-seed RNG: every mouse gets its own start time, approach direction/distance, speed and pull length
const RNG=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;})(20261023);
const rr=(a,b)=>a+RNG()*(b-a);
V.forEach(v=>{if(!v.born){v.rel=T0;v.tgt=R_T;}});
for(let k=1;k<=ROUNDS.length;k++)V.filter(v=>v.born===k).sort(()=>RNG()-.5).forEach(v=>{
  v.run=rr(.35,.95);v.drag=rr(.45,.8);v.s=Math.max(v.A.rel,v.B.rel)+rr(0,1.1)-(k===1?.0:.25);  // staggered, overlapping arrivals
  v.s=Math.max(v.s,Math.max(v.A.rel,v.B.rel)-.2);
  v.g0=v.s+v.run;v.rel=v.g0+v.drag;v.tgt=ROUNDS[k-1]*rr(.82,1.14);                                   // each pulls a different length
  v.ang=v.a+rr(-.75,.75);v.far=rr(.45,1.05);});
// per-round drift window for the older vertices (they ease outward while that round's pulls happen)
const WIN=ROUNDS.map((R,k)=>{const vs=V.filter(v=>v.born===k+1);return [Math.min(...vs.map(v=>v.g0)),Math.max(...vs.map(v=>v.rel))];});
V.forEach(v=>v.drift=ROUNDS.map(()=>rr(.88,1.04)));
function rAt(v,u){ // radius (ellipse-normalised) of vertex v at time u; null = not yet grabbed (sits on its edge midpoint)
  let r;
  if(!v.born)r=R_T*backE(u/T0,1.4);
  else{if(u<v.g0)return null;const g=smooth3((u-v.g0)/v.drag),m=lerpR(v,u);r=m+(v.tgt-m)*g;if(u>v.rel)r=v.tgt*springE(u-v.rel);}
  for(let k=Math.max(1,v.born+1);k<=ROUNDS.length;k++){const [a,b]=WIN[k-1],g=smooth3((u-a)/(b-a+.001)),tgt=Math.max(r,ROUNDS[k-1]*.96*v.drift[k-1]);r=r+(tgt-r)*g;}
  return r;}
const RX=()=>W*.5,RY=()=>H*.46;
function pos(v,u){const r=rAt(v,u);if(r===null){const a=pos(v.A,u),b=pos(v.B,u);return [(a[0]+b[0])/2,(a[1]+b[1])/2];}
  return [W/2+Math.cos(v.a)*r*RX(),H/2+Math.sin(v.a)*r*RY()];}
function lerpR(v,u){const a=pos(v.A,u),b=pos(v.B,u),x=(a[0]+b[0])/2-W/2,y=(a[1]+b[1])/2-H/2;return Math.hypot(x/RX(),y/RY());}
function polyPath(u){const P=new Path2D();const live=V.filter(v=>!v.born||u>=v.s);
  live.forEach((v,i)=>{const p=pos(v,u);i?P.lineTo(p[0],p[1]):P.moveTo(p[0],p[1]);});P.closePath();return P;}
// grab-mice: one per new vertex (pooled DOM nodes, same style as the letter mice)
const GM=V.filter(v=>v.born>0).map(v=>{const m=document.createElement('div');m.className='mouse';
  m.innerHTML='<span class="mc"></span><span class="mn">'+v.name+'</span>';sec.append(m);return {v,m};});
function grabMice(u){for(const g of GM){const v=g.v,k=u-v.s,out=u-v.rel;
  if(k<0||out>.9){if(g.on){g.m.style.opacity=0;g.on=0;}continue;}
  const p=pos(v,u),dx=Math.cos(v.ang),dy=Math.sin(v.ang),far=Math.max(W,H)*v.far;let x,y,sq;
  if(u<v.g0){const e=ease(k/v.run);x=p[0]+dx*far*(1-e);y=p[1]+dy*far*(1-e);sq=Math.sin(k*30/v.run*.5)*.12;}   // scurry in (own speed/direction)
  else if(out<0){x=p[0];y=p[1];sq=-.12;}                                                                   // grab + drag outward
  else{const e=clamp(out/.9),ox=Math.cos(v.a),oy=Math.sin(v.a);x=p[0]+ox*far*e*e;y=p[1]+oy*far*e*e;sq=Math.sin(out*34)*.14;}  // let go, run off
  g.m.style.opacity=1;g.on=1;g.m.style.transform=`translate(${x-3}px,${y-3}px) scale(${1.5*(1+sq)},${1.5*(1-sq)})`;}}
const T_END=Math.max(...V.map(v=>v.rel||0))+.9;
const ANCH=[[-.74,.08],[-.5,.62],[.62,-.36],[.3,-.68],[.6,.5],[-.4,-.66],[-.72,-.3],[.04,.74]];
function SPS(){return Math.min(H/459,W/300);}
function mkPat(c2){const c=document.createElement('canvas');c.width=c.height=28;const g=c.getContext('2d');g.fillStyle='#e7e5e4';g.beginPath();g.arc(14,14,1.3,0,7);g.fill();return c2.createPattern(c,'repeat');}
function paint(g,paths,soft){ // glossy cream: drop shadow (blurred only in the one-off final bake), board dots, inner shade, white rim
  g.save();g.lineJoin='round';
  if(soft){g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=24;g.shadowOffsetY=10;}
  else{g.fillStyle='rgba(0,0,0,.28)';g.save();g.translate(0,9);for(const P of paths)g.fill(P);g.restore();}
  g.fillStyle='#fffef8';for(const P of paths)g.fill(P);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  for(const P of paths){g.save();g.clip(P);g.fillStyle=pat;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(120,110,100,.13)';g.lineWidth=18;g.translate(-6,-8);g.stroke(P);g.translate(6,8);
    g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=10;g.translate(6,7);g.stroke(P);g.translate(-6,-7);g.restore();}
  g.restore();}
function drawSplat(u,final){if(!pat)pat=mkPat(cx);cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);
  paint(cx,[polyPath(Math.min(u,T_END))],!!final);if(!final)grabMice(u);else GM.forEach(g=>g.m.style.opacity=0);}
function layoutExtras(){const es=Math.max(.45,Math.min(1,W/1100,H/950));extras.style.setProperty('--es',es.toFixed(3));
  [...extras.children].forEach((el,k)=>{const a=(W<600&&k===0)?[-.42,-.4]:ANCH[k%ANCH.length];let x=W/2+a[0]*RX()*.98,y=H/2+a[1]*RY()*.98;
    const hw=el.offsetWidth*es/2+10,hh=el.offsetHeight*es/2+10;x=Math.max(hw,Math.min(W-hw,x));y=Math.max(hh,Math.min(H-hh,y));
    el.style.left=x+'px';el.style.top=y+'px';});}
function resize(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(1.5,devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;layoutExtras();}
function finalState(){state=3;sec.classList.add('done');targets();resize();drawSplat(T_END,true);
  items.forEach(it=>{place(it,it.tx,it.ty,+it.n.dataset.tilt,1);it.n.style.opacity=1;mouse(it,0,0,0,false);});}
function visible(){const r=sec.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function hook(dt){
  if(state===3)return;
  if(state===0){const r=sec.getBoundingClientRect();
    if(r.bottom<0){finalState();return;}           // loaded scrolled past it
    if(r.top<innerHeight*.55&&r.bottom>innerHeight*.3){state=1;t=0;resize();targets();drawSplat(0);items.forEach(it=>it.n.style.opacity=1);}else return;}
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
  else if(state===2){drawSplat(t);if(t>T_END-.4)sec.classList.add('done');if(t>T_END+1.6){finalState();}}
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
