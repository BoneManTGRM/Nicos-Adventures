'use strict';
window.TimberStride=(()=>{
  const species='grizzly kodiak blackbear polar elephant lion warthog buffalo zebra elk arcticfox muskox'.split(' ');
  const sheets=new Map(),pending=new Map();
  function load(k){
    if(!species.includes(k))return Promise.resolve(null);
    if(!pending.has(k))pending.set(k,new Promise(resolve=>{
      const image=new Image();image.onload=()=>{
        const sheet={image,w:image.width/4,h:image.height/4,frames:new Map()};sheets.set(k,sheet);resolve(sheet);
      };image.onerror=()=>resolve(null);image.src='assets/stride/'+k+'.webp';
    }));return pending.get(k);
  }
  function tint(pixels,coat,k){
      for(let i=0;i<pixels.length;i+=4){if(!pixels[i+3])continue;
        const y=.30*pixels[i]+.58*pixels[i+1]+.12*pixels[i+2];
        if(coat===true){const v=42+Math.sqrt(y/255)*207;pixels[i]=v+5;pixels[i+1]=v+2;pixels[i+2]=v-5;}
        else if(k==='polar'){pixels[i]=y*.72;pixels[i+1]=y*.88+24;pixels[i+2]=y*.86+22;}
        else{pixels[i]=y*1.18+26;pixels[i+1]=y*.88+17;pixels[i+2]=y*.49+12;}
      }
  }
  function frame(k,phase,coat){
    const sheet=sheets.get(k);
    if(!sheet||(typeof coat==='string'&&coat!=='legend'))return null;
    const index=((Math.round((Number.isFinite(phase)?phase:0)*8/Math.PI)%16)+16)%16;
    const key=index+':'+(coat||'common');
    if(sheet.frames.has(key))return sheet.frames.get(key);
    const {w,h,image}=sheet,surface=document.createElement('canvas');surface.width=w;surface.height=h;
    const g=surface.getContext('2d');g.drawImage(image,index%4*w,Math.floor(index/4)*h,w,h,0,0,w,h);
    const data=g.getImageData(0,0,w,h),pixels=data.data;
    if(coat){
      tint(pixels,coat,k);g.putImageData(data,0,0);
    }
    const result={surface,w,h,phaseIndex:index,phaseCount:16,stride:true,px:new Uint32Array(pixels.buffer)};sheet.frames.set(key,result);return result;
  }
  species.forEach(load);
  return {frame,load,tint,supports:k=>species.includes(k),ratio:k=>{const s=sheets.get(k);return s?s.w/s.h:null;}};
})();
