// Underground: scroll down through pixel strata (roots from the trees above, stones, worms, fossils, crystals)
// into a cave where a dirt wall crumbles away in pixel chunks to reveal a portal to LLC (landrcy.github.io).
// Delta time; nothing runs while off-screen.
(()=>{
const U=document.getElementById('under'),cave=document.getElementById('ucave'),rc=document.getElementById('uroots'),rg=rc.getContext('2d');
const meter=document.getElementById('udepth'),par=document.getElementById('upar'),wall=document.getElementById('uwall'),wg=wall.getContext('2d'),portal=document.getElementById('uportal');
let PX=4,rootsDone=0,blocks=[],crumble=0,ct=0,BW=0,BH=0,state=0;
function seedRnd(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function drawRoots(){ // static, cached: drawn once per resize at the trees' pixel scale
  const r=rc.getBoundingClientRect();PX=parseFloat(getComputedStyle(document.getElementById('tree')).getPropertyValue('--tpx'))||4;
  const W=Math.ceil(r.width/PX),H=Math.ceil(r.height/PX);rc.width=W;rc.height=H;rg.clearRect(0,0,W,H);const rnd=seedRnd(9);
  const xs=(window.FFC_TREE_X||[.11,.27,.73,.89]);
  function root(x,y,a,len,w,d){const x2=x+Math.sin(a)*len,y2=y+Math.cos(a)*len;
    rg.strokeStyle='#2a180c';rg.lineWidth=w+1.2;rg.beginPath();rg.moveTo(x,y);rg.lineTo(x2,y2);rg.stroke();
    rg.strokeStyle=d<2?'#7a5232':'#9a6e48';rg.lineWidth=w;rg.beginPath();rg.moveTo(x,y);rg.lineTo(x2,y2);rg.stroke();
    if(d<4&&len>3)for(let i=0;i<1+(rnd()<.55);i++)root(x2,y2,a+(rnd()-.5)*1.4,len*(.6+rnd()*.25),Math.max(.8,w*.65),d+1);}
  rg.lineCap='round';for(const fx of xs){const k=fx<.2||fx>.8?1:.7;for(let i=0;i<2;i++)root(fx*W+(rnd()-.5)*4,0,(rnd()-.5)*1.2,H*.16*k,2.6*k,0);}
}
function buildWall(){const r=wall.getBoundingClientRect(),B=Math.max(6,Math.round(PX*2));BW=Math.ceil(r.width/B);BH=Math.ceil(r.height/B);wall.width=BW;wall.height=BH;
  const rnd=seedRnd(4),C=['#241c30','#2c2238','#1c1626','#352a42','#3e2f4a'];blocks=[];const cx=BW/2,cy=BH/2,M=Math.hypot(cx,cy);
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const dd=Math.hypot(x-cx,(y-cy)*1.4)/M;blocks.push({x,y,ox:x,oy:y,vx:0,vy:0,c:C[(rnd()*C.length)|0],delay:dd*1.1+rnd()*.35,on:1});}
  drawWall(0);}
function drawWall(dt){wg.clearRect(0,0,BW,BH);let alive=0;
  for(const b of blocks){if(!b.on)continue;
    if(crumble&&ct>b.delay){if(!b.f){b.f=1;b.vx=(b.ox-BW/2)/BW*8+(Math.random()-.5)*4;b.vy=-Math.random()*6;}b.vy+=70*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>BH+2){b.on=0;continue;}}
    alive++;wg.fillStyle=b.c;wg.fillRect(Math.round(b.x),Math.round(b.y),1,1);}
  return alive;}
function vis(el){const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
function size(){drawRoots();buildWall();if(state===2){wg.clearRect(0,0,BW,BH);blocks=[];}}
let sized=0;
function hook(dt){
  const uv=vis(U),cv=vis(cave);meter.classList.toggle('on',uv||cv);
  if(!uv&&!cv)return;if(!sized){sized=1;size();}
  const ur=U.getBoundingClientRect(),depth=Math.max(0,(innerHeight*.5-ur.top)/(ur.height+cave.offsetHeight));
  meter.textContent='▼ '+Math.round(depth*42)+' m';par.style.transform=`translateY(${(-ur.top*.18).toFixed(1)}px)`;  // parallax glints
  if(!cv)return;const r=cave.getBoundingClientRect();
  if(state===0&&r.top<innerHeight*.35){state=1;crumble=1;ct=0;cave.classList.add('dig');}
  if(state===1){ct+=Math.min(dt,.05);if(ct>.9)cave.classList.add('open');if(!drawWall(Math.min(dt,.05))){state=2;}}
}
(window.FFC_HOOKS=window.FFC_HOOKS||[]).push(hook);addEventListener('resize',()=>{if(sized)size();});addEventListener('ffc-trees',()=>{if(sized)drawRoots();});
})();
