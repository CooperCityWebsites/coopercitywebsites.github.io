// Casino showcase for RNG ("Test Your Luck"): neon flicker, chasing marquee bulbs, self-pulling slot machine landing a
// jackpot, coin/chip burst, felt table with dice + rarity cards, big chip PLAY button. Delta time, idle while off-screen.
(()=>{
const sec=document.getElementById('casino'),stage=document.getElementById('cstage'),cv=document.getElementById('coins'),g=cv.getContext('2d');
const reels=[...sec.querySelectorAll('.reel .strip')],lever=document.getElementById('lever'),res=document.getElementById('cres');
const SYM=['7','★','♦','BAR','♣','$','♥','★','♦','$','BAR','♣'],N=SYM.length,SH=110; // symbol height px (stage units)
const RAR=[['OBLIVION','1 in 1,000,000,000'],['ESCHATON','1 in 500,000,000'],['APOCALYPSE','1 in 250,000,000'],['RAPTURE','1 in 200,000,000'],['DIVINITY','1 in 100,000,000'],['PARADOX','1 in 25,000,000']];
const cls=s=>s==='7'?'s7':s==='★'?'sst':s==='♦'||s==='♥'?'sred':s==='BAR'?'sbar':'sgrn';
reels.forEach(st=>{for(let k=0;k<2;k++)for(const s of SYM){const d=document.createElement('div');d.className='sym '+cls(s);d.textContent=s;st.append(d);}});
// marquee bulbs around the stage frame
const fr=document.getElementById('cframe');function bulbs(){fr.innerHTML='';const w=stage.offsetWidth,h=stage.offsetHeight,step=34,per=2*(w+h);const n=Math.floor(per/step);
  for(let i=0;i<n;i++){let d=i*per/n,x,y;if(d<w){x=d;y=0}else if((d-=w)<h){x=w;y=d}else if((d-=h)<w){x=w-d;y=h}else{d-=w;x=0;y=h-d}
    const b=document.createElement('i');b.style.left=x+'px';b.style.top=y+'px';b.style.animationDelay=(-(i%3)*.18)+'s';fr.append(b);}}
let state=0,t=0,W=0,H=0,DPR=1,spin=null,parts=[],dieT=-1;
const ease=x=>1-Math.pow(1-x,3),clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),backE=(x,c=1.8)=>{x=clamp(x);const u=x-1;return 1+(c+1)*u*u*u+c*u*u;};
function layout(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;const port=W/H<.8;stage.classList.toggle('port',port);
  const sw=port?420:1000,sh=port?820:600,s=Math.min(W*.96/sw,H*.94/sh);stage.style.transform=`translate(-50%,-50%) scale(${s})`;
  DPR=Math.min(1.5,devicePixelRatio||1);cv.width=W*DPR;cv.height=H*DPR;bulbs();}
// ---- slot machine
const pos=[0,0,0];reels.forEach((st,i)=>{pos[i]=i*3;st.style.transform=`translateY(${-pos[i]*SH}px)`;});
function startSpin(jack){if(spin&&!spin.done)return;lever.classList.remove('pull');void lever.offsetWidth;lever.classList.add('pull');
  res.classList.remove('on','big');const tgt=jack?[0,0,0]:[0,1,2].map(()=>Math.random()*N|0);if(!jack&&tgt[0]===tgt[1]&&tgt[1]===tgt[2])tgt[2]=(tgt[2]+3)%N;
  spin={t:0,stop:[1.1,1.5,1.9],tgt,from:[null,null,null],dest:[0,0,0],done:false,jack:tgt[0]===tgt[1]&&tgt[1]===tgt[2]};}
function stepSpin(dt){if(!spin||spin.done)return;spin.t+=dt;let all=true;
  for(let i=0;i<3;i++){const s=spin.stop[i];
    if(spin.t<s){pos[i]+=dt*16*Math.min(1,spin.t/.25);all=false;}
    else{if(spin.from[i]===null){spin.from[i]=pos[i];let d=Math.ceil(pos[i])+2;while(((d%N)+N)%N!==spin.tgt[i])d++;spin.dest[i]=d;}
      const k=clamp((spin.t-s)/.55);pos[i]=spin.from[i]+(spin.dest[i]-spin.from[i])*backE(k,1.4);if(k<1)all=false;}
    reels[i].style.transform=`translateY(${-(((pos[i]%N)+N)%N)*SH}px)`;}
  if(all){spin.done=true;for(let i=0;i<3;i++)pos[i]=spin.dest[i]%N;
    if(spin.jack){res.innerHTML='<b>JACKPOT!</b><span>'+RAR[Math.random()*RAR.length|0].join(' · ')+'</span>';res.classList.add('on','big');burst();}
    else{const r=RAR[RAR.length-1-(Math.random()*3|0)];res.innerHTML='<b>so close…</b><span>pull again!</span>';res.classList.add('on');}}}
// ---- coin / chip burst (canvas, only active while particles exist)
function burst(){const sr=stage.querySelector('.slot').getBoundingClientRect(),cr=sec.getBoundingClientRect(),x=sr.left-cr.left+sr.width/2,y=sr.top-cr.top+sr.height*.45,s=sr.width/400;
  for(let i=0;i<80;i++){const a=-Math.PI/2+(Math.random()-.5)*2.4,v=(380+Math.random()*620)*Math.max(.5,s);
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:(7+Math.random()*7)*Math.max(.55,s),ph:Math.random()*6,sp:6+Math.random()*10,chip:Math.random()<.35,c:['#e11d48','#2563eb','#16a34a','#111'][i%4],life:0});}}
function stepParts(dt){g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life+=dt;p.vy+=1400*dt;p.vx*=Math.exp(-.6*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.ph+=p.sp*dt;
    if(p.y>H+40||p.life>4){parts.splice(i,1);continue;}const sx=Math.abs(Math.cos(p.ph));
    g.save();g.translate(p.x,p.y);g.scale(Math.max(.12,sx),1);
    if(p.chip){g.fillStyle=p.c;g.beginPath();g.arc(0,0,p.r,0,6.283);g.fill();g.strokeStyle='#fff';g.lineWidth=p.r*.28;g.setLineDash([p.r*.5,p.r*.45]);g.beginPath();g.arc(0,0,p.r*.78,0,6.283);g.stroke();g.setLineDash([]);}
    else{g.fillStyle='#b7791f';g.beginPath();g.arc(0,0,p.r,0,6.283);g.fill();g.fillStyle='#ffc440';g.beginPath();g.arc(0,0,p.r*.8,0,6.283);g.fill();g.fillStyle='#fff3b0';g.beginPath();g.arc(-p.r*.25,-p.r*.3,p.r*.22,0,6.283);g.fill();}
    g.restore();}}
// ---- dice + cards
const dice=[...sec.querySelectorAll('.die')],PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function face(d,n){d.innerHTML='';for(let k=0;k<9;k++){const p=document.createElement('i');if(PIPS[n].includes(k))p.className='on';d.append(p);}}
dice.forEach((d,i)=>face(d,i?3:5));
function stepDice(dt){if(dieT<0)return;dieT+=dt;const k=dieT/1.1;
  dice.forEach((d,i)=>{if(k<1){if(Math.random()<dt*14)face(d,1+(Math.random()*6|0));const e=ease(k);d.style.transform=`translate(${(1-e)*(-160-i*40)}px,${Math.sin(e*Math.PI*3)*-22*(1-e)}px) rotate(${(1-e)*(540+i*200)}deg)`;}
    else{face(d,6);d.style.transform=`rotate(${i?8:-6}deg)`;}});if(k>=1)dieT=-1;}
// ---- intro timeline
const steps=[[0,()=>sec.classList.add('k-neon')],[.35,()=>sec.classList.add('k-lights')],[.8,()=>sec.classList.add('k-machine')],
  [1.5,()=>startSpin(true)],[1.7,()=>{sec.classList.add('k-table');}],[2.1,()=>{dieT=0;}],[2.5,()=>sec.classList.add('k-cards')],[3.9,()=>sec.classList.add('k-chipbtn')]];
let si=0;
function finalState(){steps.forEach(s=>s[1]===steps[3][1]||s[1]());sec.classList.add('k-neon','k-lights','k-machine','k-table','k-cards','k-chipbtn');state=2;}
function visible(){const r=sec.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}
let vis=false;
function hook(dt){const v=visible();if(v!==vis){vis=v;sec.classList.toggle('run',v);}   // CSS loops (bulbs, neon hum) only run on-screen
  if(!v)return;
  if(state===0){const r=sec.getBoundingClientRect();if(r.top<innerHeight*.5){state=1;t=0;layout();}else return;}
  t+=Math.min(dt,.05);while(si<steps.length&&t>=steps[si][0]){steps[si][1]();si++;}
  stepSpin(dt);stepDice(dt);if(parts.length||g._dirty){stepParts(dt);g._dirty=parts.length>0;}}
lever.addEventListener('click',()=>{if(state>0)startSpin(Math.random()<.34);});
lever.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();lever.click();}});
(window.FFC_HOOKS=window.FFC_HOOKS||[]).push(hook);
addEventListener('resize',layout);addEventListener('load',layout);layout();
})();
