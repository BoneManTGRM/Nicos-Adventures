'use strict';
const RangePrints=(()=>{
  const R=RangeRules;
  const images=new Map();
  function landscape(id){
    if(!images.has(id))images.set(id,new Promise((resolve,reject)=>{
      const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(id);reject(new Error('Landscape unavailable'));};
      im.src='assets/range/'+id+'.webp';
    }));
    return images.get(id);
  }
  const title=pic=>['','Solo portrait','Wild pair','Full migration'][R.size(pic)]+(pic?.gilt?' · Gold exposure':'');
  async function draw(canvas,pic){
    const a=R.byId[pic.id],bg=await landscape(a.id),g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    const ratio=w/1440;g.save();g.scale(ratio,ratio);const bottom=h/ratio;
    g.fillStyle=pic.gilt?'#edc978':'#ecdfbc';g.fillRect(0,0,1440,bottom);
    const x=19,y=19,pw=1402,ph=bottom-158;
    const scale=Math.max(pw/bg.width,ph/bg.height),sw=pw/scale,sh=ph/scale;
    g.drawImage(bg,(bg.width-sw)*.56,(bg.height-sh)*.62,sw,sh,x,y,pw,ph);
    if(pic.sky){g.fillStyle=pic.sky===1?'rgba(154,61,21,.17)':'rgba(24,45,92,.32)';g.fillRect(x,y,pw,ph);}
    const settings=[[.23,.82,.31],[.77,.76,.25],[.52,.93,.44]];
    for(const i of [1,0,2]){
      const t=pic.cast[i];if(!t)continue;
      const [pos,feet,size]=settings[i],ah=ph*size,aw=TimberWildlife.bounds(t.species,ah).width;
      g.fillStyle='#171c1d50';g.beginPath();g.ellipse(x+pw*pos,y+ph*feet-2,aw*.34,ah*.035,0,0,Math.PI*2);g.fill();
      TimberWildlife.draw(g,t.species,x+pw*pos,y+ph*feet,ah,i===1?-1:1,t.phase,TrophyLodge.palette(t));
    }
    if(pic.gilt){g.strokeStyle='#886227';g.lineWidth=3;g.strokeRect(7,7,1426,bottom-14);}
    g.fillStyle='#283a2e';g.font='bold 44px Georgia, serif';g.fillText(a.event,27,bottom-76);
    g.font='25px system-ui, sans-serif';g.fillText(a.name+'  ·  '+R.skies[pic.sky]+'  ·  '+title(pic),29,bottom-30);
    g.textAlign='right';g.font='bold 21px monospace';g.fillText(new Date(pic.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}),1410,bottom-32);g.restore();
    return canvas;
  }
  function galleryHTML(book){
    return '<div class="range-prints">'+R.ranges.map(a=>{
      const log=book.logs[a.id],p=log.best;
      return '<article><div class="range-printmat">'+(p?'<canvas width="1120" height="560" data-print="'+a.id+'" role="img" aria-label="'+title(p)+' at '+a.name+'"></canvas>':'<div class="range-printempty" style="background-image:linear-gradient(#17262080,#172620ab),url(assets/range/'+a.id+'.webp)"><span>◇</span></div>')+'</div><div><strong>'+a.name+'</strong><small>'+(p?title(p)+' · '+log.clears+' crossing'+(log.clears===1?'':'s'):'Complete the crossing to frame a panorama.')+'</small></div>'+(p?'<a class="range-download" data-saveprint="'+a.id+'" hidden>Save picture</a>':'')+'</article>';
    }).join('')+'</div>';
  }
  function attach(canvas,pic,link){
    draw(canvas,pic).then(()=>{
      if(!canvas.isConnected||!link)return;
      link.href=canvas.toDataURL('image/png');link.download='Timberline-'+pic.id+'-migration.png';link.hidden=false;
    }).catch(()=>{if(canvas.isConnected){const message=document.createElement('p');message.textContent='Reopen this panorama to load its landscape.';canvas.replaceWith(message);}});
  }
  return {title,draw,galleryHTML,attach};
})();
