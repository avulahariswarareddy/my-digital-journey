(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=()=>matchMedia('(max-width: 920px)').matches;
window.__asset=window.__asset||(n=>'/assets/'+n+'.webp');
const unhide=()=>root.classList.remove('anim');

/* Theme toggle */
$('#themeBtn')?.addEventListener('click',()=>{
  const cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  const next=cur==='dark'?'light':'dark';root.setAttribute('data-theme',next);
  try{localStorage.setItem('theme',next)}catch(e){}
});

/* Mobile menu */
const mb=$('#menuBtn')||document.createElement('button'),mn=$('#mnav')||document.createElement('nav');
const setMenu=o=>{mn.classList.toggle('open',o);mb.setAttribute('aria-expanded',String(o));mb.setAttribute('aria-label',o?'Close menu':'Open menu')};
mb.addEventListener('click',()=>setMenu(!mn.classList.contains('open')));
document.addEventListener('click',e=>{if(mn.classList.contains('open')&&!mn.contains(e.target)&&!mb.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open')){setMenu(false);mb.focus()}});

/* Smooth scrolling (wheel only; touch keeps native momentum) */
let lenis=null;
if(window.Lenis&&!reduce){
  try{
    lenis=new Lenis({lerp:.11,smoothWheel:true});
    if(window.gsap){gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}
    else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}
  }catch(e){lenis=null}
}
window.__lenis=lenis;
/* In-page links: one delegated handler, also covers links inside chat answers */
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"],a[data-scroll]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;
  const id=a.dataset.scroll||a.getAttribute('href');if(!id||id.length<2||id[0]!=='#')return;
  const el=document.getElementById(id.slice(1));if(!el)return;
  e.preventDefault();setMenu(false);
  if(lenis)lenis.scrollTo(el,{offset:id==='#top'?0:-84,duration:1.1});
  else el.scrollIntoView({behavior:reduce?'auto':'smooth'});
  history.replaceState(null,'',id);
});

/* Vedasri role tabs */
const seg=$('.seg');
if(seg){
  const tabs=$$('[role="tab"]',seg);
  const pick=(b,focus)=>{tabs.forEach(t=>{const on=t===b;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;const p=document.getElementById(t.getAttribute('aria-controls'));p.hidden=!on;if(on){p.classList.remove('enter');void p.offsetWidth;p.classList.add('enter')}});seg.dataset.role=b.dataset.r;if(focus)b.focus()};
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>pick(t));t.addEventListener('keydown',e=>{const k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();pick(tabs[(i+(k==='ArrowRight'?1:-1)+tabs.length)%tabs.length],true)}else if(k==='Home'||k==='End'){e.preventDefault();pick(tabs[k==='Home'?0:tabs.length-1],true)}})});
}

/* Certificate rail: arrows, end states, mouse drag */
const rail=$('#rail');
if(rail){
  const prev=$('[data-rail="-1"]'),next=$('[data-rail="1"]');
  const ends=()=>{const max=rail.scrollWidth-rail.clientWidth-2;prev.disabled=rail.scrollLeft<=2;next.disabled=rail.scrollLeft>=max};
  [prev,next].forEach(b=>b.addEventListener('click',()=>rail.scrollBy({left:(+b.dataset.rail)*rail.clientWidth*.8,behavior:reduce?'auto':'smooth'})));
  rail.addEventListener('scroll',ends,{passive:true});addEventListener('resize',ends);ends();
  let down=false,sx=0,sl=0,moved=0;
  rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=0;sx=e.clientX;sl=rail.scrollLeft});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>5){rail.classList.add('drag');rail.scrollLeft=sl-dx}});
  addEventListener('pointerup',()=>{if(!down)return;down=false;setTimeout(()=>rail.classList.remove('drag'),0)});
  rail.addEventListener('dragstart',e=>e.preventDefault());
}

/* Photo slots: shown only once the file exists in assets/ (webp, jpg, jpeg or png) */
const slots=$$('[data-slot]');
if(slots.length&&!window.__inline&&/^https?:$/.test(location.protocol)){
  const load=b=>{
    const n=b.dataset.slot,exts=['webp','jpg','jpeg','png'];let i=0;const probe=new Image();
    probe.onload=()=>{const img=$('img',b);img.src=probe.src;img.width=probe.naturalWidth;img.height=probe.naturalHeight;b.hidden=false;window.ScrollTrigger&&ScrollTrigger.refresh()};
    probe.onerror=()=>{if(i<exts.length)probe.src='/assets/'+n+'.'+exts[i++]};probe.onerror();
  };
  /* hidden elements never intersect, so watch each slot's visible parent */
  const groups=new Map();slots.forEach(b=>{const p=b.closest('li,.serve-main,.cell,.run')||b.parentElement;groups.set(p,(groups.get(p)||[]).concat(b))});
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){io.unobserve(en.target);groups.get(en.target).forEach(load)}}),{rootMargin:'800px 0px'});groups.forEach((_,p)=>io.observe(p))}
  else slots.forEach(load);
}

/* Lightbox */
const lb=$('#lb'),lbImg=$('#lbImg'),lbCap=$('#lbCap');let lbFrom=null;
if(lb){
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-lb]');if(!b||lb.open||(rail&&rail.classList.contains('drag')))return;
  const img=$('img',b);
  lbImg.src=(img&&(img.currentSrc||img.src))||window.__asset(b.dataset.lb);
  lb.classList.toggle('cut',b.hasAttribute('data-cut'));lbImg.alt=b.dataset.cap||'';lbCap.textContent=b.dataset.cap||'';lbFrom=b;
  if(typeof lb.showModal==='function'){lb.showModal();lenis&&lenis.stop()}
});
$('#lbX').addEventListener('click',()=>lb.close());
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('close',()=>{lenis&&lenis.start();lbFrom&&lbFrom.focus({preventScroll:true})});
}

/* Enquiry form: builds a WhatsApp message, nothing is sent to any server */
const form=$('#enq'),fName=$('#f-name'),fMsg=$('#f-msg'),fReply=$('#f-reply');
if(form){
form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=fName.value.trim(),msg=fMsg.value.trim(),reply=fReply.value.trim();
  const who=(form.querySelector('input[name="who"]:checked')||{}).value||'';
  let ok=true;
  const flag=(el,id,txt)=>{el.setAttribute('aria-invalid',txt?'true':'false');document.getElementById(id).textContent=txt;if(txt&&ok){el.focus();ok=false}};
  flag(fName,'e-name',name?'':'Add your name so I know who is writing.');
  flag(fMsg,'e-msg',msg.length>=3?'':'Write a short message, even one line is enough.');
  if(!ok)return;
  let t=`Hi Hariswara, I'm ${name}${who?', '+who:''}.\n\n${msg}`;
  if(reply)t+=`\n\nYou can reply to me at: ${reply}`;
  t+='\n\n(Sent from your portfolio website)';
  const url='https://wa.me/919000320544?text='+encodeURIComponent(t);
  if(window.__inline){$('#sentLink').href=url;$('#sent').classList.add('show');window.open(url,'_blank','noopener');return}
  /* the printer on /thank-you prints exactly what was typed, so keep it before leaving the page */
  const whoEl=form.querySelector('input[name="who"]:checked'),whoLabel=whoEl&&whoEl.value?(form.querySelector(`label[for="${whoEl.id}"]`)||{}).textContent||'':'';
  try{sessionStorage.setItem('wa',url);sessionStorage.setItem('enq',JSON.stringify({name,who:whoLabel,reply,msg,at:Date.now()}))}catch(err){}
  window.open(url,'_blank','noopener');
  location.href='/thank-you';
});
[fName,fMsg].forEach(el=>el.addEventListener('input',()=>{if(el.getAttribute('aria-invalid')==='true'){el.setAttribute('aria-invalid','false');document.getElementById(el.getAttribute('aria-describedby')).textContent=''}}));
}
/* Thank-you page: the button reopens the exact message */
const ty=$('#tyOpen');
if(ty){try{const u=sessionStorage.getItem('wa');if(u&&u.indexOf('https://wa.me/919000320544?text=')===0)ty.href=u}catch(err){}}


/* Systems map: filter by project, tap a part to read where it was used */
const sys=$('#sys');
if(sys){
  const NAMES={ved:'Vedasri Traders',app:'the PG app',site:'the PG website',hitex:'Hitex Health Nest',udhaar:'UdhaarAI'};
  const fs=$$('.sys-f',sys),ns=$$('.sys-n',sys),det=$('#sysDetail'),dk=$('.sys-detail-k',det),dv=$('.sys-detail-v',det);
  const list=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
  const say=(k,v)=>{dk.textContent=k;dv.textContent=v;det.classList.remove('swap');void det.offsetWidth;det.classList.add('swap')};
  let proj='all';
  fs.forEach(f=>f.addEventListener('click',()=>{
    proj=f.dataset.f;fs.forEach(x=>x.setAttribute('aria-pressed',String(x===f)));
    ns.forEach(n=>{n.setAttribute('aria-pressed','false');n.classList.toggle('on',proj!=='all'&&n.dataset.p.split(' ').includes(proj))});
    sys.classList.toggle('filtering',proj!=='all');
    if(proj==='all')say('Tap any part','to see where I used it and what it does.');
    else{const used=ns.filter(n=>n.classList.contains('on'));const nm=NAMES[proj];say(nm[0].toUpperCase()+nm.slice(1),`needed ${used.length} of the ${ns.length} parts on this map: ${list(used.map(n=>{const t=n.textContent;return /^(WhatsApp|Instagram|AI)/.test(t)?t:t[0].toLowerCase()+t.slice(1)}))}.`)}
  }));
  ns.forEach(n=>n.addEventListener('click',()=>{
    const was=n.getAttribute('aria-pressed')==='true';
    ns.forEach(x=>x.setAttribute('aria-pressed','false'));
    if(was){fs.find(f=>f.dataset.f===proj).click();return}
    n.setAttribute('aria-pressed','true');
    say(n.textContent,n.dataset.d+' Used in '+list(n.dataset.p.split(' ').map(p=>NAMES[p]))+'.');
  }));
}

/* Nav indicator: sits under the current page, and on the home page follows the section being read */
const ind=$('.nav-ind');
if(ind){
  const links=$$('.nav-links a');
  let first=true;
  const moveTo=a=>{
    links.forEach(l=>l.classList.toggle('is-active',l===a));
    if(!a){ind.classList.remove('on');return}
    if(first){ind.style.transition='none';requestAnimationFrame(()=>requestAnimationFrame(()=>{ind.style.transition=''}));first=false}
    ind.style.width=a.offsetWidth+'px';ind.style.transform=`translateX(${a.offsetLeft}px)`;ind.classList.add('on');
  };
  const cur=links.find(l=>l.getAttribute('aria-current')==='page');
  const spy=links.map(l=>[l,document.getElementById((l.dataset.scroll||'').slice(1))]).filter(x=>x[1]);
  if($('.hero')&&spy.length&&'IntersectionObserver' in window){
    const vis=new Map();
    const io=new IntersectionObserver(es=>{es.forEach(e=>vis.set(e.target,e.isIntersecting));const hit=spy.find(([,s])=>vis.get(s));moveTo(hit?hit[0]:null)},{rootMargin:'-45% 0px -50% 0px'});
    spy.forEach(([,s])=>io.observe(s));
  }else if(cur)moveTo(cur);
  const again=()=>{const a=links.find(l=>l.classList.contains('is-active'));if(a)moveTo(a)};
  addEventListener('resize',again);document.fonts&&document.fonts.ready.then(again);
}

/* Fridge magnets: a slight pull toward the pointer, and a small snap when one is picked.
   On touch, the first tap lifts a magnet and shows its caption; a second tap opens it. */
const fridge=$('#fridge');
if(fridge){
  const mags=$$('.mag',fridge),fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine&&!reduce)mags.forEach(m=>{
    m.addEventListener('pointermove',e=>{const r=m.getBoundingClientRect();m.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*6);m.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*6)});
    m.addEventListener('pointerleave',()=>{m.style.setProperty('--mx',0);m.style.setProperty('--my',0)});
  });
  mags.forEach(m=>m.addEventListener('click',e=>{
    if(!fine&&!m.classList.contains('on')){e.stopImmediatePropagation();mags.forEach(x=>x.classList.toggle('on',x===m))}
    m.classList.remove('snap');void m.offsetWidth;m.classList.add('snap');
  },true));
  document.addEventListener('click',e=>{if(!e.target.closest('.mag'))mags.forEach(x=>x.classList.remove('on'))});
}

/* Pink Power Run medal: a few pixels of parallax against the certificate */
const ppr=$('#pprVis');
if(ppr&&!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  const medal=$('.ppr-medal',ppr);
  ppr.addEventListener('pointermove',e=>{const r=ppr.getBoundingClientRect();medal.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*-10);medal.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*-8)});
  ppr.addEventListener('pointerleave',()=>{medal.style.setProperty('--px',0);medal.style.setProperty('--py',0)});
}

/* Chat on phones: follow the keyboard, lock the page behind */
const vv=window.visualViewport;
const setVV=()=>{if(!vv)return;root.style.setProperty('--vvh',vv.height+'px');root.style.setProperty('--vvt',vv.offsetTop+'px')};
if(vv){vv.addEventListener('resize',setVV);vv.addEventListener('scroll',setVV);setVV()}
document.addEventListener('chat:toggle',e=>{const lock=!!e.detail&&innerWidth<=560;root.classList.toggle('chat-lock',lock);if(lenis)(e.detail?lenis.stop():lenis.start())});

/* ---------- Motion ---------- */
if(!window.gsap||!window.ScrollTrigger||reduce){unhide();return}
try{
gsap.registerPlugin(ScrollTrigger);
if(lenis)lenis.on('scroll',ScrollTrigger.update);
const EXPO='expo.out',M=isMobile();

if($('.hero')&&$('#heroTitle .h1-main')){
const h1=$('#heroTitle .h1-main');
const words=h1.textContent.trim().split(/\s+/);h1.textContent='';
words.forEach((w,k)=>{const sp=document.createElement('span');sp.className='w';sp.textContent=w;h1.append(sp);if(k<words.length-1)h1.append(' ')});

/* Page-load sequence. Phones: lighter, no blur. The photo stage stays still: nothing moves until the visitor brushes it */
const tl=gsap.timeline({defaults:{ease:EXPO}});
tl.fromTo('.hero-meta',{y:14,opacity:0},{y:0,opacity:1,duration:.9},.25)
  .fromTo('#heroTitle .w',M?{y:24,opacity:0}:{yPercent:60,opacity:0,filter:'blur(8px)'},M?{y:0,opacity:1,duration:.8,stagger:.04}:{yPercent:0,opacity:1,filter:'blur(0px)',duration:1.1,stagger:.05},.32)
  .fromTo('.hero-sub',{y:16,opacity:0},{y:0,opacity:1,duration:1},M?.6:.8)
  .fromTo('.hero-cta',{y:16,opacity:0},{y:0,opacity:1,duration:1},M?.7:.92);
window.__animReady=true;

}else{window.__animReady=true}

/* Inner pages: breadcrumb, intro and facts settle in */
if($('.page-hero')){gsap.fromTo('.page-hero .crumbs,.page-hero .lede,.facts > div,.detail-links',{y:16,opacity:0},{y:0,opacity:1,duration:.9,stagger:.06,ease:EXPO,delay:.15})}
if($('.detail-vis .phone'))gsap.fromTo('.detail-vis .phone',{rotate:-7,y:40},{rotate:3,y:0,ease:'none',scrollTrigger:{trigger:'.detail',start:'top 85%',end:'bottom 60%',scrub:.6}});

/* Nav tucks away going down, returns going up */
const nav=$('#nav');
if(nav)ScrollTrigger.create({start:0,end:'max',onUpdate:s=>{nav.classList.toggle('hide',s.direction===1&&s.scroll()>500&&!mn.classList.contains('open'))}});

/* Section headings */
$$('[data-reveal]').forEach(el=>gsap.fromTo(el,M?{y:26,opacity:0}:{y:30,opacity:0,filter:'blur(6px)'},M?{y:0,opacity:1,duration:.9,ease:EXPO,scrollTrigger:{trigger:el,start:'top 90%',once:true}}:{y:0,opacity:1,filter:'blur(0px)',duration:1.1,ease:EXPO,scrollTrigger:{trigger:el,start:'top 86%',once:true}}));

/* Numbers count up, circles draw themselves */
const countUp=el=>{const end=+el.dataset.count,dec=+(el.dataset.dec||0),suf=el.dataset.suf||'';const o={v:0};gsap.to(o,{v:end,duration:1.6,ease:'power3.out',onUpdate:()=>{el.textContent=o.v.toFixed(dec)+suf},onComplete:()=>{el.textContent=end.toFixed(dec)+suf}})};
$$('[data-count]').forEach(el=>ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>countUp(el)}));
$$('.ink path').forEach((p,i)=>{const L=p.getTotalLength();gsap.set(p,{strokeDasharray:L,strokeDashoffset:L});gsap.to(p,{strokeDashoffset:0,duration:1.1,ease:'power2.inOut',delay:.3+i*.18,scrollTrigger:{trigger:'.glance',start:'top 78%',once:true}})});

/* Handwriting turns into data */
$$('.p2s').forEach(r=>{
  const t=gsap.timeline({scrollTrigger:{trigger:r,start:'top 85%',once:true}});
  t.fromTo($('.paper span',r),{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.85,ease:'power1.inOut'})
   .fromTo($('.arrow',r),M?{y:-10,opacity:0}:{x:-14,opacity:0},{x:0,y:0,opacity:1,duration:.5,ease:EXPO},'-=.2')
   .fromTo($$('.row div',r),{opacity:0,y:6},{opacity:1,y:0,duration:.5,stagger:.1,ease:EXPO},'-=.25')
   .fromTo($('.who',r),{opacity:0},{opacity:1,duration:.5},'-=.3');
});

/* Lists and grids arrive in a quick stagger: upward on desktop, sideways on phones */
ScrollTrigger.batch('.certgrid figure,.results li,.loop li,.cult-row,.timeline li,.expo-list li,.acts-list li,.direct li,.aq-step,.oly,.mark,.rel-card,.faq-list details,.ticks li,.review',{
  start:'top 92%',once:true,
  onEnter:b=>gsap.fromTo(b,M?{x:-18,opacity:0}:{y:24,opacity:0},{x:0,y:0,opacity:1,duration:.7,stagger:.07,ease:EXPO,overwrite:true})
});

/* Reading order: inside a group, the heading lands first and each paragraph follows 80ms later */
$$('[data-stagger]').forEach(g=>gsap.fromTo(g.children,{y:18,opacity:0},{y:0,opacity:1,duration:.85,stagger:.08,ease:EXPO,scrollTrigger:{trigger:g,start:'top 88%',once:true}}));

/* Systems map: rows settle, then the parts arrive left to right, quickly */
if($('.sys-map')){
  const t=gsap.timeline({scrollTrigger:{trigger:'.sys-map',start:'top 82%',once:true}});
  t.fromTo('.sys-f',{y:10,opacity:0},{y:0,opacity:1,duration:.5,stagger:.04,ease:EXPO})
   .fromTo('.sys-q',{x:-12,opacity:0},{x:0,opacity:1,duration:.6,stagger:.09,ease:EXPO},'-=.3')
   .fromTo('.sys-n',{y:10,opacity:0},{y:0,opacity:1,duration:.5,stagger:.035,ease:EXPO,clearProps:'transform,opacity'},'-=.5')
   .fromTo('.sys-detail',{opacity:0},{opacity:1,duration:.6},'-=.2');
}

/* Trophy shelf: time moves left to right. Each shelf segment draws, then its trophy rises out of it */
if($('.shelf')){
  const t=gsap.timeline({scrollTrigger:{trigger:'.shelf',start:M?'top 85%':'top 78%',once:true}});
  $$('.trophy').forEach((tr,i)=>{
    const at=i*.22;
    t.fromTo($('.t-base',tr),{scaleX:0},{scaleX:1,duration:.7,ease:'power2.inOut'},at)
     .fromTo($('.t-when',tr),{y:8,opacity:0},{y:0,opacity:1,duration:.6,ease:EXPO},at+.1)
     .fromTo($('.t-fig',tr),{clipPath:'inset(100% -20% -20% -20%)',y:24},{clipPath:'inset(-20% -20% -20% -20%)',y:0,duration:1.05,ease:'power3.out',clearProps:'clipPath,transform'},at+.25)
     .fromTo($('.t-text',tr),{y:14,opacity:0},{y:0,opacity:1,duration:.7,ease:EXPO},at+.5);
  });
}

/* Gurukul: the certificate settles, then the medal is set down on top of it */
if($('.gurukul')){
  const t=gsap.timeline({scrollTrigger:{trigger:'.gurukul',start:'top 80%',once:true}});
  t.fromTo('.g-cert',{y:30,opacity:0},{y:0,opacity:1,duration:1,ease:EXPO})
   .fromTo('.g-medal',{y:-36,opacity:0,rotate:-14},{y:0,opacity:1,rotate:0,duration:1.1,ease:'power3.out',clearProps:'transform'},'-=.55');
  if(!M)gsap.fromTo('.g-medal img',{yPercent:6},{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.gurukul',start:'top bottom',end:'bottom top',scrub:.6}});
}

/* Runs: the poster unmasks top-down, the countdown badge draws in */
if($('.runs')){
  const t=gsap.timeline({scrollTrigger:{trigger:'.runs-pair',start:'top 82%',once:true}});
  t.fromTo('.run-side',{y:10,opacity:0},{y:0,opacity:1,duration:.6,stagger:.15,ease:EXPO})
   .fromTo('.run-poster',{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.1,ease:'power3.inOut',clearProps:'clipPath'},'-=.3')
   .fromTo('.run-badge',{scale:.9,opacity:0},{scale:1,opacity:1,duration:.7,ease:EXPO},'-=.8');
}

/* The 50 lands with weight */
if($('.fifty'))gsap.fromTo('.fifty',{y:40,opacity:0,scale:M?.9:1},{y:0,opacity:1,scale:1,duration:1.2,ease:EXPO,scrollTrigger:{trigger:'.fifty',start:'top 88%',once:true}});

/* Project cards: desktop stacks and settles back; phones get cards that rise in and phones that swing upright */
const mm=gsap.matchMedia();
mm.add('(min-width: 921px) and (min-height: 901px)',()=>{
  const cs=$$('.case');
  cs.forEach((c,i)=>{if(i<cs.length-1)gsap.to(c,{scale:.93,filter:'brightness(.84)',ease:'none',scrollTrigger:{trigger:cs[i+1],start:'top bottom-=10%',end:'top 22%',scrub:true}})});
});
mm.add('(max-width: 920px)',()=>{
  $$('.case').forEach(c=>{
    gsap.fromTo(c,{y:50,opacity:0,scale:.96},{y:0,opacity:1,scale:1,duration:.9,ease:EXPO,scrollTrigger:{trigger:c,start:'top 90%',once:true}});
    const ph=$('.phone',c);if(ph)gsap.fromTo(ph,{rotate:-9,y:40},{rotate:3,y:0,ease:'none',scrollTrigger:{trigger:ph,start:'top bottom',end:'center 55%',scrub:.6}});
  });
  if($('.flex-card img'))gsap.fromTo('.flex-card img',{yPercent:12},{yPercent:0,ease:'none',scrollTrigger:{trigger:'.flex-card',start:'top bottom',end:'center center',scrub:.6}});
});

const refresh=()=>ScrollTrigger.refresh();
addEventListener('load',refresh);
document.fonts&&document.fonts.ready.then(refresh);
}catch(err){unhide();console.error(err)}
})();
