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
// ---- smooth cartoon splat: rounded central blob + tapered limbs ending in round bulbs + droplets (anti-aliased vector paths)
function mkPat(){const c=document.createElement('canvas');c.width=c.height=28;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,28,28);g.fillStyle='#e7e5e4';g.beginPath();g.arc(14,14,1.3,0,7);g.fill();return cx.createPattern(c,'repeat');}
const backE=(t,c=1.7)=>{t=clamp(t);const u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
function seedSplat(){blobs=[];drops=[];const L=14;blobs.push({ph:[...Array(L)].map(()=>rnd(1,1.1))});
  const n=9,limbs=[];for(let i=0;i<n;i++){const a=i/n*6.283+rnd(-.25,.25);limbs.push({a,len:rnd(.35,1),w:rnd(.07,.12),bulb:rnd(.45,.75),dl:rnd(.12,.4),bend:rnd(-.25,.25)});}
  blobs.limbs=limbs;for(let i=0;i<7;i++)drops.push({a:rnd(0,6.283),d:rnd(1.05,1.3),r:rnd(5,13),dl:rnd(.25,.5)});}
function rayMax(ox,oy,dx,dy,m){let t=1e9;if(dx>0)t=Math.min(t,(W-m-ox)/dx);if(dx<0)t=Math.min(t,(m-ox)/dx);if(dy>0)t=Math.min(t,(H-m-oy)/dy);if(dy<0)t=Math.min(t,(m-oy)/dy);return Math.max(0,t);}
function shapes(u){ // returns path builders in css px
  const ox=W/2,oy=H/2,rx=W*.47,ry=H*.45,k=backE(u/.9),ph=blobs[0].ph,L=ph.length,list=[],gl=[];let P=new Path2D();list.push(P);const pts=[];
  const wob=1-clamp(u/1.2);
  for(let i=0;i<L;i++){const a=i/L*6.283,w=ph[i]+.04*Math.sin(u*10+i*1.7)*wob;pts.push([ox+Math.cos(a)*rx*k*w,oy+Math.sin(a)*ry*k*w]);}
  const n=pts.length;P.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2);
  for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];P.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}P.closePath();
  const S=Math.min(W,H);
  for(const l of blobs.limbs){const e=backE((u-l.dl)/.6,2.2);if(e<=0)continue;
    const dx=Math.cos(l.a),dy=Math.sin(l.a),bx=ox+dx*rx*k*.9,by=oy+dy*ry*k*.9; // base inside blob edge
    const br=S*.035*l.bulb*(.6+.4*e)+6,lenMax=rayMax(bx,by,dx,dy,br+4),len=Math.min(lenMax,S*.38*l.len+40)*e;
    const tx=bx+dx*len,ty=by+dy*len,nx=-dy,ny=dx,wb=S*l.w*(.7+.3*e),wn=Math.max(3,br*.42),mx=(bx+tx)/2+nx*len*l.bend*.3,my=(by+ty)/2+ny*len*l.bend*.3;
    P=new Path2D();list.push(P);P.moveTo(bx+nx*wb,by+ny*wb);P.quadraticCurveTo(mx+nx*wn*1.1,my+ny*wn*1.1,tx+nx*wn,ty+ny*wn);P.lineTo(tx-nx*wn,ty-ny*wn);
    P.quadraticCurveTo(mx-nx*wn*1.1,my-ny*wn*1.1,bx-nx*wb,by-ny*wb);P.closePath();
    P=new Path2D();list.push(P);P.arc(tx,ty,br,0,6.283);gl.push([tx,ty,br]);}
  for(const d of drops){const e=backE((u-d.dl)/.6,1.4);if(e<=0)continue;const dist=Math.min(d.d*e,1.4),x=ox+Math.cos(d.a)*rx*dist,y=oy+Math.sin(d.a)*ry*dist,r=d.r*Math.min(1,e);
    if(x<r||y<r||x>W-r||y>H-r)continue;P=new Path2D();list.push(P);P.arc(x,y,r,0,6.283);gl.push([x,y,r]);}
  return [list,gl];}
function drawSplat(u){
  const [list,gl]=shapes(u);cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);cx.lineJoin='round';cx.lineCap='round';
  cx.fillStyle=cx.strokeStyle='#FF8FAB';cx.lineWidth=12;for(const P of list){cx.fill(P);cx.stroke(P);}   // pink rim
  cx.strokeStyle='#FFE566';cx.lineWidth=5;for(const P of list)cx.stroke(P);                          // yellow inner band
  cx.fillStyle=pat;for(const P of list)cx.fill(P);                                                     // dotted board (covers inner seams)
  cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2.5;                                             // glossy highlights
  for(const [x,y,r] of gl){if(r<5)continue;cx.beginPath();cx.arc(x,y,r+3,Math.PI*1.1,Math.PI*1.45);cx.stroke();}
  const k=backE(u/.9);cx.lineWidth=3;cx.beginPath();cx.ellipse(W/2,H/2,W*.47*k*1.0+3,H*.45*k*1.0+3,0,Math.PI*1.12,Math.PI*1.3);cx.stroke();
}
function resize(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(1.5,devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;if(!pat)pat=mkPat();}
function finalState(){state=3;sec.classList.add('done');targets();resize();if(!blobs.length)seedSplat();drawSplat(3); // splash stays as the final hard-edged shape
  items.forEach(it=>{place(it,it.tx,it.ty,+it.n.dataset.tilt,1);it.n.style.opacity=1;mouse(it,0,0,0,false);});}
function visible(){const r=sec.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function hook(dt){
  if(state===3)return;
  if(state===0){const r=sec.getBoundingClientRect();
    if(r.bottom<0){finalState();return;}           // loaded scrolled past it
    if(r.top<innerHeight*.55&&r.bottom>innerHeight*.3){state=1;t=0;targets();resize();seedSplat();items.forEach(it=>it.n.style.opacity=1);}else return;}
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
  else if(state===2){drawSplat(t);if(t>1.25)sec.classList.add('done');if(t>2.2){finalState();}}
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
