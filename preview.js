'use strict';
// Only preview.html includes this script. Real dates and stored progress on index.html stay independent.
(()=>{
const control=document.getElementById('preview-date');
const previewKey='kotostrofa-2026:preview:v1';
let simulatedDate=control.value;
window.KOTOSTROFA_CONFIG=Object.freeze({...window.KOTOSTROFA_CONFIG,storageKey:previewKey});
window.KotostrofaClock=()=>new Date(simulatedDate);
control.addEventListener('change',()=>{
 const dialog=document.getElementById('meme-dialog');if(dialog.open)dialog.close();
 simulatedDate=control.value;
 document.getElementById('preview-open-first').disabled=simulatedDate.startsWith('2026-12-14');
 window.dispatchEvent(new Event('focus'));
});
document.getElementById('preview-open-first').addEventListener('click',()=>document.getElementById('day-15').click());
document.getElementById('preview-reset').addEventListener('click',()=>{
 try{localStorage.removeItem(previewKey);}catch{/* Reload also clears the current visit's in-memory state. */}
 window.location.reload();
});
})();
