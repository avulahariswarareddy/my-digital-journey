/* Hero brush. The top photo is painted into a canvas; a rough dry brush erases it along the pointer's path,
   uncovering the registered photo underneath. Each mark physically shrinks away over LIFE seconds.
   Mouse: brushes while hovering the hero. Touch/pen: brushes while a finger drags on the photo; a tap leaves one short mark. */
(function(){
'use strict';
const stage=document.getElementById('heroStage');
if(!stage)return;
const hero=stage.closest('.hero')||stage;
const cv=stage.querySelector('.hero-canvas'),imgA=stage.querySelector('.hero-img-a'),imgB=stage.querySelector('.hero-img-b');
const ctx=cv&&cv.getContext('2d');
if(!ctx||!imgA||!imgB)return;

const LIFE=2.7,SAMPLES=48,FOLLOW=.17,SPACING=.09,MAX_MARKS=700,MAX_PIXELS=5e6,TAU=Math.PI*2;
let W=0,H=0,dpr=1,R=60,cover={x:0,y:0,w:0,h:0},ready=false;
const marks=[];
let active=false,pid=null,sx=0,sy=0,tx=0,ty=0,lx=0,ly=0,dir=0,rect=null;
let lastMouse=null,raf=0,prev=0;

/* Small seeded PRNG so every stamp has its own, repeatable irregularity */
const prng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};

/* One brush stamp, stored as unit-radius outline points already stretched and rotated toward the travel direction */
function stamp(x,y,ang,born){
  const seed=Math.random()*1000,rnd=prng(seed*7919|0),ca=Math.cos(ang),sa=Math.sin(ang);
  const along=1.1+rnd()*.06,across=.9+rnd()*.05;
  // medium bumps: random values smoothed around the ring; small tears: raw jitter
  const raw=new Float32Array(SAMPLES);for(let i=0;i<SAMPLES;i++)raw[i]=rnd()*2-1;
  const notches=[];for(let n=(rnd()*3)|0;n>0;n--)notches.push([(rnd()*SAMPLES)|0,.07+rnd()*.1,1.5+rnd()*2]);
  const pts=new Float32Array(SAMPLES*2),ph=born%100;
  for(let i=0;i<SAMPLES;i++){
    const a=i/SAMPLES*TAU;
    const med=(raw[(i+SAMPLES-2)%SAMPLES]+raw[(i+SAMPLES-1)%SAMPLES]*2+raw[i]*3+raw[(i+1)%SAMPLES]*2+raw[(i+2)%SAMPLES])/9;
    let r=1+.085*Math.sin(3*a+ph+seed)+.048*Math.sin(5*a-ph*1.15+seed*2.1)+.022*Math.sin(9*a+ph*.6+seed*3.7)+.012*Math.sin(13*a+seed*5.3)+.06*med+.03*raw[i];
    for(const[c,d,w]of notches){let k=Math.abs(i-c);k=Math.min(k,SAMPLES-k);if(k<w)r-=d*(1-k/w)}
    const ux=Math.cos(a)*r*along,uy=Math.sin(a)*r*across;
    pts[i*2]=ux*ca-uy*sa;pts[i*2+1]=ux*sa+uy*ca;
  }
  // dry-brush gaps: thin torn slivers running with the stroke, near its edges, on a minority of stamps
  const gaps=[];
  if(rnd()<.16){
    for(let g=rnd()<.35?2:1;g>0;g--){
      const side=rnd()<.5?-1:1,off=side*(.5+rnd()*.32),shift=(rnd()-.5)*.5,len=.22+rnd()*.3,wid=.018+rnd()*.03,n=10,q=new Float32Array(n*2);
      for(let j=0;j<n;j++){
        const a=j/n*TAU,jit=1+(rnd()-.5)*.5,taper=.55+.45*Math.abs(Math.sin(a+rnd()*.4));
        const ux=shift+Math.cos(a)*len*jit,uy=off+Math.sin(a)*wid*jit*taper;
        q[j*2]=ux*ca-uy*sa;q[j*2+1]=ux*sa+uy*ca;
      }
      gaps.push(q);
    }
  }
  return{x,y,radius:R,angle:ang,born,seed,pts,gaps};
}

/* Closed Catmull-Rom curve through the outline, as cubic Béziers */
function trace(p,cx,cy,s){
  const n=p.length>>1;
  ctx.moveTo(cx+p[0]*s,cy+p[1]*s);
  for(let i=0;i<n;i++){
    const a=((i-1+n)%n)*2,b=i*2,c=((i+1)%n)*2,d=((i+2)%n)*2;
    ctx.bezierCurveTo(
      cx+(p[b]+(p[c]-p[a])/6)*s,cy+(p[b+1]+(p[c+1]-p[a+1])/6)*s,
      cx+(p[c]-(p[d]-p[b])/6)*s,cy+(p[c+1]-(p[d+1]-p[b+1])/6)*s,
      cx+p[c]*s,cy+p[c+1]*s);
  }
  ctx.closePath();
}

function paintTop(){ctx.drawImage(imgA,cover.x,cover.y,cover.w,cover.h)}

/* Rebuilt from scratch every frame: top photo, then every live mark cut out of it */
function draw(t){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.globalCompositeOperation='source-over';
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  paintTop();
  if(!marks.length)return;
  let gapCount=0;
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath();
  for(const m of marks){
    const life=1-(t-m.born)/LIFE;if(life<=0)continue;
    trace(m.pts,m.x,m.y,m.radius*Math.pow(life,.85));
    gapCount+=m.gaps.length;
  }
  ctx.fill();
  ctx.globalCompositeOperation='source-over';
  if(gapCount){
    ctx.save();ctx.beginPath();
    for(const m of marks){
      if(!m.gaps.length)continue;
      const life=1-(t-m.born)/LIFE;if(life<=0)continue;
      const s=m.radius*Math.pow(life,.85);
      for(const g of m.gaps)trace(g,m.x,m.y,s);
    }
    ctx.clip();paintTop();ctx.restore();
  }
}

function lay(x,y,t){
  marks.push(stamp(x,y,dir,t));
  if(marks.length>MAX_MARKS)marks.splice(0,marks.length-MAX_MARKS);
}

/* Heavy overlap: fill the path from the last stamp to the follower so fast strokes stay one continuous band */
function emit(t){
  const dx=sx-lx,dy=sy-ly,d=Math.hypot(dx,dy),step=Math.max(1.5,R*SPACING);
  if(d<step)return;
  const ang=Math.atan2(dy,dx);
  let diff=ang-dir;diff=Math.atan2(Math.sin(diff),Math.cos(diff));dir+=diff*.35;
  const n=Math.floor(d/step),ux=dx/d*step,uy=dy/d*step;
  for(let i=1;i<=n;i++)lay(lx+ux*i,ly+uy*i,t);
  lx+=ux*n;ly+=uy*n;
}

function frame(now){
  raf=0;
  const t=now/1000,dt=prev?Math.min(.05,t-prev):1/60;prev=t;
  if(active){
    const k=1-Math.pow(1-FOLLOW,dt*60);
    sx+=(tx-sx)*k;sy+=(ty-sy)*k;
    emit(t);
  }
  let dead=0;while(dead<marks.length&&t-marks[dead].born>=LIFE)dead++;
  if(dead)marks.splice(0,dead);
  draw(t);
  const chasing=active&&Math.abs(tx-sx)+Math.abs(ty-sy)>.5;
  if(chasing||marks.length)raf=requestAnimationFrame(frame);else prev=0;
}
const kick=()=>{if(!raf&&ready)raf=requestAnimationFrame(frame)};

const local=e=>{rect=rect||stage.getBoundingClientRect();return[e.clientX-rect.left,e.clientY-rect.top]};
function begin(e){
  rect=stage.getBoundingClientRect();
  const[x,y]=local(e);
  sx=tx=lx=x;sy=ty=ly=y;active=true;
  lay(x,y,performance.now()/1000);
  stage.classList.add('is-used');
  kick();
}
function move(e){const[x,y]=local(e);tx=x;ty=y;kick()}
function end(){active=false;pid=null;rect=null}

/* Mouse: only real movement counts, so a cursor resting over the page at load (or during scroll) never reveals anything */
hero.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){lastMouse=[e.clientX,e.clientY];end()}});
hero.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!ready)return;
  if(!active){
    const moved=lastMouse&&(lastMouse[0]!==e.clientX||lastMouse[1]!==e.clientY);
    lastMouse=[e.clientX,e.clientY];
    if(moved)begin(e);
    return;
  }
  move(e);
});
hero.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){lastMouse=null;end()}});

/* Touch and pen: a drag that starts on the photo owns the pointer until it lifts */
stage.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'||!ready||pid!==null)return;
  pid=e.pointerId;
  try{stage.setPointerCapture(pid)}catch(_){}
  begin(e);
});
stage.addEventListener('pointermove',e=>{if(e.pointerId===pid&&active)move(e)});
const lift=e=>{if(e.pointerId===pid)end()};
stage.addEventListener('pointerup',lift);
stage.addEventListener('pointercancel',lift);
stage.addEventListener('lostpointercapture',lift);

/* The page scrolls under a hovering mouse without the cursor moving: drop the cached box */
addEventListener('scroll',()=>{rect=null},{passive:true});

function layout(){
  const w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return;
  const changed=w!==W||h!==H;
  W=w;H=h;
  dpr=Math.min(window.devicePixelRatio||1,2);
  if(W*H*dpr*dpr>MAX_PIXELS)dpr=Math.sqrt(MAX_PIXELS/(W*H));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  // identical to object-fit:cover + object-position:center on the image beneath
  const iw=imgA.naturalWidth,ih=imgA.naturalHeight,s=Math.max(W/iw,H/ih);
  cover={w:iw*s,h:ih*s,x:(W-iw*s)/2,y:(H-ih*s)/2};
  R=Math.max(56,Math.min(innerWidth,innerHeight)*.17);
  if(changed){marks.length=0;end()}
  rect=null;
  draw(performance.now()/1000);
}

const loaded=img=>(img.complete&&img.naturalWidth?Promise.resolve():new Promise((ok,no)=>{img.addEventListener('load',ok,{once:true});img.addEventListener('error',no,{once:true})}))
  .then(()=>img.decode?img.decode().catch(()=>{}):0);
Promise.all([loaded(imgA),loaded(imgB)]).then(()=>{
  layout();
  ready=true;
  stage.classList.add('is-live');
  if('ResizeObserver' in window)new ResizeObserver(()=>{layout();kick()}).observe(stage);
  else addEventListener('resize',()=>{layout();kick()});
}).catch(()=>{});
})();
