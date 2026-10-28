'use strict';
(()=>{
const C=window.KOTOSTROFA_CONFIG,M=window.KOTOSTROFA_MEMES,core=window.KotostrofaCore;
const $=id=>document.getElementById(id);const dialog=$('meme-dialog');
let state={viewed:[],reactions:{}},storageOK=true,current=null,opener=null,loadId=0,lastDate='',lastCountdownText='',toastTimer;
try{const probe=C.storageKey+':probe';localStorage.setItem(probe,'1');localStorage.removeItem(probe);const raw=localStorage.getItem(C.storageKey);if(raw)state=core.sanitize(JSON.parse(raw));}catch{storageOK=false;}
function persist(){try{localStorage.setItem(C.storageKey,JSON.stringify(state));return true;}catch{storageOK=false;storageWarning();return false;}}
function storageWarning(){$('storage-warning').hidden=storageOK;}
function now(){return window.KotostrofaClock();}
function key(){return core.dateKey(now());}
function accessible(){return core.available(M,now());}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},3500);}
function icon(name,cls=''){return `<svg class="${cls}" aria-hidden="true"><use href="#${name}"/></svg>`;}
const patterns=['stars','dots','crosses','stripes','stars'];
function render(){
 const today=key();lastDate=today;
 updateCountdown();
 const first=M[0].date,last=M[M.length-1].date;
 const isSeason=today>=first&&today<=last;
 $('season-status').textContent=today<first?'Начинаем 15 декабря. Коты пока собираются с силами':today>last?'Мы это пережили. Все коты открыты — можно пересматривать':'Один день. Один кот. Держимся вместе.';
 const cta=$('today-button');cta.hidden=today<first;cta.innerHTML=(isSeason?'Открыть сегодняшний мем':'Открыть поздравление')+' <span aria-hidden="true">↗</span>';
 // Preserve the actual button nodes so modal close always restores focus.
 if(!$('calendar').children.length){for(const [i,m] of M.entries()){const b=document.createElement('button');b.type='button';b.className=`day-card tone-${i%5} ${patterns[i%5]}${m.day===31?' finale':''}`;b.id=`day-${m.day}`;b.dataset.day=m.day;b.addEventListener('click',()=>{if(m.date>key()){toast(`Пока секрет! Откроется ${m.day} декабря`);return;}openMeme(m,b);});$('calendar').append(b);}}
 for(const m of M){const b=$(`day-${m.day}`),locked=m.date>today,viewed=state.viewed.includes(m.date),isToday=m.date===today;b.classList.toggle('locked',locked);b.classList.toggle('viewed',viewed);b.classList.toggle('today',isToday);b.setAttribute('aria-disabled',String(locked));b.setAttribute('aria-label',`${m.day} декабря${isToday?', сегодня':''}. ${locked?`Пока секрет! Откроется ${m.day} декабря`:viewed?'Уже открыто. Открыть снова':'Открыть мем'}`);b.title=locked?`Пока секрет! Откроется ${m.day} декабря`:'';b.innerHTML=`<span class="gift-ribbon" aria-hidden="true"></span><span class="gift-ribbon-cross" aria-hidden="true"></span><span class="gift-bow" aria-hidden="true"><i></i><i></i><b></b></span><span class="door-border"></span>${isToday?'<span class="today-tag">Сегодня</span>':''}<span class="card-top">${m.day===31?'С НОВЫМ ГОДОМ!':'ДЕКАБРЬ'}</span><span class="day-number">${m.day}</span><span class="card-decoration" aria-hidden="true">${m.day===31?'✦':iDecoration(m.day)}</span><span class="card-state">${locked?`<span class="closed-state"><span class="secret-title">${icon('lock')}Пока секрет! </span><span>Откроется ${m.day} декабря</span></span>`:(viewed?icon('paw'):'<span aria-hidden="true">↗</span>')+(viewed?'Уже открыто':'Открыть окошко')}</span>`;}
 $('progress-label').textContent=`Открыто ${state.viewed.length} из 17 окошек`;$('progress-fill').style.width=`${state.viewed.length/17*100}%`;document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',state.viewed.length);storageWarning();if(current)updateNav();
}
function iDecoration(day){return day%3===0?'✦':day%3===1?'✧':icon('paw');}
function updateNav(){const days=accessible(),i=days.findIndex(m=>m.date===current?.date);$('prev-day').disabled=i<=0;$('next-day').disabled=i<0||i>=days.length-1;}
function renderReactions(){const labels=core.reactionLabels(current.day);$('reactions').replaceChildren();for(const [i,label] of labels.entries()){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',String(state.reactions[current.date]===i));b.onclick=()=>{state.reactions[current.date]=i;const saved=persist();[...$('reactions').children].forEach((button,index)=>button.setAttribute('aria-pressed',String(index===i)));$('reaction-notice').textContent=saved?'Реакция сохранена':'Реакция выбрана. В этом браузере сохранить её не удалось';};$('reactions').append(b);}}
function setZoom(zoomed){
 $('image-scroll').classList.toggle('is-zoomed',zoomed);$('zoom-button').setAttribute('aria-pressed',String(zoomed));
 $('zoom-button').setAttribute('aria-label',zoomed?'Уменьшить изображение':'Увеличить изображение');
 $('zoom-symbol').textContent=zoomed?'−':'+';$('zoom-label').textContent=zoomed?'Уменьшить':'Увеличить';
 $('zoom-hint').textContent=zoomed?'Увеличено — можно прокручивать':'Картинка целиком';
 $('image-scroll').scrollTop=0;$('image-scroll').scrollLeft=0;
}
function loadImage(){
 const ticket=++loadId,m=current,old=$('meme-image');const img=new Image();img.id='meme-image';img.width=1122;img.height=1402;img.alt=m.alt;img.hidden=true;old.replaceWith(img);
 setZoom(false);$('zoom-button').disabled=true;$('download-image').hidden=true;$('loading').hidden=false;$('image-error').hidden=true;
 img.onload=()=>{if(ticket!==loadId||!dialog.open)return;$('loading').hidden=true;img.hidden=false;$('zoom-button').disabled=false;
 const download=$('download-image');download.href=m.image;download.download=`kotostrofa-${m.date}.png`;download.hidden=false;
 if(!state.viewed.includes(m.date)){state.viewed.push(m.date);persist();render();}
 if(m.day===31&&!matchMedia('(prefers-reduced-motion: reduce)').matches){dialog.classList.remove('celebrate');void dialog.offsetWidth;dialog.classList.add('celebrate');}};
 img.onerror=()=>{if(ticket!==loadId||!dialog.open)return;$('loading').hidden=true;$('image-error').hidden=false;};img.src=m.image;
}
function openMeme(m,button){if(m.date>key())return;if(!dialog.open){opener=button||$(`day-${m.day}`);dialog.showModal();document.body.classList.add('modal-open');}current=m;$('dialog-title').textContent=`${m.day} декабря 2026`;$('reaction-notice').textContent='';renderReactions();updateNav();loadImage();$('close-dialog').focus();}
function close(){if(dialog.open)dialog.close();}
$('close-dialog').onclick=close;dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
dialog.addEventListener('close',()=>{loadId++;current=null;document.body.classList.remove('modal-open');opener?.focus();});
dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusables=[...dialog.querySelectorAll('button:not(:disabled),a[href]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));if(!focusables.length){e.preventDefault();return;}const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
$('today-button').onclick=()=>{const m=M.find(m=>m.date===key())||M.at(-1);openMeme(m,$('today-button'));};
$('prev-day').onclick=()=>navigate(-1);$('next-day').onclick=()=>navigate(1);
function navigate(delta){const days=accessible(),i=days.findIndex(m=>m.date===current.date);if(days[i+delta])openMeme(days[i+delta]);}
$('retry').onclick=loadImage;$('zoom-button').onclick=()=>setZoom(!$('image-scroll').classList.contains('is-zoomed'));
function updateCountdown(){
 const value=core.newYearCountdown(now());if(value.text===lastCountdownText)return;
 lastCountdownText=value.text;
 $('countdown').setAttribute('aria-label',value.text);$('countdown').classList.toggle('new-year',value.passed);
 $('countdown-head').textContent=value.passed?'С НОВЫМ ГОДОМ!':'ДО НОВОГО ГОДА';
 $('countdown-number').textContent=value.passed?value.nextYear:value.days;
 $('countdown-unit').textContent=value.passed?'С новым счастьем!':value.days===0?'Меньше суток!':value.unit;
}
function refresh(){if(key()!==lastDate)render();else updateCountdown();}
setInterval(refresh,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});window.addEventListener('focus',refresh);window.addEventListener('storage',e=>{if(e.key!==C.storageKey)return;try{state=core.sanitize(JSON.parse(e.newValue));render();if(current)renderReactions();}catch{/* Keep current visit state. */}});
for(let i=0;i<29;i++){const b=document.createElement('i');b.style.setProperty('--i',i);b.style.setProperty('--drop',`${21+Math.sin(i*.64)**2*34}px`);$('bulbs').append(b);}
render();
})();
