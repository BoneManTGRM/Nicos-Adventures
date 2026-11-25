'use strict';

// Build the fall from the very frame the player saw, including its gait and coat.
const FallVolume=(()=>{
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const lastFrame=48;
  function easeBetween(t,start,end){
    const ratio=clamp((t-start)/(end-start),0,1);
    return ratio*ratio*(3-2*ratio);
  }
  const broad=new Set(['elephant','forestel','hippo','rhino','buffalo','muskox','yak','boar','warthog']);
  const slender=new Set(['elk','deer','giraffe','sambar','kudu','impala','eland','vicuna','wildebeest','zebra']);
  const antlered=new Set(['elk','deer','sambar','kudu','eland']);
  const longTails=new Set(['lion','leopard','snowleopard','fox','arcticfox','andeanfox']);
  const models=new Map();
  const isHeavy=species=>broad.has(species)||!!HuntRules.wildlife[species]?.bearFamily;

  // Fit overlapping round sections inside the alpha silhouette. The deepest
  // sections lie inside the flank and shoulder; a horn or tail stays narrow.
  function depthMap(frame,thickness){
    const {w,h,px}=frame, distance=new Float32Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;
      if((px[i]>>>24)<30)continue;
      distance[i]=Math.min((x?distance[i-1]:0)+1,(y?distance[i-w]:0)+1,
        (x&&y?distance[i-w-1]:0)+1.414,(x<w-1&&y?distance[i-w+1]:0)+1.414);
    }
    for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){
      const i=y*w+x;
      distance[i]=Math.min(distance[i],(x<w-1?distance[i+1]:0)+1,(y<h-1?distance[i+w]:0)+1,
        (x&&y<h-1?distance[i+w-1]:0)+1.414,(x<w-1&&y<h-1?distance[i+w+1]:0)+1.414);
    }
    // The upper envelope of sphere depths is separable in x and y.
    const row=new Float32Array(w*h),depth=new Float32Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x,r=Math.max(0,distance[i]-.33),r2=r*r;
      for(let dx=-Math.min(x,Math.floor(r));dx<=Math.min(w-1-x,Math.floor(r));dx++)
        row[i+dx]=Math.max(row[i+dx],r2-dx*dx);
    }
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x,r2=row[i],r=Math.floor(Math.sqrt(r2));
      for(let dy=-Math.min(y,r);dy<=Math.min(h-1-y,r);dy++)
        depth[i+dy*w]=Math.max(depth[i+dy*w],r2-dy*dy);
    }
    for(let i=0;i<depth.length;i++)depth[i]=distance[i]?Math.max(.5,Math.sqrt(depth[i])*thickness):0;
    return depth;
  }

  // Find the feet in the captured stride, so the near and far limbs get
  // different positions even when the player catches a different gait frame.
  function legRig(depth,w,h,hinge,legStart,legEnd){
    let feet=[],seedRow=0,bestScore=-Infinity;
    for(let y=Math.floor(h*.77);y<h*.94;y+=2){
      const runs=[];
      for(let x=0;x<w;){
        if(!depth[y*w+x]){x++;continue;}
        const start=x;while(x<w&&depth[y*w+x])x++;
        const center=Math.floor((start+x-1)*.5);
        if(center>w*legStart&&center<w*legEnd&&x-start>1)runs.push(center);
      }
      const score=4-Math.abs(4-runs.length)-Math.abs(y/h-.85);
      if(score>bestScore){bestScore=score;feet=runs;seedRow=y;}
    }
    // Follow each visible leg up to its root through the silhouette. A narrow
    // leg keeps the same joint even when a running hoof is far from its hip.
    const labels=new Uint8Array(w*h),queue=new Int32Array(w*h);
    let read=0,write=0;
    feet.forEach((x,j)=>{
      const i=seedRow*w+x;labels[i]=j+1;queue[write++]=i;
    });
    const top=Math.floor(hinge)*w;
    while(read<write){
      const i=queue[read++],x=i%w;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const next=i+dy*w+dx;
        if(next<top||next>=labels.length||x+dx<0||x+dx>=w||labels[next]||!depth[next])continue;
        labels[next]=labels[i];queue[write++]=next;
      }
    }
    const roots=feet.map((foot,j)=>{
      let total=0,count=0;
      for(let y=Math.floor(hinge);y<Math.min(h,hinge+h*.11);y++)for(let x=0;x<w;x++){
        if(labels[y*w+x]===j+1){total+=x;count++;}
      }
      return {pivot:count?total/count:foot,side:j%2===0?1:-1};
    });
    return {labels,roots};
  }

  function model(species,frame){
    if(models.has(frame))return models.get(frame);
    const {w,h,px}=frame,heavy=isHeavy(species);
    const longLeg=slender.has(species),bird=species==='pheasant';
    const depth=depthMap(frame,heavy?1.02:bird?.65:.84);
    const elephant=species==='elephant'||species==='forestel';
    const hinge=h*(longLeg?.64:bird?.80:.57),spine=h*(longLeg?.52:.42);
    const legStart=longTails.has(species) ? .18 : .045;
    const legEnd=elephant ? .74 : .93;
    const rig=legRig(depth,w,h,hinge,legStart,legEnd);
    let raisedWing=false;
    if(bird){
      for(let y=0;y<h*.38&&!raisedWing;y++)for(let x=Math.floor(w*.32);x<w*.52;x++){
        if(depth[y*w+x]){raisedWing=true;break;}
      }
    }
    const coordinates=[],colors=[],normals=[],columns=[];
    let lowest=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x,d=depth[i];if(!d)continue;
      lowest=y+1;
      const left=x?depth[i-1]:0,right=x<w-1?depth[i+1]:0;
      const top=y?depth[i-w]:0,bottom=y<h-1?depth[i+w]:0;
      const nx=(left-right)*.5,ny=(top-bottom)*.5,inv=1/Math.hypot(nx,ny,1);
      // The shell includes steep side walls so that a turning ear or hoof has an edge from any view.
      const end=Math.max(0,Math.min(left,right,top,bottom,d)-.6);
      const slices=Math.ceil(d-end);
      const u=x/w;
      const root=rig.roots[rig.labels[i]-1];
      const leg=root ? Math.max(0,y-hinge)*clamp((legEnd+.02-u)*12,0,1)*clamp((u-legStart+.02)*12,0,1) : 0;
      let neck=clamp((u-(longLeg?.54:.57))/(longLeg?.24:.27),0,1);
      if(species==='giraffe')neck=Math.max(neck,clamp((.63-y/h)/.40,0,1));
      if(antlered.has(species))neck=Math.max(neck,clamp((.42-y/h)/.20,0,1)*clamp((u-.22)/.20,0,1));
      const column=columns.length/7;
      columns.push(x+.5-w*.5,y+.5-spine,leg,neck,root?.side||0,clamp(((root?.pivot??x)/w-.43)*9,0,1),x-(root?.pivot??x));
      for(let n=0;n<=slices;n++){
        const z=slices?d-(d-end)*n/slices:d;
        for(let side=1;side>=-1;side-=2){
          if(side===-1&&z<.4)continue;
          // The side view has a single row of pixels along the spine. Borrow
          // nearby coat texels for the newly exposed surface as it turns.
          const grazing=1-inv;
          const inset=grazing*(h*.048+Math.abs(z)*.30);
          const sampleX=clamp(Math.round(x-nx*inv*inset+z*side*.18*grazing),0,w-1);
          const sampleY=clamp(Math.round(y-ny*inv*inset),0,h-1);
          const sample=px[sampleY*w+sampleX],original=px[i];
          const blend=(sample>>>24)>127?grazing*.92:0;
          const ink=original&0xff000000;
          const r=(original&255)*(1-blend)+(sample&255)*blend;
          const g=((original>>>8)&255)*(1-blend)+((sample>>>8)&255)*blend;
          const b=((original>>>16)&255)*(1-blend)+((sample>>>16)&255)*blend;
          coordinates.push(column,z*side);colors.push(ink|(b<<16)|(g<<8)|r);
          normals.push(nx*inv,ny*inv,side*inv*(.5+.5*z/d));
        }
      }
    }
    const mesh={w,h,spine,soleGap:h-lowest,heavy,longLeg,bird,raisedWing,tallNeck:species==='giraffe',coords:Float32Array.from(coordinates),
      columns:Float32Array.from(columns),colors:Uint32Array.from(colors),normals:Float32Array.from(normals)};
    if(models.size>=5)models.delete(models.keys().next().value);
    models.set(frame,mesh);return mesh;
  }

  function create(species,frame){
    const m=model(species,frame),canvas=document.createElement('canvas'),pad=Math.ceil(m.h*.27);
    canvas.width=m.w+2*pad;canvas.height=Math.ceil(m.h*1.6);
    const g=canvas.getContext('2d'),image=g.createImageData(canvas.width,canvas.height);
    return {m,canvas,g,image,px:new Uint32Array(image.data.buffer),buffer:new Float32Array(canvas.width*canvas.height),
      joints:new Float32Array(m.columns.length/7*5),index:-1,foot:0};
  }

  function raster(r,index,dir){
    const {m,canvas,buffer,px,joints}=r,{h,w,coords,columns,normals,colors}=m;
    const t=index/lastFrame;
    const frontFold=easeBetween(t,0,.61),rearFold=easeBetween(t,.17,.80);
    const turn=easeBetween(t,.15,.86),headSettle=easeBetween(t,.30,1);
    const roll=(m.bird ? .81 : .70)*turn;
    const yaw=.17*turn;
    // The shoulder takes the weight first; the hips follow it down. The head
    // finishes settling after the torso has already found the ground.
    const pitch=(m.heavy ? .085 : .11)*turn+.15*(frontFold-rearFold);
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const neckAngle=(m.tallNeck ? 1.26 : m.longLeg ? .42 : .26)*headSettle;
    const cn=Math.cos(neckAngle)-1,sn=Math.sin(neckAngle);
    const finalKnee=m.bird ? .84 : m.longLeg ? 1.29 : 1.17;
    const headCounter=-.46*headSettle,headCos=Math.cos(headCounter)-1,headSin=Math.sin(headCounter);
    const wingAngle=(m.raisedWing ? -.83 : .38)*headSettle,wingCos=Math.cos(wingAngle)-1,wingSin=Math.sin(wingAngle);
    for(let c=0,j=0;c<columns.length;c+=7,j+=5){
      const x=columns[c],y=columns[c+1],leg=columns[c+2],neck=columns[c+3],near=columns[c+4],fore=columns[c+5];
      // Rotate the thickness of the foot as well as its length about the joint.
      const knee=finalKnee*(rearFold+(frontFold-rearFold)*fore);
      const bend=knee*(fore*(.28+.70*near)+(1-fore)*(.72-.22*near));
      const sin=Math.sin(bend),cos=Math.cos(bend),lever=x-w*.075;
      const dx=columns[c+6]*clamp(leg/(h*.13),0,1);
      joints[j]=x+leg*sin+dx*(cos-1)+neck*(lever*cn-y*sn);
      joints[j+1]=y+leg*(cos-1)-dx*sin+neck*(lever*sn+y*cn);
      if(m.tallNeck){
        // Keep the muzzle in profile as the long neck turns about its base.
        const headWeight=clamp((.23-(y+m.spine)/h)/.09,0,1);
        const hx=x-w*.25,hy=y+m.spine-h*.14;
        const ax=headCos*hx-headSin*hy,ay=headSin*hx+headCos*hy;
        joints[j]+=headWeight*(ax*(cn+1)-ay*sn);
        joints[j+1]+=headWeight*(ay*(cn+1)+ax*sn);
      }else if(m.bird){
        const u=x/w+.5,v=(y+m.spine)/h;
        const feathers=clamp((.66-u)*12,0,1)*clamp((u-.26)*15,0,1)*
          clamp((m.raisedWing ? .54-v : v-.54)*8,0,1);
        const wx=x-w*.12,wy=y+m.spine-h*.56;
        joints[j]+=feathers*(wingCos*wx-wingSin*wy);
        joints[j+1]+=feathers*(wingSin*wx+wingCos*wy);
      }
      const limb=clamp(leg/(h*.22),0,1);
      joints[j+2]=near*h*(m.longLeg ? .18 : .22)*limb*turn;
      // The cheek rests on the ground while the torso rolls further; the legs
      // pivot at the belly instead of disappearing inside a rotating flank.
      const localRoll=roll*(1-.78*neck)*(1-.35*limb);
      joints[j+3]=Math.cos(localRoll);joints[j+4]=Math.sin(localRoll);
    }
    const width=canvas.width,height=canvas.height;
    buffer.fill(-Infinity);px.fill(0);
    let floor=0;
    const ground=h-m.spine+(h*(m.longLeg?.11:m.heavy?.205:.17)-(h-m.spine))*turn;
    // A small yaw reveals the forward shoulder. Depth testing lets it pass in
    // front of the far limbs as the body rolls; the coat is carried by the shell.
    for(let i=0;i<colors.length;i++){
      const j=coords[2*i]*5,x=joints[j],y=joints[j+1],z=coords[2*i+1]+joints[j+2];
      const localCos=joints[j+3],localSin=joints[j+4];
      const ry=y*localCos+z*localSin,rz=z*localCos-y*localSin;
      const rx=x*cy-rz*sy,cz=x*sy+rz*cy;
      const perspective=1/(1-turn*cz/(h*7.5));
      const bodyY=ry*cp+rx*sp;
      // Once a paw reaches the ground, let the remaining momentum carry it
      // along the ground plane. Near legs meet that plane closer to the viewer.
      const contact=Math.max(0,bodyY-ground-cz*.27);
      const sx=width*.5+(rx*cp-ry*sp+contact*.23)*perspective;
      const syScreen=height*.53+(bodyY-contact*.69)*perspective;
      const xx=Math.floor(sx),yy=Math.floor(syScreen);
      if(xx<0||xx>=width-1||yy<0||yy>=height-1)continue;
      const p=yy*width+xx;
      const nx=normals[i*3],ny=normals[i*3+1],nz=normals[i*3+2];
      const turnedY=ny*localCos+nz*localSin,turnedZ=nz*localCos-ny*localSin;
      const changedLight=(ny-turnedY)*.30+(turnedZ-nz)*.17-dir*(nx*(cy-1)-turnedZ*sy)*.14;
      const light=clamp(1+changedLight-.035*turn,.64,1.23),col=colors[i];
      const red=Math.min(255,((col&255)*light+.5)|0),green=Math.min(255,(((col>>>8)&255)*light+.5)|0);
      const blue=Math.min(255,(((col>>>16)&255)*light+.5)|0),ink=(col&0xff000000)|(blue<<16)|(green<<8)|red;
      const x2=sx-xx>.51?1:0,y2=syScreen-yy>.51?1:0;
      for(let dy=0;dy<=y2;dy++)for(let dx=0;dx<=x2;dx++){
        const at=p+dy*width+dx;if(cz<=buffer[at])continue;
        buffer[at]=cz;px[at]=ink;
      }
      floor=Math.max(floor,yy+y2+1);
    }
    r.foot=floor+m.soleGap*(1-turn);r.g.putImageData(r.image,0,0);r.index=index;
  }
  function draw(g,r,index,size,dir){
    if(r.index!==index)raster(r,index,dir);
    g.save();g.scale(dir*size/r.m.h,size/r.m.h);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';
    g.drawImage(r.canvas,-r.canvas.width/2,-r.foot);g.restore();
  }
  return {create,draw,isHeavy,lastFrame};
})();
