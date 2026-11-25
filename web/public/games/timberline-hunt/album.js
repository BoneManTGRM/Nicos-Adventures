'use strict';
const FieldAlbum=(()=>{
  const known=t=>!!t&&Object.hasOwn(HuntRules.wildlife,t.species)&&Object.hasOwn(HuntRules.byKey,t.reserve)&&HuntRules.grades.includes(t.medal)&&['common','ivory','legend'].includes(t.coat)&&Number.isFinite(t.kg)&&Number.isFinite(t.date)&&Number.isFinite(t.phase)&&Number.isFinite(t.x);
  function clean(raw){
    return Object.fromEntries(Object.keys(HuntRules.wildlife).filter(k=>known(raw?.[k])&&raw[k].species===k).map(k=>[k,raw[k]]));
  }
  function capture(animal,reserve){
    const s=animal.specimen;
    return {species:animal.species,reserve:reserve.key,coat:s.coat,medal:s.medal,kg:s.kg,x:Math.max(0,Math.min(1,animal.x)),phase:animal.phase,direction:animal.direction,date:Date.now()};
  }
  function rank(t){return (t.coat==='legend'||PursuitRules.signature(t)?8:t.coat==='ivory'?4:0)+HuntRules.grades.indexOf(t.medal);}
  function keep(rec,t){
    const prior=rec.photos[t.species];
    if(prior&&(rank(prior)>rank(t)||rank(prior)===rank(t)&&prior.kg>=t.kg))return false;
    rec.photos[t.species]=t;return true;
  }
  function gallery(rec){
    const items=Object.values(rec.photos).sort((a,b)=>b.date-a.date);
    return '<div class="section-label"><h3>Field postcards</h3><span>'+items.length+' / '+Object.keys(HuntRules.wildlife).length+' animals</span></div><p class="lodge-note">Tap an animal in camera mode to photograph it. The album keeps the rarest coat for each animal, then the highest medal and weight.</p>'+
      (items.length?'<div class="photo-grid">'+items.map(t=>'<button data-act="photo" data-species="'+t.species+'"><span class="photo-thumb" style="background-image:url(assets/'+RangeRules.background(t)+'.webp)">'+TrophyLodge.portrait(t,180,75)+'</span><b>'+TrophyLodge.name(t)+'</b><small>'+RangeRules.place(t)+'</small></button>').join('')+'</div>':'<p class="empty-state">Your first field photo will appear here.</p>');
  }
  const backdropCache=new Map();
  function backdrop(key){
    if(!backdropCache.has(key))backdropCache.set(key,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{backdropCache.delete(key);reject(new Error('Landscape unavailable'));};im.src='assets/'+key+'.webp';}));
    return backdropCache.get(key);
  }
  async function picture(t){
    const c=document.createElement('canvas');c.width=960;c.height=690;
    const g=c.getContext('2d'),im=await backdrop(RangeRules.background(t)),w=916,h=495,ox=22,oy=22;
    g.fillStyle='#f1e6c9';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
    const cropWidth=Math.min(im.width,im.height*w/h),cropHeight=cropWidth*h/w;
    const sx=(im.width-cropWidth)*(.22+.56*t.x);
    g.drawImage(im,sx,im.height-cropHeight,cropWidth,cropHeight,ox,oy,w,h);
    const ratio=TimberWildlife.bounds(t.species,1).width,animalH=Math.min(h*.66,w*.64/ratio);
    const x=ox+w*(.43+.14*t.x),y=oy+h*.925;
    if(t.species!=='pheasant'){g.fillStyle='#18201648';g.beginPath();g.ellipse(x,y-2,ratio*animalH*.36,animalH*.032,0,0,Math.PI*2);g.fill();}
    TimberWildlife.draw(g,t.species,x,y,animalH,t.direction===-1?-1:1,t.phase,TrophyLodge.palette(t));
    g.fillStyle='#4e604b';g.font='bold 20px monospace';g.fillText('TIMBERLINE  /  FIELD POSTCARD',24,555);
    const n=TrophyLodge.name(t);let px=46;g.fillStyle='#202e25';
    do{g.font='bold '+px+'px Georgia,serif';if(g.measureText(n).width<900)break;px-=2;}while(px>24);
    g.fillText(n,24,608);g.font='23px Georgia,serif';g.fillStyle='#465846';
    g.fillText(RangeRules.place(t)+'  ·  '+new Date(t.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}),24,655);
    return c.toDataURL('image/png');
  }
  function open(root,t){
    const holder=root.querySelector('.postcard-holder'),link=root.querySelector('.download-postcard');
    picture(t).then(src=>{
      if(!holder.isConnected)return;
      const img=new Image();img.alt=TrophyLodge.name(t)+' at '+RangeRules.place(t);img.src=src;holder.replaceChildren(img);
      link.href=src;link.download='Timberline-'+t.species+'-'+new Date(t.date).toISOString().slice(0,10)+'.png';link.hidden=false;
    }).catch(()=>{if(holder.isConnected)holder.textContent='The landscape could not load. Reopen the postcard to try again.';});
  }
  return {clean,capture,keep,gallery,open,picture};
})();
