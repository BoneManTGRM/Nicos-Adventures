'use strict';
const DeluxeWildlife=(()=>{
  const species=new Set('elephant lion warthog kodiak grizzly polar zebra buffalo muskox arcticfox blackbear elk'.split(' '));
  const loaded=new Map(),pending=new Map();
  function load(k){
    if(!species.has(k))return Promise.resolve(null);
    if(!pending.has(k))pending.set(k,new Promise(resolve=>{
      const im=new Image();
      im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
        const item={im,mask:g.getImageData(0,0,c.width,c.height).data,ratio:c.width/c.height};loaded.set(k,item);resolve(item);};
      im.onerror=()=>resolve(null);im.src='assets/deluxe/'+k+'.webp';
    }));return pending.get(k);
  }
  function bounds(k,h){return {width:h*(loaded.get(k)?.ratio||TimberWildlife.bounds(k,1).width),height:h};}
  function draw(g,k,x,y,h,dir,phase,coat=false){
    const item=loaded.get(k);
    if(!item||typeof coat==='string'&&coat!=='legend'){TimberWildlife.draw(g,k,x,y,h,dir,phase,coat);return;}
    const w=h*item.ratio;g.save();g.imageSmoothingEnabled=true;g.translate(x,y);g.scale(dir===1?-1:1,1);
    if(coat==='legend'){g.shadowColor='#ffd386';g.shadowBlur=5;g.filter='sepia(.25) saturate(1.32) brightness(1.13)';}
    else if(coat===true)g.filter='saturate(.35) brightness(1.5)';
    g.drawImage(item.im,-w/2,-h,w,h);g.restore();
  }
  function hitTest(k,x,y,h,dir,phase,px,py,pad=0){
    const item=loaded.get(k);if(!item)return TimberWildlife.hitTest(k,x,y,h,dir,phase,px,py,pad);
    const im=item.im,scale=im.height/h,u=(px-x)*(dir===1?-1:1)*scale+im.width/2,v=(py-y)*scale+im.height;
    const sample=(a,b)=>{const ix=Math.floor(a),iy=Math.floor(b);return ix>=0&&ix<im.width&&iy>=0&&iy<im.height&&item.mask[(iy*im.width+ix)*4+3]>40;};
    if(sample(u,v))return true;
    for(const r of [.5,1])for(let j=0;j<8;j++){const rad=j*Math.PI/4;if(sample(u+Math.cos(rad)*pad*r*scale,v+Math.sin(rad)*pad*r*scale))return true;}
    return false;
  }
  return {load,bounds,draw,hitTest,has:k=>species.has(k)};
})();
