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
    if(r.top<innerHeight*.7&&r.bottom>0){state=1;t0=time;buildCrack(R);}
    else if(r.bottom<=0){state=3;reveal();}   // loaded already past it
  }
  const t=time-t0;
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
