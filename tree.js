// "Sprout" section: pixel saplings grow in from both edges, branching recursively toward the middle,
// then sway in the wind (hierarchical: tips move more than the trunk), with gusts and falling leaves.
// Low-res canvas upscaled with image-rendering:pixelated. Delta time; no work while off-screen.
(()=>{
const sign=document.querySelector('#gh .sign'),sec=document.getElementById('tree'),cv=document.getElementById('tcv'),g=cv.getContext('2d');
let W=0,H=0,PX=4,trees=[],fall=[],t=0,started=false,wind=0,gust=0,gustT=3,seed=1;
const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let x=Math.imul(seed^seed>>>15,1|seed);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296;};
const BARK=['#5a3e2b','#8f6a4c','#c9a27e'],LEAF=['#1f4a1c','#3d7a2c','#6aa43e','#9ccf5a'];
function mk(len,w,ang,d,st){ // recursive branch; ang relative to parent
  const b={len,w,ang,d,st,dur:.35+.1*d,kids:[],lv:[],ph:rnd()*6.28,f:.8+rnd()*.6};
  if(d<6&&len>4){const n=d<1?2:(rnd()<.75?2:3);
    for(let i=0;i<n;i++){const s=(i/(n-1||1)-.5)*2;b.kids.push(mk(len*(.68+rnd()*.14),Math.max(1,w*.68),s*(.35+rnd()*.35)+(rnd()-.5)*.25,d+1,st+b.dur*(.6+rnd()*.3)));}}
  if(d>=4)for(let i=0,n=d>=5?3:2;i<n;i++)b.lv.push({u:.3+rnd()*.7,s:rnd()<.5?-1:1,c:LEAF[1+(rnd()*3|0)],a:rnd()*.8+.3,on:st+b.dur+.2+rnd()*.5});
  return b;}
function size(){const r=sec.getBoundingClientRect();PX=r.width<600?3:Math.max(4,Math.round(r.height/120));W=Math.ceil(r.width/PX);H=Math.ceil(r.height/PX);cv.width=W;cv.height=H;sec.style.setProperty('--tpx',PX+'px');build();}
function build(){seed=7;trees=[];const mob=W*PX<600,reach=W*(mob?.26:.3),hgt=H*.92;
  for(const s of[-1,1])for(const [k,xo,lean] of [[1,.02,mob?.15:.42],[.62,mob?.1:.17,mob?.05:.18]]){
    const L=(mob?Math.min(hgt*.2,W*.115):Math.min(hgt*.3,reach*.42))*k;trees.push({x:s<0?W*xo:W*(1-xo),s,lean,root:mk(L,Math.max(2,L*.13),0,0,(k<1?.5:0)+(s>0?.15:0))});}}
let gt=0; // grow time
function draw(b,x,y,a,age,amp,tr){
  const p=Math.min(1,Math.max(0,(age-b.st)/b.dur));if(p<=0)return;
  const sw=(Math.sin(t*b.f*1.7+b.ph)*.5+wind)*amp*(0.25+b.d*.55); // deeper -> more sway
  a+=b.ang*tr.s*-1*(b.d?1:0)+sw*.06+(b.d?0:tr.lean*-tr.s);
  const L=b.len*(1-(1-p)*(1-p)),x2=x+Math.sin(a)*L,y2=y-Math.cos(a)*L;
  const w=Math.max(1,b.w*(.4+.6*p));g.strokeStyle=BARK[0];g.lineWidth=w+1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
  g.strokeStyle=w>2.5?BARK[1]:BARK[2];g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();
  if(w>3){g.strokeStyle=BARK[2];g.lineWidth=1;g.beginPath();g.moveTo(x-1,y);g.lineTo(x2-1,y2);g.stroke();}
  for(const k of b.kids)draw(k,x+(x2-x)*.97,y+(y2-y)*.97,a,age,amp,tr);
  for(const l of b.lv){const q=Math.min(1,Math.max(0,(age-l.on)/.4));if(!q)continue;
    const lx=x+(x2-x)*l.u,ly=y+(y2-y)*l.u,fl=Math.sin(t*6+l.a*9+b.ph)*.35*amp,la=a+l.s*(l.a+fl),sz=(2.2+l.a*2)*q,
      ex=lx+Math.sin(la)*sz*1.6,ey=ly-Math.cos(la)*sz*1.6;
    const cx=Math.round((lx+ex)/2),cy=Math.round((ly+ey)/2),r=Math.max(1,Math.round(sz*.8));g.fillStyle=LEAF[0];g.fillRect(cx-r,cy-r+1,r*2+1,r*2);g.fillStyle=l.c;g.fillRect(cx-r+1,cy-r,r*2-1,r*2);
    if(started&&gt>4&&Math.random()<.00035*(1+gust*6)&&fall.length<40)fall.push({x:ex,y:ey,vx:0,vy:4,a:la,c:l.c,life:6});}}
function frame(dt){
  t+=dt;if(started)gt+=dt;
  gustT-=dt;if(gustT<0){gust=1;gustT=4+Math.random()*5;}gust=Math.max(0,gust-dt*.45);
  wind=.35*Math.sin(t*.45)+.2*Math.sin(t*1.3)+gust*1.4*Math.sin(Math.min(1,gust)*3.14);
  g.clearRect(0,0,W,H);g.lineCap='round';sign.style.transform=`rotate(${(wind*5+Math.sin(t*2.1)*1.2).toFixed(2)}deg)`;
  // concrete slab, like the game
  g.fillStyle='#55595f';g.fillRect(0,H-6,W,6);g.fillStyle='#8c9096';g.fillRect(0,H-6,W,1);
  const amp=Math.min(1,Math.max(0,(gt-2.4)/1.5)); // sway eases in once grown
  for(const tr of trees){g.fillStyle='#2b1d12';g.fillRect(tr.x-6,H-6,12,3);draw(tr.root,tr.x,H-6,0,gt,amp,tr);}
  for(let i=fall.length-1;i>=0;i--){const f=fall[i];f.vx+=((wind+gust)*14-f.vx)*dt*1.5;f.x+=f.vx*dt+Math.sin(t*3+i)*.3;f.y+=f.vy*dt;f.a+=dt*3;f.life-=dt;
    if(f.y>H-7){f.y=H-7;f.vx*=.9;f.vy=0;}if(f.life<0||f.x<-5||f.x>W+5){fall.splice(i,1);continue;}
    g.fillStyle=f.c;g.fillRect(Math.round(f.x),Math.round(f.y),2,Math.abs(Math.sin(f.a))>.5?2:1);}}
function visible(){const r=sec.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function hook(dt){if(!visible())return;if(!W)size();
  if(!started){const r=sec.getBoundingClientRect();if(r.top<innerHeight*.6){started=true;gt=0;sec.classList.add('on');}}
  frame(Math.min(dt,.05));}
(window.FFC_HOOKS=window.FFC_HOOKS||[]).push(hook);addEventListener('resize',()=>{if(W)size();});
})();
