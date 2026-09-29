/* Thank-you page: the enquiry the visitor just sent to WhatsApp prints out of a small desk printer.
   The form stores its values in sessionStorage before leaving, and this page only reads them.
   Nothing is sent anywhere. Every value is written with textContent, so any characters print as typed.
   Mechanism: the printer sits above the paper; the paper's container is clipped at the slot, and the sheet
   slides from translateY(-100%) to 0, so it can only ever be seen coming out of the slot. Each printed line
   inks in at the moment it clears the slot. */
(function(){
'use strict';
const scene=document.getElementById('printScene');
if(!scene)return;
const $=id=>document.getElementById(id);
const stage=$('prStage'),sheet=$('sheet');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

let d=null;
try{d=JSON.parse(sessionStorage.getItem('enq')||'null')}catch(e){}
if(!d||typeof d.name!=='string'||typeof d.msg!=='string'||!d.name.trim()||!d.msg.trim()){
  scene.classList.add('pr-empty');
  $('prTitle').textContent='Nothing to print yet';
  $('prLede').textContent='Fill in the enquiry form and it will print here, after WhatsApp opens with your message.';
  const open=$('tyOpen');open.href='/enquiry';open.removeAttribute('target');open.lastChild.textContent='Write an enquiry';
  return;
}

const when=new Date(typeof d.at==='number'?d.at:Date.now());
const pad=n=>String(n).padStart(2,'0');
$('shName').textContent=d.name.trim();
$('shWho').textContent=(d.who||'').trim()||'General enquiry';
$('shReply').textContent=(d.reply||'').trim()||'This WhatsApp chat';
$('shMsg').textContent=d.msg.trim();
$('shNo').textContent=`Nº ${when.getFullYear()}${pad(when.getMonth()+1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}`;
$('shDate').textContent=when.toLocaleString('en-IN',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'});

const first=d.name.trim().split(/\s+/)[0];
function finish(){
  stage.classList.remove('is-printing','is-waking');
  stage.classList.add('is-done');
  $('prTitle').textContent=`Thanks, ${first}. Your enquiry is ready.`;
  $('prLede').textContent='WhatsApp opened in a new tab with this exact message. Tap send there and I\'ll reply soon.';
  $('prStatus').textContent='Printed '+when.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
}

if(reduce||!sheet.animate){stage.classList.add('is-still');finish();return}

const WAKE=650;
requestAnimationFrame(()=>{
  const H=sheet.offsetHeight;
  // Feed time grows with the sheet, so a long message still prints at a believable pace
  const D=Math.min(6200,Math.max(2600,1600+H*3.2));
  const LINEAR=.94,TRAVEL=.96;
  // A line appears once its bottom edge has cleared the slot
  sheet.querySelectorAll('.pl').forEach(el=>{
    const bottom=el.offsetTop+el.offsetHeight;
    const t=WAKE+LINEAR*D*Math.max(0,(H-bottom)/(TRAVEL*H));
    el.style.animationDelay=Math.round(t)+'ms';
  });
  stage.classList.add('is-animating','is-waking');
  setTimeout(()=>{stage.classList.remove('is-waking');stage.classList.add('is-printing')},WAKE-150);
  const feed=sheet.animate([
    {transform:'translateY(-100%)',easing:'linear'},
    {transform:`translateY(-${(1-TRAVEL)*100}%)`,offset:LINEAR,easing:'cubic-bezier(.2,.7,.3,1)'},
    {transform:'translateY(0)'}
  ],{duration:D,delay:WAKE,fill:'both'});
  feed.finished.then(finish).catch(finish);
});
})();
