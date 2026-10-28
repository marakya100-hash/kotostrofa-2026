'use strict';
(function(global){
const dateFormatter = new Intl.DateTimeFormat('en-CA',{timeZone:global.KOTOSTROFA_CONFIG.timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
function dateKey(date){const p=Object.fromEntries(dateFormatter.formatToParts(date).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;}
function available(entries,date){const key=dateKey(date);return entries.filter(x=>x.date<=key);}
function newYearCountdown(date){
 const nextYear=global.KOTOSTROFA_CONFIG.year+1;
 // New Year starts at 00:00 in Ufa (UTC+5); only complete 24-hour periods count.
 const target=new Date(`${nextYear}-01-01T00:00:00+05:00`).getTime();
 const remaining=target-date.getTime();
 const days=Math.max(0,Math.floor(remaining/86400000));
 const one=days%10===1&&days%100!==11;
 const few=days%10>=2&&days%10<=4&&(days%100<12||days%100>14);
 const unit=one?'полный день':few?'полных дня':'полных дней';
 const passed=remaining<=0;
 const text=passed?`С Новым ${nextYear} годом!`:days===0?'До Нового года меньше суток!':`До Нового года ${one?'остался':'осталось'} ${days} ${unit}`;
 return {days,unit,text,passed,nextYear};
}
function reactionLabels(day){return day===31?['и вам не хворать!','С новым счастьем!']:['жиза','пока держусь'];}
function sanitize(data){const viewed=Array.isArray(data?.viewed)?data.viewed.filter(x=>global.KOTOSTROFA_MEMES.some(m=>m.date===x)):[];const reactions={};for(const m of global.KOTOSTROFA_MEMES){if([0,1].includes(data?.reactions?.[m.date]))reactions[m.date]=data.reactions[m.date];}return {viewed:[...new Set(viewed)],reactions};}
global.KotostrofaCore={dateKey,available,newYearCountdown,reactionLabels,sanitize};
// Подменяется только в локальной проверке, без элементов управления на сайте.
global.KotostrofaClock=global.KotostrofaClock||(()=>new Date());
})(window);
