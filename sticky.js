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
  const two=true,sz=Math.round(Math.min(W/7.6,SPS()*31,96));
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
// ---- splat traced from the owner's reference (splat-reference.png -> contour points around the body centroid).
// Growth: starts as a small blob at the centre; contour points are soft-clamped to a growing, per-angle radius,
// so the reference's arms extend outward along their length (tentacles reaching, staggered, wobbling, overshooting)
// while the whole shape stretches horizontally until it spans the section edge to edge.
const SP={"main": [[-127.2, -228.1], [-133.9, -226.8], [-140.4, -224.6], [-146.9, -222.3], [-152.8, -218.9], [-158.5, -215.1], [-163.8, -210.7], [-168.3, -205.6], [-172.5, -200.1], [-175.6, -194.0], [-177.6, -187.5], [-178.2, -180.7], [-177.7, -173.8], [-175.9, -167.2], [-172.9, -161.1], [-169.1, -155.4], [-164.5, -150.3], [-159.4, -145.7], [-154.0, -141.5], [-148.3, -137.7], [-142.3, -134.3], [-136.3, -131.0], [-130.4, -127.5], [-124.6, -123.8], [-119.1, -119.8], [-113.7, -115.6], [-108.6, -111.0], [-103.8, -106.1], [-99.3, -100.9], [-95.0, -95.6], [-91.5, -89.7], [-88.3, -83.6], [-85.8, -77.3], [-83.8, -70.7], [-83.0, -63.9], [-82.6, -57.1], [-83.5, -50.3], [-85.2, -43.6], [-88.0, -37.4], [-91.6, -31.6], [-96.2, -26.5], [-101.5, -22.2], [-108.0, -19.9], [-114.7, -20.0], [-120.7, -23.3], [-124.7, -28.7], [-127.1, -35.2], [-128.3, -41.9], [-129.6, -48.6], [-131.3, -55.3], [-133.6, -61.7], [-136.6, -67.8], [-140.1, -73.8], [-144.8, -78.7], [-150.4, -82.6], [-156.6, -85.5], [-163.4, -86.5], [-170.2, -85.8], [-176.4, -83.0], [-181.2, -78.2], [-184.3, -72.1], [-185.2, -65.4], [-183.8, -58.7], [-181.2, -52.3], [-177.5, -46.6], [-173.5, -41.0], [-168.7, -36.1], [-163.3, -31.9], [-158.0, -27.6], [-153.3, -22.6], [-149.6, -16.9], [-148.2, -10.2], [-149.0, -3.4], [-152.2, 2.6], [-156.8, 7.6], [-162.9, 10.8], [-169.5, 12.5], [-176.2, 13.8], [-183.0, 14.9], [-189.3, 17.4], [-194.4, 21.9], [-197.9, 27.8], [-199.6, 34.4], [-199.7, 41.2], [-198.5, 48.0], [-196.0, 54.3], [-192.1, 60.0], [-187.0, 64.5], [-181.0, 67.7], [-174.3, 69.3], [-167.5, 69.8], [-160.7, 69.2], [-154.2, 67.2], [-148.2, 63.9], [-143.2, 59.2], [-139.6, 53.4], [-137.2, 47.0], [-134.6, 40.6], [-131.5, 34.5], [-127.9, 28.7], [-123.5, 23.5], [-118.1, 19.3], [-111.6, 17.5], [-105.1, 19.5], [-100.3, 24.4], [-97.1, 30.4], [-95.7, 37.1], [-95.8, 43.9], [-97.3, 50.6], [-100.2, 56.8], [-103.7, 62.7], [-106.4, 69.0], [-107.0, 75.8], [-104.1, 81.8], [-98.6, 85.8], [-92.4, 88.7], [-86.4, 92.0], [-81.8, 97.0], [-80.2, 103.6], [-81.7, 110.3], [-85.3, 116.1], [-90.7, 120.2], [-97.1, 122.3], [-104.0, 122.4], [-110.7, 121.0], [-117.5, 120.5], [-124.3, 121.2], [-130.7, 123.7], [-136.3, 127.5], [-141.2, 132.4], [-144.8, 138.2], [-147.2, 144.6], [-148.2, 151.3], [-147.7, 158.2], [-146.1, 164.8], [-143.2, 171.0], [-139.5, 176.8], [-134.7, 181.7], [-128.9, 185.3], [-122.3, 187.0], [-115.6, 185.9], [-109.3, 183.4], [-103.4, 179.9], [-97.9, 175.8], [-92.8, 171.2], [-87.9, 166.3], [-83.4, 161.2], [-78.9, 156.1], [-74.4, 150.9], [-69.9, 145.7], [-65.3, 140.6], [-60.5, 135.7], [-55.6, 130.9], [-50.2, 126.6], [-44.7, 122.6], [-38.6, 119.4], [-32.4, 116.5], [-25.8, 114.6], [-19.1, 113.5], [-12.2, 113.9], [-5.5, 115.0], [1.0, 117.3], [7.0, 120.5], [12.2, 124.9], [16.1, 130.6], [18.3, 137.0], [18.0, 143.8], [16.1, 150.4], [13.8, 156.9], [10.8, 163.0], [7.3, 168.9], [3.7, 174.8], [0.1, 180.6], [-3.1, 186.7], [-5.7, 193.0], [-7.9, 199.5], [-8.2, 206.3], [-6.8, 213.0], [-3.5, 219.0], [0.8, 224.3], [6.7, 227.7], [13.3, 229.4], [20.1, 228.9], [26.6, 226.7], [32.5, 223.3], [37.4, 218.5], [40.8, 212.5], [42.6, 205.9], [42.8, 199.1], [41.9, 192.3], [40.2, 185.7], [38.3, 179.1], [36.1, 172.6], [34.3, 166.0], [33.0, 159.3], [32.8, 152.4], [34.0, 145.7], [35.6, 139.0], [38.0, 132.6], [41.5, 126.7], [45.3, 121.0], [49.8, 115.8], [55.3, 111.7], [61.2, 108.3], [67.6, 106.0], [74.4, 105.5], [81.2, 106.3], [87.6, 108.7], [93.1, 112.8], [97.7, 117.9], [101.1, 123.8], [103.7, 130.2], [105.7, 136.7], [107.6, 143.3], [109.3, 149.9], [111.4, 156.5], [113.8, 162.9], [117.3, 168.8], [121.5, 174.2], [126.7, 178.7], [132.6, 182.1], [139.0, 184.5], [145.7, 186.0], [152.5, 186.5], [159.4, 186.4], [166.1, 185.0], [172.7, 183.2], [179.0, 180.5], [184.9, 177.0], [190.6, 173.3], [195.6, 168.6], [200.3, 163.6], [204.3, 158.0], [207.7, 152.0], [210.0, 145.6], [211.9, 139.0], [212.8, 132.2], [212.8, 125.4], [211.7, 118.6], [209.4, 112.2], [205.9, 106.3], [201.2, 101.4], [195.5, 97.6], [189.3, 94.6], [182.8, 92.6], [176.0, 91.4], [169.2, 90.5], [162.4, 90.7], [155.6, 91.5], [148.9, 92.9], [142.1, 94.1], [135.4, 95.2], [128.5, 95.5], [121.7, 95.3], [115.0, 94.1], [108.6, 91.5], [103.0, 87.5], [98.4, 82.5], [95.7, 76.2], [94.8, 69.5], [95.6, 62.7], [98.0, 56.3], [102.4, 51.1], [108.3, 47.7], [115.0, 46.8], [121.6, 48.7], [126.7, 53.1], [129.5, 59.4], [131.9, 65.8], [135.6, 71.5], [141.2, 75.4], [147.8, 77.2], [154.5, 76.3], [160.5, 73.0], [165.6, 68.5], [169.7, 63.0], [172.8, 56.8], [174.6, 50.3], [175.8, 43.5], [175.1, 36.7], [173.2, 30.1], [169.8, 24.2], [165.3, 19.0], [160.0, 14.6], [154.3, 11.0], [148.4, 7.4], [142.2, 4.5], [135.9, 1.8], [129.8, -1.3], [123.6, -4.3], [117.8, -7.8], [112.2, -11.9], [107.1, -16.5], [103.0, -21.9], [100.0, -28.1], [98.2, -34.7], [97.8, -41.5], [98.6, -48.3], [101.8, -54.3], [106.9, -58.8], [113.3, -61.2], [120.0, -62.7], [126.8, -63.7], [133.5, -64.8], [140.3, -66.1], [146.7, -68.5], [152.9, -71.4], [158.2, -75.7], [162.4, -81.1], [164.6, -87.5], [164.5, -94.3], [162.4, -100.8], [158.1, -106.2], [152.9, -110.6], [146.6, -113.3], [139.9, -114.5], [133.0, -114.4], [126.4, -113.0], [120.0, -110.4], [114.2, -106.8], [108.8, -102.5], [103.9, -97.8], [98.4, -93.6], [92.5, -90.1], [86.1, -87.7], [79.8, -89.7], [76.3, -95.4], [77.1, -102.0], [81.8, -107.0], [87.7, -110.5], [93.6, -114.0], [99.4, -117.6], [104.8, -121.8], [109.5, -126.7], [113.6, -132.3], [117.1, -138.1], [120.4, -144.2], [122.7, -150.6], [124.1, -157.3], [124.7, -164.1], [123.5, -170.9], [121.1, -177.3], [116.8, -182.6], [111.5, -186.9], [105.4, -190.0], [98.7, -191.5], [91.9, -191.8], [85.1, -191.0], [78.6, -188.9], [72.5, -185.7], [67.2, -181.4], [62.9, -176.1], [59.5, -170.1], [57.3, -163.7], [55.9, -157.0], [55.2, -150.1], [55.7, -143.3], [55.6, -136.5], [54.7, -129.7], [53.1, -123.0], [50.8, -116.6], [47.7, -110.5], [43.8, -104.9], [39.1, -99.9], [33.3, -96.2], [26.7, -94.7], [20.2, -96.7], [14.9, -101.0], [12.5, -107.3], [12.6, -114.2], [14.0, -120.9], [16.1, -127.4], [18.3, -133.9], [20.3, -140.4], [21.9, -147.1], [22.6, -153.8], [19.9, -160.0], [13.8, -163.0], [7.0, -162.7], [0.9, -159.7], [-3.4, -154.4], [-5.7, -148.0], [-7.0, -141.3], [-8.2, -134.5], [-8.8, -127.7], [-9.7, -120.9], [-10.7, -114.1], [-12.1, -107.4], [-14.4, -101.0], [-18.3, -95.4], [-23.9, -91.5], [-30.6, -89.9], [-37.4, -90.3], [-44.1, -91.6], [-50.3, -94.5], [-55.6, -98.9], [-59.8, -104.3], [-62.5, -110.6], [-63.9, -117.3], [-65.0, -124.0], [-65.2, -130.9], [-65.2, -137.7], [-65.1, -144.6], [-64.2, -151.4], [-64.2, -158.3], [-64.2, -165.1], [-64.2, -172.0], [-64.4, -178.8], [-65.6, -185.6], [-67.9, -192.0], [-70.8, -198.2], [-74.2, -204.2], [-78.1, -209.8], [-82.7, -214.8], [-88.1, -219.1], [-94.0, -222.7], [-100.2, -225.5], [-106.8, -227.4], [-113.5, -228.5], [-120.4, -228.5]], "drops": [{"x": -227.7, "y": -25.0, "p": [[-227.2, -46.1], [-230.4, -45.0], [-233.4, -43.5], [-236.3, -41.8], [-238.9, -39.6], [-241.4, -37.3], [-243.7, -34.9], [-245.8, -32.3], [-247.4, -29.3], [-248.6, -26.2], [-249.2, -22.8], [-249.2, -19.5], [-248.7, -16.1], [-247.5, -13.0], [-245.6, -10.2], [-243.3, -7.7], [-240.6, -5.7], [-237.6, -4.2], [-234.3, -3.3], [-231.0, -2.8], [-227.6, -3.0], [-224.4, -3.8], [-221.1, -4.7], [-218.1, -6.3], [-215.4, -8.3], [-212.9, -10.5], [-210.9, -13.2], [-209.2, -16.1], [-208.0, -19.3], [-207.3, -22.6], [-207.2, -26.0], [-207.2, -29.3], [-207.5, -32.7], [-208.4, -35.9], [-209.9, -39.0], [-211.8, -41.7], [-214.3, -44.0], [-217.2, -45.7], [-220.5, -46.4], [-223.9, -46.5]]}, {"x": 193.6, "y": -41.3, "p": [[194.8, -59.1], [192.0, -58.3], [189.2, -57.2], [186.7, -55.7], [184.2, -54.1], [181.9, -52.3], [179.8, -50.2], [178.0, -47.9], [176.5, -45.3], [175.4, -42.6], [174.8, -39.8], [174.9, -36.8], [175.5, -33.9], [176.7, -31.2], [178.2, -28.7], [180.2, -26.6], [182.6, -24.9], [185.3, -23.6], [188.0, -22.6], [190.9, -21.9], [193.8, -21.7], [196.8, -22.1], [199.6, -23.0], [202.3, -24.1], [204.7, -25.8], [206.8, -27.9], [208.6, -30.2], [209.9, -32.8], [211.1, -35.5], [211.9, -38.3], [212.5, -41.2], [212.4, -44.1], [211.9, -47.1], [211.1, -49.9], [209.9, -52.6], [208.1, -54.9], [205.9, -56.9], [203.4, -58.4], [200.6, -59.3], [197.7, -59.5]]}, {"x": -53.6, "y": 194.0, "p": [[-53.2, 176.0], [-55.9, 177.1], [-58.5, 178.3], [-61.0, 179.8], [-63.4, 181.4], [-65.7, 183.2], [-67.7, 185.2], [-69.4, 187.6], [-70.8, 190.1], [-71.8, 192.9], [-72.4, 195.7], [-72.4, 198.6], [-72.1, 201.5], [-71.0, 204.2], [-69.5, 206.6], [-67.7, 208.9], [-65.5, 210.7], [-63.0, 212.3], [-60.4, 213.4], [-57.6, 214.1], [-54.7, 214.1], [-51.9, 213.5], [-49.3, 212.2], [-46.9, 210.6], [-44.8, 208.5], [-43.1, 206.2], [-41.6, 203.7], [-40.3, 201.1], [-39.1, 198.5], [-38.2, 195.8], [-37.6, 193.0], [-37.2, 190.1], [-37.2, 187.2], [-37.4, 184.3], [-38.3, 181.6], [-39.9, 179.2], [-42.0, 177.2], [-44.6, 175.9], [-47.5, 175.5], [-50.4, 175.5]]}]};
const NP=SP.main.length,BASE=SP.main.map(([x,y])=>({x,y,r:Math.hypot(x,y),a:Math.atan2(y,x)}));
// extra droplets (copies of the reference droplets) so the stretched final has drops above/below too
const DROPS=[...SP.drops,
  {x:-40,y:-262,p:SP.drops[2].p.map(([x,y])=>[x*.8,y*.8])},{x:120,y:236,p:SP.drops[1].p.map(([x,y])=>[x*.7,y*.7])},
  {x:-150,y:225,p:SP.drops[2].p.map(([x,y])=>[x*.6,y*.6])},{x:150,y:-250,p:SP.drops[0].p.map(([x,y])=>[x*.55,y*.55])}];
DROPS.forEach((d,i)=>{d.r0=Math.hypot(d.x,d.y);d.dl=.9+i*.12;d.p=d.p.map(([x,y])=>[x-d.x,y-d.y]);});
// anchor points (reference px, relative to body centroid) for the extra notes
const ANCH=[[-150,25],[-105,150],[140,-70],[88,-160],[150,118],[-118,-190],[-150,-62],[22,185]];
let SX=1,SY=1,RMAX=1,phase=[...Array(7)].map(()=>Math.random()*6.283);
function scales(){const r=sec.getBoundingClientRect();SY=Math.min(r.height*.98/459,r.width*1.6/414);SX=Math.max(SY,r.width*1.18/414);}
function SPS(){scales();return SY;}
function mkPat(c2){const c=document.createElement('canvas');c.width=c.height=28;const g=c.getContext('2d');g.fillStyle='#e7e5e4';g.beginPath();g.arc(14,14,1.3,0,7);g.fill();return c2.createPattern(c,'repeat');}
const backE=(t,c=1.6)=>{t=clamp(t);const u=t-1;return 1+(c+1)*u*u*u+c*u*u;};
function grownPath(u){ // returns Path2D in css px for growth time u
  const P=new Path2D(),cxp=W/2,cyp=H/2,body=Math.min(1,.18+.82*backE(u/1.3,1.3)),stretch=1+(SX/SY-1)*backE((u-.15)/1.6,1.2);
  const pts=new Array(NP);
  for(let i=0;i<NP;i++){const b=BASE[i];
    // per-angle reach: staggered by angle (sides first: reaching left/right), wobbling, overshoot
    const side=Math.abs(Math.cos(b.a)),dl=.15+(1-side)*.45+.1*Math.sin(b.a*3+phase[0]);
    const k=backE((u-dl)/1.5,2.0),wob=(1-clamp((u-dl)/2.2))*.07*Math.sin(u*11+b.a*4+phase[1]);
    const R=Math.max(26,k*330*(1+wob));
    const rr=b.r<=R*.7?b.r:R*.7+(R*.3)*(1-Math.exp(-(b.r-R*.7)/(R*.3)));  // soft clamp: arms beyond the reach fold into a rounded front
    const s=rr/(b.r||1)*body;pts[i]=[cxp+b.x*s*SY*stretch,cyp+b.y*s*SY];}
  P.moveTo((pts[0][0]+pts[NP-1][0])/2,(pts[0][1]+pts[NP-1][1])/2);
  for(let i=0;i<NP;i++){const p=pts[i],q=pts[(i+1)%NP];P.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}P.closePath();
  // solid core (also fills any fold-over loops while arms are compressed)
  let mn=1e9;for(let i=0;i<NP;i+=6){const dx=(pts[i][0]-cxp)/stretch,dy=pts[i][1]-cyp;mn=Math.min(mn,Math.hypot(dx,dy));}
  const C=new Path2D();C.ellipse(cxp,cyp,mn*.97*stretch,mn*.97,0,0,6.283);C.core=1;
  return [P,C];}
function dropPaths(u){const out=[],stretch=SX/SY;
  for(const d of DROPS){const e=backE((u-d.dl)/.6,2.6);if(e<=0)continue;const fly=clamp((u-d.dl)/.6),f=.55+.45*(1-Math.pow(1-fly,3));
    const x=W/2+d.x*f*SY*stretch,y=H/2+d.y*f*SY,P=new Path2D(),n=d.p.length;
    const q=d.p.map(([a,b])=>[x+a*e*SY,y+b*e*SY]);P.moveTo((q[0][0]+q[n-1][0])/2,(q[0][1]+q[n-1][1])/2);
    for(let i=0;i<n;i++){const p=q[i],r=q[(i+1)%n];P.quadraticCurveTo(p[0],p[1],(p[0]+r[0])/2,(p[1]+r[1])/2);}P.closePath();out.push(P);}
  return out;}
function paint(g,paths,soft){ // glossy cream: drop shadow (blurred only in the one-off final bake), board dots, inner shade, white rim
  g.save();
  if(soft){g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=24;g.shadowOffsetY=10;}
  else{g.fillStyle='rgba(0,0,0,.28)';g.save();g.translate(0,9);for(const P of paths)if(!P.core)g.fill(P);g.restore();}
  g.fillStyle='#fffef8';for(const P of paths)if(!P.core)g.fill(P);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;for(const P of paths)if(P.core)g.fill(P);
  for(const P of paths){if(P.core){g.save();g.clip(P);g.fillStyle=pat;g.fillRect(0,0,W,H);g.restore();continue;}g.save();g.clip(P);g.fillStyle=pat;g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(120,110,100,.13)';g.lineWidth=18;g.translate(-6,-8);g.stroke(P);g.translate(6,8);
    g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=10;g.translate(6,7);g.stroke(P);g.translate(-6,-7);g.restore();}
  g.restore();}
function drawSplat(u,final){
  if(!pat)pat=mkPat(cx);
  cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);paint(cx,[...grownPath(u),...dropPaths(u)],!!final);}
function layoutExtras(){const S=SY,st=SX/SY;
  extras.style.setProperty('--es',Math.max(.45,Math.min(1,S/2.1)).toFixed(3));
  [...extras.children].forEach((el,k)=>{const a=ANCH[k%ANCH.length];let x=W/2+a[0]*S*Math.min(st,1.35),y=H/2+a[1]*S;
    const es=Math.max(.45,Math.min(1,S/2.1)),hw=el.offsetWidth*es/2+10,hh=el.offsetHeight*es/2+10;   // keep every note fully on-screen
    x=Math.max(hw,Math.min(W-hw,x));y=Math.max(hh,Math.min(H-hh,y));el.style.left=x+'px';el.style.top=y+'px';});}
function resize(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(1.5,devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;scales();layoutExtras();}
function finalState(){state=3;sec.classList.add('done');targets();resize();drawSplat(3,true);
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
  else if(state===2){drawSplat(t);if(t>1.8)sec.classList.add('done');if(t>3.4){finalState();}}
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
