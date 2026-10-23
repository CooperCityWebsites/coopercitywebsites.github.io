// Rift: crack forms in one section of the starry page, shatters into shards, reveals Archive of Things panel.
(()=>{
const el=document.getElementById('rift'),fx=document.getElementById('fx'),g=fx.getContext('2d');
let PX=1,W=0,H=0,state=0,t0=0,time=0,last=null,crack=[],shards=[],seed=1;
const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function size(){PX=window.FFC_PX||1;W=Math.ceil(innerWidth/PX);H=Math.ceil(innerHeight/PX);fx.width=W;fx.height=H;}
addEventListener('resize',size);
function rect(){const r=el.getBoundingClientRect();return {x:r.left/PX,y:(r.top+scrollY)/PX,w:r.width/PX,h:r.height/PX};}
// --- crack geometry (region-local, 0..w / 0..h), each segment has a grow time
function buildCrack(R){
  crack=[];seed=7;
  const cx=R.w*.5,cy=R.h*.5;
  function branch(x,y,ang,len,t,depth){
    let px=x,py=y;const steps=Math.max(4,len/9|0);
    for(let i=0;i<steps;i++){
      ang+=(rnd()-.5)*.9;const L=len/steps;
      const nx=clamp(px+Math.cos(ang)*L,0,R.w),ny=clamp(py+Math.sin(ang)*L,0,R.h);
      crack.push({x0:px,y0:py,x1:nx,y1:ny,t:t+i*.05,w:depth?1:2});
      if(depth<2&&rnd()<.28)branch(nx,ny,ang+(rnd()<.5?1:-1)*(.6+rnd()*.7),len*.45,t+i*.05+.05,depth+1);
      px=nx;py=ny;if(nx<=0||nx>=R.w||ny<=0||ny>=R.h)break;
    }}
  branch(cx,cy,Math.PI+(rnd()-.5)*.3,R.w*.52,0,0);
  branch(cx,cy,(rnd()-.5)*.3,R.w*.52,0,0);
  branch(cx,cy,-Math.PI/2+(rnd()-.5)*.6,R.h*.5,.2,1);
  branch(cx,cy,Math.PI/2+(rnd()-.5)*.6,R.h*.5,.25,1);
}
let scars=[],rim=[],scarStars=[];
function buildScars(R){
  scars=[];rim=[];scarStars=[];seed=23;
  // seeds: where crack hit the rim + a few extra points around the perimeter
  const seeds=[];
  for(const c of crack){if(c.x1<=0.5||c.x1>=R.w-.5||c.y1<=.5||c.y1>=R.h-.5)seeds.push([c.x1,c.y1]);}
  const per=2*(R.w+R.h);for(let k=0;k<7;k++){let u=rnd()*per,x,y;
    if(u<R.w){x=u;y=0;}else if(u<R.w+R.h){x=R.w;y=u-R.w;}else if(u<2*R.w+R.h){x=u-R.w-R.h;y=R.h;}else{x=0;y=u-2*R.w-R.h;}seeds.push([x,y]);}
  const cx=R.w/2,cy=R.h/2;
  for(const [x,y] of seeds){
    let ang=Math.atan2(y-cy,(x-cx)*R.h/R.w)+(rnd()-.5)*.5,px=x,py=y;const len=(25+rnd()*70)/PX*1.5,steps=Math.max(3,len/7|0);
    const path=[[px,py]];
    for(let i=0;i<steps;i++){ang+=(rnd()-.5)*.8;px+=Math.cos(ang)*len/steps;py+=Math.sin(ang)*len/steps;path.push([px,py]);
      if(rnd()<.18){let a2=ang+(rnd()<.5?1:-1)*(.7+rnd()*.6),bx=px,by=py;const sub=[[bx,by]];for(let j=0;j<3;j++){a2+=(rnd()-.5)*.8;bx+=Math.cos(a2)*len/steps;by+=Math.sin(a2)*len/steps;sub.push([bx,by]);}scars.push({p:sub,t:.3+rnd()*.3,w:1});}
      if(rnd()<.5)scarStars.push([px+(rnd()-.5)*4,py+(rnd()-.5)*4,rnd()]);}
    scars.push({p:path,t:rnd()*.3,w:1,seed:[x,y,ang]});
  }
  // jagged rim: teeth around the perimeter (sky chunks biting into the hole edge)
  const step=6/PX*1.5;
  const side=(x0,y0,x1,y1,nx,ny)=>{const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,L/step|0);
    for(let i=0;i<=n;i++){const u=i/n;rim.push([x0+(x1-x0)*u+nx*(rnd()*5/PX*1.5),y0+(y1-y0)*u+ny*(rnd()*5/PX*1.5)]);}};
  side(0,0,R.w,0,0,1);side(R.w,0,R.w,R.h,-1,0);side(R.w,R.h,0,R.h,0,-1);side(0,R.h,0,0,1,0);
}
function buildShards(R){
  shards=[];seed=11;const C=11,Rw=7,pts=[];
  for(let j=0;j<=Rw;j++){pts.push([]);for(let i=0;i<=C;i++){
    const edge=i===0||j===0||i===C||j===Rw;
    pts[j].push([i/C*R.w+(edge?0:(rnd()-.5)*R.w/C*.8),j/Rw*R.h+(edge?0:(rnd()-.5)*R.h/Rw*.8)]);}}
  const cx=R.w/2,cy=R.h/2;
  for(let j=0;j<Rw;j++)for(let i=0;i<C;i++){
    const a=pts[j][i],b=pts[j][i+1],c=pts[j+1][i+1],d=pts[j+1][i];
    const tris=rnd()<.5?[[a,b,c],[a,c,d]]:[[a,b,d],[b,c,d]];
    for(const tr of tris){
      const mx=(tr[0][0]+tr[1][0]+tr[2][0])/3,my=(tr[0][1]+tr[1][1]+tr[2][1])/3;
      const dx=mx-cx,dy=my-cy,dd=Math.hypot(dx,dy)||1,sp=(120+rnd()*220)*(1.2-dd/Math.hypot(cx,cy)*.5)/PX*1.5;
      const stars=[];for(let k=0;k<3;k++)if(rnd()<.6){const u=rnd(),v=rnd()*(1-u);stars.push([tr[0][0]+(tr[1][0]-tr[0][0])*u+(tr[2][0]-tr[0][0])*v-mx,tr[0][1]+(tr[1][1]-tr[0][1])*u+(tr[2][1]-tr[0][1])*v-my]);}
      shards.push({pts:tr.map(p=>[p[0]-mx,p[1]-my]),x:mx,y:my,vx:dx/dd*sp+(rnd()-.5)*40,vy:dy/dd*sp+(rnd()-.5)*40-30,
        r:0,vr:(rnd()-.5)*7,delay:dd/Math.hypot(cx,cy)*.12,stars});
    }}
  for(const sc of scars){if(!sc.seed)continue;const [x,y,ang]=sc.seed;
    for(let k=0;k<2;k++){const d=(3+k*6+rnd()*4)/PX*1.5,mx=x+Math.cos(ang)*d,my=y+Math.sin(ang)*d,z=(3+rnd()*3)/PX*1.5,sp=(60+rnd()*110)/PX*1.5;
      shards.push({pts:[[-z,-z*.6],[z,-z*.3],[(rnd()-.5)*z,z]],x:mx,y:my,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-20,r:rnd()*6,vr:(rnd()-.5)*9,delay:.08+rnd()*.35,stars:[],debris:1});}}
}
function line(x0,y0,x1,y1,w){ // pixel-crisp Bresenham
  x0|=0;y0|=0;x1|=0;y1|=0;const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(;;){g.fillRect(x0,y0,w,w);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
const T_CRACK=1.5,T_HOLD=.35,T_SHARD=1.8;
function reveal(){el.classList.add('open');}
function frame(ts){
  if(last===null)last=ts;let dt=Math.min(Math.max((ts-last)/1000,0),1/20);last=ts;time+=dt;
  if(window.FFC_PX&&window.FFC_PX!==PX)size();
  g.clearRect(0,0,W,H);
  const R=rect(),sc=scrollY/PX,ox=R.x,oy=R.y-sc;
  if(state===0){ // trigger when section centre reaches lower 70% of viewport
    const r=el.getBoundingClientRect();
    if(r.top<innerHeight*.7&&r.bottom>0){state=1;t0=time;buildCrack(R);buildScars(R);}
    else if(r.bottom<=0){buildCrack(R);buildScars(R);state=3;reveal();}   // loaded already past it
  }
  const t=time-t0;
  if(state>=1&&scars.length){
    const age=state===1?Math.max(0,t/T_CRACK-.55)/.45:(state===2?1:1);
    for(const sc of scars){const pr=clamp((age-sc.t)/.5);if(pr<=0)continue;const n=Math.max(1,Math.round((sc.p.length-1)*pr));
      for(let i=0;i<n;i++){const a=sc.p[i],b=sc.p[i+1];
        g.save();g.shadowColor='rgba(80,170,255,.8)';g.shadowBlur=6;g.fillStyle='rgba(120,190,255,.35)';line(ox+a[0],oy+a[1],ox+b[0],oy+b[1],2);g.restore();
        g.fillStyle=`rgba(200,232,255,${.75-.5*i/sc.p.length})`;line(ox+a[0],oy+a[1],ox+b[0],oy+b[1],1);}}
    if(state>=2){for(const [x,y,b] of scarStars){g.fillStyle=`rgba(235,240,255,${.5+.5*Math.sin(time*2+b*9)})`;g.fillRect(ox+x|0,oy+y|0,1,1);}
      // jagged rim: dark sky teeth over the hole edge with a glowing lip
      g.beginPath();const sx=ox,sy=oy;g.moveTo(sx+rim[0][0],sy+rim[0][1]);for(const p of rim)g.lineTo(sx+p[0],sy+p[1]);g.closePath();
      g.save();g.beginPath();g.rect(sx-4,sy-4,R.w+8,R.h+8);g.moveTo(sx+rim[0][0],sy+rim[0][1]);for(let i=rim.length-1;i>=0;i--)g.lineTo(sx+rim[i][0],sy+rim[i][1]);g.closePath();
      g.fillStyle='#07060d';g.fill('evenodd');g.restore();
      g.save();g.beginPath();g.moveTo(sx+rim[0][0],sy+rim[0][1]);for(const p of rim)g.lineTo(sx+p[0],sy+p[1]);g.closePath();
      g.shadowColor='rgba(80,170,255,1)';g.shadowBlur=8;g.strokeStyle='rgba(170,220,255,.85)';g.lineWidth=1;g.stroke();g.restore();}
  }
  if(state===1){
    const k=t/T_CRACK;
    // light leaking: soft glow behind crack, grows
    g.save();g.globalCompositeOperation='lighter';
    const rg=g.createRadialGradient(ox+R.w/2,oy+R.h/2,0,ox+R.w/2,oy+R.h/2,R.w*.6);
    rg.addColorStop(0,`rgba(120,190,255,${.25*clamp(k)})`);rg.addColorStop(1,'rgba(0,128,128,0)');g.fillStyle=rg;g.fillRect(ox,oy,R.w,R.h);g.restore();
    const flick=t>T_CRACK?(.7+.3*Math.sin(t*60)):1;
    for(const s of crack){const p=clamp((k*1.15-s.t)/.12);if(p<=0)continue;
      const x1=s.x0+(s.x1-s.x0)*p,y1=s.y0+(s.y1-s.y0)*p;
      g.save();g.shadowColor='rgba(80,170,255,1)';g.shadowBlur=8;g.fillStyle=`rgba(170,220,255,${flick})`;
      line(ox+s.x0,oy+s.y0,ox+x1,oy+y1,s.w+1);g.restore();
      g.fillStyle='#ffffff';line(ox+s.x0,oy+s.y0,ox+x1,oy+y1,s.w);}
    if(t>T_CRACK+T_HOLD){state=2;t0=time;buildShards(R);reveal();}
  }
  if(state===2){
    // flash
    if(t<.35){g.fillStyle=`rgba(220,240,255,${(1-t/.35)*.85})`;g.fillRect(ox,oy,R.w,R.h);}
    let alive=0;
    for(const s of shards){
      const lt=t-s.delay;
      if(lt>0){s.vy+=160*dt/PX*1.5;const dr=Math.exp(-.6*dt);s.vx*=dr;s.vy*=dr;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;}
      const a=clamp(1-Math.max(0,lt)/T_SHARD);if(a<=0)continue;alive++;
      g.save();g.globalAlpha=a;g.translate(ox+s.x,oy+s.y);g.rotate(s.r);
      g.beginPath();g.moveTo(s.pts[0][0],s.pts[0][1]);g.lineTo(s.pts[1][0],s.pts[1][1]);g.lineTo(s.pts[2][0],s.pts[2][1]);g.closePath();
      g.fillStyle='#07060d';g.fill();g.strokeStyle=lt>0?'rgba(150,210,255,.9)':'rgba(255,255,255,.0)';g.lineWidth=1;g.stroke();
      g.fillStyle='#dfe6ff';for(const st of s.stars)g.fillRect(st[0]|0,st[1]|0,1,1);
      g.restore();}
    if(!alive||t>T_SHARD+.5)state=3;
  }
  requestAnimationFrame(frame);
}
size();requestAnimationFrame(frame);
})();

// ---- realistic cloud lettering + click reveal
(()=>{
const scr=document.getElementById('scr'),cv=document.getElementById('clouds'),c=cv.getContext('2d');
const TEXT='Archive of Things';let puffs=[],sprites=[],W=0,H=0,DPR=1,last=null,t=0,built=false;
function puffSprite(seed,shade){ // noise-textured soft puff: light top, grey underside
  const S=96,o=document.createElement('canvas');o.width=o.height=S;const x=o.getContext('2d');let r=seed;const R=()=>(r=(r*16807)%2147483647)/2147483647;
  for(let i=0;i<46;i++){const a=R()*6.283,d=Math.pow(R(),.7)*S*.3,px=S/2+Math.cos(a)*d,py=S/2+Math.sin(a)*d*.8,rr=S*(.08+R()*.16);
    const gr=x.createRadialGradient(px,py,0,px,py,rr);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,S,S);}
  x.globalCompositeOperation='source-atop';const sh=x.createLinearGradient(0,S*.15,0,S*.9);
  sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.55,'rgba(225,232,242,'+(.25*shade)+')');sh.addColorStop(1,'rgba(150,162,182,'+(.85*shade)+')');x.fillStyle=sh;x.fillRect(0,0,S,S);
  return o;}
function build(){
  const r=scr.getBoundingClientRect();if(r.width<10)return;DPR=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;
  if(!sprites.length)for(let i=0;i<10;i++)sprites.push(puffSprite(1000+i*7919,1));
  const m=document.createElement('canvas'),mw=Math.round(W),mh=Math.round(H);m.width=mw;m.height=mh;const x=m.getContext('2d');
  let fs=Math.min(mh*.24,mw*.1);x.font=`800 ${fs}px "Baloo 2", system-ui, sans-serif`;
  while(x.measureText(TEXT).width>mw*.9){fs*=.95;x.font=`800 ${fs}px "Baloo 2", system-ui, sans-serif`;}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(TEXT,mw/2,mh*.28);
  const d=x.getImageData(0,0,mw,mh).data,step=Math.max(2.5,fs/17);puffs=[];let s=7;const R=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let y=0;y<mh;y+=step)for(let xx=0;xx<mw;xx+=step){const jx=xx+(R()-.5)*step,jy=y+(R()-.5)*step;const i=((jy|0)*mw+(jx|0))*4;
    if(jx>=0&&jy>=0&&jx<mw&&jy<mh&&d[i+3]>128)puffs.push({x:jx,y:jy,r:step*(1.05+R()*.75),sp:sprites[R()*sprites.length|0],ph:R()*6.28,f:.25+R()*.5,a:.55+R()*.35});}
  puffs.sort((a,b)=>a.y-b.y);built=true;}
function frame(ts){if(last===null)last=ts;const dt=Math.min(.05,(ts-last)/1000);last=ts;t+=dt;
  if(document.getElementById('rift').classList.contains('open')){
    if(!built)build();
    c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);
    const drift=Math.sin(t*.07)*6;
    // soft grey shadow/base layer, then fluffy white puffs; slight blur for volume
    c.filter="blur(1px)";
    for(const p of puffs){const m=1+.12*Math.sin(t*p.f+p.ph),ox=Math.sin(t*p.f*.7+p.ph)*1.6+drift,oy=Math.cos(t*p.f*.6+p.ph)*1.2;
      const r=p.r*m;c.globalAlpha=p.a*.35;c.drawImage(p.sp,p.x+ox-r*1.1,p.y+oy-r*1.1+r*.35,r*2.2,r*2.2);}
    c.filter="blur(.35px)";
    for(const p of puffs){const m=1+.12*Math.sin(t*p.f+p.ph),ox=Math.sin(t*p.f*.7+p.ph)*1.6+drift,oy=Math.cos(t*p.f*.6+p.ph)*1.2;
      const r=p.r*m*.9;c.globalAlpha=p.a;c.drawImage(p.sp,p.x+ox-r,p.y+oy-r,r*2,r*2);}
    c.filter='none';c.globalAlpha=1;}
  requestAnimationFrame(frame);}
addEventListener('resize',()=>{built=false;});
(document.fonts?document.fonts.load('800 40px "Baloo 2"'):Promise.resolve()).finally(()=>{built=false;requestAnimationFrame(frame);});
// click sequence
const h=document.getElementById('cae'),go=document.getElementById('go');
h.innerHTML=[...'Create and Explore'].map(ch=>`<span>${ch===' '?'&nbsp;':ch}</span>`).join('');
let played=false;
function play(){if(played)return;played=true;scr.classList.add('played');
  [...h.children].forEach((sp,i)=>setTimeout(()=>sp.classList.add('on'),i*55));
  setTimeout(()=>go.classList.add('on'),18*55+350);}
scr.addEventListener('click',e=>{if(e.target===go)return;play();});
scr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();play();}});
})();
