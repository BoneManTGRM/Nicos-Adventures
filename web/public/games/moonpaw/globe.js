'use strict';

// Orthographically project a rotating, texture-mapped sphere. Geometry and lighting
// are shared by every world. Only the longitude offset changes as the globe turns.
const smallPlanetView=typeof window!=='undefined'&&Math.min(window.innerWidth,window.innerHeight)<=540;
const globeDiameter=smallPlanetView?224:288, atlasWidth=1024, atlasHeight=512;
let globeGeometry;
function surfaceUV(x,y,turn){
  const z=Math.sqrt(Math.max(0,1-x*x-y*y));
  return {u:.5+Math.atan2(x,z)/(2*Math.PI)+turn,v:.5+Math.asin(Math.max(-1,Math.min(1,y)))/Math.PI};
}
function makeGeometry(){
  const count=globeDiameter*globeDiameter,offset=new Int32Array(count),u=new Int16Array(count),
    light=new Float32Array(count),rim=new Float32Array(count),spec=new Float32Array(count),alpha=new Uint8Array(count),depth=new Float32Array(count);
  const half=globeDiameter/2;
  for(let i=0;i<count;i++){
    const x=(i%globeDiameter+.5-half)/half,y=(Math.floor(i/globeDiameter)+.5-half)/half,rr=x*x+y*y;
    if(rr>=1)continue;
    const z=depth[i]=Math.sqrt(1-rr),uv=surfaceUV(x,y,0);
    offset[i]=Math.min(atlasHeight-1,Math.floor(uv.v*atlasHeight))*atlasWidth;
    u[i]=Math.floor(uv.u*atlasWidth);
    const sun=Math.max(0,-.54*x-.57*y+.62*z);
    light[i]=.205+.94*sun;
    rim[i]=Math.pow(1-z,2.8)*(.24+.76*sun);
    spec[i]=Math.pow(Math.max(0,-.31*x-.33*y+.89*z),23);
    alpha[i]=Math.min(255,(1-Math.sqrt(rr))*half*255);
  }
  return{offset,u,light,rim,spec,alpha,z:depth};
}
function penLine(c,points,color,width){
  c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);
  c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function damageStamp(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=112;
  const c=canvas.getContext('2d');c.translate(56,56);c.lineCap='round';c.lineJoin='round';
  function fog(stops,r=50){
    const g=c.createRadialGradient(0,0,0,0,0,r);
    for(const [a,color] of stops)g.addColorStop(a,color);
    c.fillStyle=g;c.fillRect(-55,-55,110,110);
  }
  if(kind==='nova'){
    fog([[0,'#120b1cf5'],[.52,'#211326ed'],[.64,'#381e28f5'],[.7,'#ffa27cf2'],[.76,'#865755d9'],[1,'#2c172800']]);
    c.beginPath();c.ellipse(0,2,32,31,-.4,Math.PI*.9,Math.PI*1.68);c.strokeStyle='#ffd3a9cc';c.lineWidth=2.5;c.stroke();
    for(let i=0;i<9;i++){c.save();c.rotate(i*2.4);penLine(c,[[20,4],[31,1],[35,3],[46,-2]],'#44222aaf',2);c.restore()}
  }else if(kind==='solar'){
    fog([[0,'#fff7a6ff'],[.19,'#ffb22dff'],[.43,'#e84d0ff5'],[.68,'#722111da'],[.82,'#261523b0'],[1,'#22142500']]);
    for(let i=0;i<9;i++){c.save();c.rotate(i*2.4);const line=[[6,0],[15,3],[26,-3],[32,1],[45,-5]];penLine(c,line,'#942f11',4);penLine(c,line,'#ffbd43',1.6);c.restore()}
  }else if(kind==='cryo'){
    fog([[0,'#e6ffffff'],[.48,'#8aebf7f5'],[.72,'#4baac9d9'],[1,'#76f4ff00']]);
    for(let i=0;i<7;i++){
      c.save();c.rotate(i*Math.PI*2/7);const len=36+(i%3)*6;
      penLine(c,[[0,0],[6,-len*.47],[2,-len]],'#eaffff',2.8);
      penLine(c,[[5,-len*.52],[-5,-len*.7]],'#dafcff',2);penLine(c,[[4,-len*.68],[13,-len*.83]],'#f0ffff',1.5);c.restore();
    }
  }else{
    fog([[0,'#140d2aff'],[.33,'#281632ff'],[.47,'#b365e5e8'],[.55,'#452a5ce6'],[1,'#25153500']]);
    for(let i=0;i<7;i++){c.save();c.rotate(i*2.4);const line=[[3,1],[13,4],[19,-4],[26,2],[32,-1],[44,5],[49,0]];penLine(c,line,'#271535',4.2);penLine(c,line,'#cd90f7',1.5);c.restore()}
  }
  return canvas;
}
const stampCache={};
function faultArt(kind,world,variant){
  const seam={nova:'#f3cc9c',solar:'#ffaf58',cryo:'#d7fcff',gravity:'#e0c2ff'}[kind];
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d');c.translate(128,128);c.lineJoin='bevel';c.lineCap='round';
  let seed=world.seed*313+variant*1867+kind.charCodeAt(0);
  function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
  function fissure(line,width){
    const left=[],right=[];
    for(let i=0;i<line.length;i++){
      const [x,y]=line[i],p=line[Math.min(i+1,line.length-1)],prev=line[Math.max(0,i-1)];
      const dx=p[0]-prev[0],dy=p[1]-prev[1],len=Math.hypot(dx,dy)||1;
      const w=width*(1-i/(line.length-1))*(.5+rand()*.7);
      left.push([x-dy/len*w,y+dx/len*w]);right.push([x+dy/len*w*.56,y-dx/len*w*.56]);
    }
    c.beginPath();c.moveTo(...left[0]);for(const p of left.slice(1))c.lineTo(...p);
    for(let j=right.length-1;j>=0;j--)c.lineTo(...right[j]);c.closePath();
    c.fillStyle='#17121fed';c.fill();
    penLine(c,left.slice(0,-1),world.color,Math.max(.65,width*.32));
    penLine(c,right.slice(0,Math.max(2,right.length-3)),seam,Math.max(.45,width*.19));
  }
  const trunks=kind==='cryo'?7:kind==='gravity'?5:6;
  for(let arm=0;arm<trunks;arm++){
    const a=(arm+rand()*.65)*Math.PI*2/trunks,reach=75+rand()*45;
    const line=[];let drift=rand()*.12;
    for(let j=0;j<8;j++){
      const r=36+(reach-36)*j/7;drift+=(rand()-.5)*.20;
      const angle=a+drift;line.push([Math.cos(angle)*r,Math.sin(angle)*r]);
    }
    fissure(line,2.2+rand()*2.8);
    for(let j=2;j<6;j+=(rand()>.5?2:3)){
      const [x,y]=line[j],theta=a+(rand()>.5?1:-1)*(.47+rand()*.56),l=9+rand()*16;
      const bend=theta+(rand()-.5)*.6;
      fissure([[x,y],[x+Math.cos(theta)*l*.48,y+Math.sin(theta)*l*.48],
        [x+Math.cos(bend)*l*.82,y+Math.sin(bend)*l*.82],[x+Math.cos(theta)*l,y+Math.sin(theta)*l]],1.4);
    }
  }
  return canvas;
}
const faultCache={};
function createPlanetSkin(world){
  const img=new Image(),atlas=document.createElement('canvas'),surface=document.createElement('canvas');
  atlas.width=atlasWidth;atlas.height=atlasHeight;
  surface.width=surface.height=globeDiameter;
  const ink=atlas.getContext('2d',{willReadFrequently:true}),out=surface.getContext('2d');
  let pixels,frame,lastTurn=null,changed=true,inkReady=false,readPending=false;
  let mantle=null;
  const wallImage=new Image();
  const marks=[],hitSites=[],damage=createPlanetDamage(world.seed,world.material);
  function recordCut(kind,x,y,turn,cut){
    const previous=hitSites.findIndex(site=>site.cut===cut);
    if(previous>=0)hitSites.splice(previous,1);
    hitSites.push({x,y,z:Math.sqrt(Math.max(0,1-x*x-y*y)),turn,cut,kind});
    if(hitSites.length>36)hitSites.shift();
    return cut;
  }
  function stamp(mark){
    const uv=surfaceUV(mark.x,mark.y,mark.turn),base=mark.size*atlasHeight/Math.PI;
    const lat=(uv.v-.5)*Math.PI;
    const width=base/Math.max(.24,Math.cos(lat));
    const decal=stampCache[mark.kind]??=damageStamp(mark.kind);
    const variant=mark.variant;
    const key=world.name+'-'+mark.kind+'-'+variant;
    const faults=faultCache[key]??=faultArt(mark.kind,world,variant);
    const u=((uv.u%1)+1)%1;
    for(const seam of [-1,0,1]){
      ink.save();ink.translate((u+seam)*atlasWidth,uv.v*atlasHeight);
      ink.scale(width,base);ink.rotate(mark.angle);ink.drawImage(decal,-1,-1,2,2);
      ink.drawImage(faults,-2.06,-2.06,4.12,4.12);ink.restore();
    }
  }
  function rebuild(){
    if(!img.complete||!img.naturalWidth)return;
    ink.drawImage(img,0,0,atlasWidth,atlasHeight);for(const mark of marks)stamp(mark);
    inkReady=true;readPending=true;changed=true;
  }
  img.onload=rebuild;img.src='assets/'+world.name.toLowerCase()+'-map.webp';
  wallImage.onload=()=>{
    const sample=document.createElement('canvas');sample.width=1024;sample.height=256;
    const brush=sample.getContext('2d',{willReadFrequently:true});
    brush.drawImage(wallImage,0,0,sample.width,sample.height);
    mantle={pixels:brush.getImageData(0,0,sample.width,sample.height).data,
      glow:['lava','iron','obsidian'].includes(world.material)?0:['ice','reef','fulgurite'].includes(world.material)?1:2};
    changed=true;
  };
  wallImage.src='assets/mantle-'+world.name.toLowerCase()+'.webp';
  const rgb=[1,3,5].map(i=>parseInt(world.color.slice(i,i+2),16));
  return {
    hitSites,
    reset(){marks.length=hitSites.length=0;damage.reset();changed=true;rebuild()},
    widen(cut,amount){damage.widen(cut,amount);changed=true},
    advance(dt,turn,onPeel){
      if(damage.advance(dt,s=>{
        const p=damage.project(s,turn);
        if(p.z>0)onPeel(p,s.radius,s.kind);
      }))changed=true;
    },
    get mantleArt(){return wallImage.naturalWidth?wallImage:null},
    get crustArt(){return img.naturalWidth?img:null},
    project:damage.project,
    get remaining(){return damage.remaining},
    biteMouth:damage.biteMouth,
    bite(turn){
      const {before,removed,remaining,cut}=damage.bite(turn);
      if(cut)recordCut('bite',cut.x,cut.y,cut.turn,cut);
      changed=true;
      return {before,removed,remaining};
    },
    incise(x,y,turn,radius,shape){
      const cut=damage.strike('cryo',x,y,turn,1,0,{radius,shape});
      changed=true;
      return recordCut('incision',x,y,turn,cut);
    },
    impact(kind,x,y,turn,power,wear){
      const cut=damage.strike(kind,x,y,turn,power,wear);
      const mark={kind,x,y,turn,size:cut.radius*1.68,angle:marks.length*2.4+.3,variant:marks.length%4};
      marks.push(mark);
      changed=true;
      if(inkReady){stamp(mark);readPending=true}
      return recordCut(kind,x,y,turn,cut);
    },
    frame(turn){
      if(readPending){pixels=ink.getImageData(0,0,atlasWidth,atlasHeight).data;readPending=false}
      if(!pixels&&!damage.active)return null;
      const stride=smallPlanetView?2:1;
      const phase=((Math.round(turn*atlasWidth/stride)*stride%atlasWidth)+atlasWidth)%atlasWidth;
      if(!changed&&lastTurn===phase)return surface;
      globeGeometry??=makeGeometry();frame??=out.createImageData(globeDiameter,globeDiameter);
      const {offset,u,light,rim,spec,alpha}=globeGeometry,rgba=frame.data;
      for(let i=0,j=0;i<alpha.length;i++,j+=4){
        if(!alpha[i])continue;
        const k=(offset[i]+((u[i]+phase)&(atlasWidth-1)))*4;
        const l=light[i],r=rim[i],s=spec[i]*14;
        rgba[j]=(pixels?pixels[k]:rgb[0])*l+r*rgb[0]+s;
        rgba[j+1]=(pixels?pixels[k+1]:rgb[1])*l+r*rgb[1]+s;
        rgba[j+2]=(pixels?pixels[k+2]:rgb[2])*l+r*rgb[2]+s;
        rgba[j+3]=alpha[i];
      }
      damage.render(rgba,globeGeometry,phase/atlasWidth,rgb,mantle);
      out.putImageData(frame,0,0);lastTurn=phase;changed=false;return surface;
    }
  };
}
