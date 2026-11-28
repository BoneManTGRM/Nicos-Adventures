'use strict';

// Each cut is an irregular prism through the solid globe plus a spherical scoop
// at its entrance. Both exist in planet coordinates and turn with the terrain.
const cutProfiles={
  nova:{radius:.266,aspect:1,points:11,jag:.16,wall:[197,122,82]},
  solar:{radius:.208,aspect:.93,points:13,jag:.09,wall:[255,122,51]},
  cryo:{radius:.224,aspect:.73,points:8,jag:.19,wall:[121,217,244]},
  gravity:{radius:.321,aspect:1.05,points:9,jag:.22,wall:[183,131,219]}
};
function outlineCut(cut){
  const left=new Float32Array(globeDiameter).fill(Infinity);
  const right=new Float32Array(globeDiameter).fill(-Infinity);
  const leftSlope=new Float32Array(globeDiameter),rightSlope=new Float32Array(globeDiameter);
  const shape=cut.shape.map(([x,y])=>[cut.x+x*cut.radius,cut.y+y*cut.radius]);
  for(let i=0;i<shape.length;i++){
    const a=shape[i],b=shape[(i+1)%shape.length],dy=b[1]-a[1];
    if(Math.abs(dy)<1e-6)continue;
    const slope=(b[0]-a[0])/dy;
    const first=Math.max(0,Math.ceil((Math.min(a[1],b[1])+1)*globeDiameter*.5-.5));
    const end=Math.min(globeDiameter,Math.ceil((Math.max(a[1],b[1])+1)*globeDiameter*.5-.5));
    for(let row=first;row<end;row++){
      const y=(row+.5)*2/globeDiameter-1,x=a[0]+(y-a[1])*slope;
      if(x<left[row]){left[row]=x;leftSlope[row]=slope}
      if(x>right[row]){right[row]=x;rightSlope[row]=slope}
    }
  }
  Object.assign(cut,{left,right,leftSlope,rightSlope});
}
function createPlanetDamage(seed,geology){
  const cuts=[],spalls=[],pending=[],samples=[];
  let hits=0;
  const grid=15;
  for(let iy=0;iy<grid;iy++)for(let iz=0;iz<grid;iz++)for(let ix=0;ix<grid;ix++){
    const x=2*(ix+.5)/grid-1,y=2*(iy+.5)/grid-1,z=2*(iz+.5)/grid-1;
    if(x*x+y*y+z*z<=1)samples.push({x,y,z,row:Math.floor((y+1)*globeDiameter*.5),gone:false});
  }
  let removed=0;
  function measure(cut){
    const a=cut.turn*Math.PI*2,cos=Math.cos(a),sin=Math.sin(a),cap=(cut.radius*1.28)**2;
    for(const pt of samples){
      if(pt.gone)continue;
      const across=pt.x*cos-pt.z*sin;
      const dx=pt.x-cut.px,dy=pt.y-cut.y,dz=pt.z-cut.pz;
      const localX=dx*cos-dz*sin,localZ=dx*sin+dz*cos;
      const inScoop=dx*dx+dy*dy+dz*dz<cap&&cut.planes.every(p=>
        p.x*localX+p.y*dy+p.z*localZ<=cut.radius*1.28*p.limit);
      if(inScoop||(across>=cut.left[pt.row]&&across<=cut.right[pt.row])){pt.gone=true;removed++}
    }
  }
  function widen(cut,amount){
    if(!cut||!cuts.includes(cut))return;
    cut.radius=Math.min(1.65,cut.radius+amount);outlineCut(cut);measure(cut);
  }
  // Near-surface pieces peel away after the initial shock. A sphere clipped by
  // an oblique bedding plane leaves both a ragged lip and a flat fractured floor.
  function queueSpalls(kind,x,y,z,turn,radius,power){
    const ca=Math.cos(turn*Math.PI*2),sa=Math.sin(turn*Math.PI*2);
    const h=Math.hypot(x,z)||1;
    const count=kind==='gravity'||power>=1.9?3:2;
    const base=seed*.37+(++hits)*2.39996;
    for(let j=0;j<count&&pending.length+spalls.length<24;j++){
      const angle=base+j*2.53,cs=Math.cos(angle),sn=Math.sin(angle);
      const ux=cs*z/h-sn*x*y/h,uy=sn*h,uz=-cs*x/h-sn*z*y/h;
      const arc=Math.min(1.30,radius*(1.20+.10*Math.sin(base+j)));
      const tangent=Math.sin(arc),normal=Math.cos(arc);
      const sx=x*normal+ux*tangent,sy=y*normal+uy*tangent,sz=z*normal+uz*tangent;
      const nx=sx*.91+ux*.37,ny=sy*.91+uy*.37,nz=sz*.91+uz*.37;
      const r=Math.min(.32,radius*(kind==='gravity'?.48:.35)*(1+.22*Math.cos(base*2+j)));
      pending.push({px:(sx*ca+sz*sa)*.981,y:sy*.981,pz:(sz*ca-sx*sa)*.981,
        nx:nx*ca+nz*sa,ny,nz:nz*ca-nx*sa,radius:r,floor:-r*(.26+.13*Math.cos(angle)),
        wait:.17+.16*j,kind,age:0,wall:cutProfiles[kind].wall});
    }
  }
  function advance(dt,onPeel){
    let changed=false;
    for(const item of cuts.concat(spalls)){
      if(item.age>=2.5)continue;
      const prev=Math.floor(item.age*6);item.age=Math.min(2.5,item.age+dt);
      if(prev!==Math.floor(item.age*6))changed=true;
    }
    for(let i=pending.length-1;i>=0;i--){
      const s=pending[i];s.wait-=dt;if(s.wait>0)continue;
      pending.splice(i,1);spalls.push(s);changed=true;
      for(const pt of samples){
        if(pt.gone)continue;
        const dx=pt.x-s.px,dy=pt.y-s.y,dz=pt.z-s.pz;
        if(dx*dx+dy*dy+dz*dz<s.radius*s.radius&&dx*s.nx+dy*s.ny+dz*s.nz>=s.floor){
          pt.gone=true;removed++;
        }
      }
      if(onPeel)onPeel(s);
    }
    return changed;
  }
  function strike(kind,x,y,turn,power,wear=0){
    const style=cutProfiles[kind],angle=turn*Math.PI*2,cos=Math.cos(angle),sin=Math.sin(angle);
    const z=Math.sqrt(Math.max(0,1-x*x-y*y)),px=x*cos+z*sin,pz=z*cos-x*sin;
    const size=style.radius*(1+.29*(power-1)+.48*wear);
    let nearest,dist=Infinity;
    for(const cut of cuts){
      const entry=(cut.px-px)**2+(cut.pz-pz)**2,exit=(cut.ex-px)**2+(cut.ez-pz)**2;
      const d=Math.min(entry,exit)+(cut.y-y)**2;
      if(d<dist&&d<(.16+cut.radius*.58)**2){nearest=cut;dist=d}
    }
    if(nearest){
      // A shot down an existing passage breaks material off its walls.
      nearest.wall=style.wall;nearest.kind=kind;nearest.age=0;widen(nearest,size*.48);
      queueSpalls(kind,x,y,z,turn,nearest.radius,power+1);return nearest;
    }
    const shape=[],phase=(cuts.length+1)*2.4+seed*.21;
    for(let i=0;i<style.points;i++){
      const a=i*Math.PI*2/style.points+phase;
      const radius=1+style.jag*Math.sin(phase+i*2.23)+.055*Math.cos(i*3.9+seed);
      shape.push([Math.cos(a)*radius,Math.sin(a)*radius*style.aspect]);
    }
    // Crystal cleaves in broad faces. Basalt crumbles into narrower shelves.
    const sides=({crystal:6,ice:8,jade:7,sandstone:13,fulgurite:8,iron:10,reef:12,obsidian:7})[geology]??11,planes=[];
    for(let i=0;i<sides;i++){
      const theta=i*Math.PI*2/sides+phase*.74+.14*Math.sin(i*3.17+phase);
      const lean=-.40+.31*Math.sin(phase+i*2.23),len=Math.sqrt(1+lean*lean);
      planes.push({x:Math.cos(theta)/len,y:Math.sin(theta)/len,z:lean/len,
        limit:.72+.13*Math.cos(phase+i*3.21)});
    }
    const cut={planes,x,y,px,pz,ex:x*cos-z*sin,ez:-z*cos-x*sin,turn,radius:size,shape,wall:style.wall,kind,age:0};
    cuts.push(cut);outlineCut(cut);measure(cut);
    queueSpalls(kind,x,y,z,turn,size,power);return cut;
  }
  function project(cut,turn){
    const a=turn*Math.PI*2,cos=Math.cos(a),sin=Math.sin(a);
    return{x:cut.px*cos-cut.pz*sin,y:cut.y,z:cut.px*sin+cut.pz*cos};
  }
  // At a fixed screen row a prism is a strip between two planes. Compute the
  // exact removed depth intervals along each viewing ray, including overlapping cuts.
  function render(rgba,geometry,turn,tint,mantle){
    if(!cuts.length)return;
    const n=globeDiameter,step=2/n,cos=Math.cos(turn*Math.PI*2),sin=Math.sin(turn*Math.PI*2);
    const view=cuts.map(c=>{
      const a=(turn-c.turn)*Math.PI*2,p=project(c,turn);
      const co=Math.cos(a),si=Math.sin(a),scoop=c.radius*1.28;
      const planes=c.planes.map(q=>{
        const nx=q.x*co-q.z*si,nz=q.x*si+q.z*co;
        return {nx,ny:q.y,nz,limit:scoop*q.limit,inv:Math.abs(nz)<1e-7?0:1/nz};
      });
      return{c,p,co,si,scoop,planes,peel:false};
    });
    for(const c of spalls){
      view.push({c,p:project(c,turn),scoop:c.radius,peel:true,
        nx:c.nx*cos-c.nz*sin,ny:c.ny,nz:c.nx*sin+c.nz*cos});
    }
    for(const v of view){
      v.fresh=Math.max(0,1-v.c.age/2.5);
      v.thermal=v.c.kind==='solar'?1:v.c.kind==='cryo'?2:v.c.kind==='gravity'?3:0;
    }
    const start=new Float32Array(view.length*2),end=new Float32Array(start.length);
    const surface=new Array(start.length),face=new Array(start.length),spherical=new Uint8Array(start.length);
    const spans=new Uint8Array(n);
    for(let row=0;row<n;row++){
      const y=(row+.5)*step-1,rowCuts=[];
      spans.fill(0);
      for(const v of view){
        const dy=y-v.c.y,rr=v.scoop*v.scoop-dy*dy;
        const prism=!v.peel&&v.c.left[row]<=v.c.right[row];
        if(!prism&&rr<=0)continue;
        v.rr=rr;rowCuts.push(v);
        if(v.planes)for(const plane of v.planes)plane.rowLimit=plane.limit-dy*plane.ny;
        // Bounds of the projected prism for z in [-1,1], plus the projected scoop.
        const span=Math.sqrt(Math.max(0,rr));
        let min=v.p.x-span,max=v.p.x+span;
        if(prism){
          if(Math.abs(v.co)<.0001){min=-1;max=1}
          else{
            const a=v.c.left[row]/v.co,b=v.c.right[row]/v.co,tilt=Math.abs(v.si/v.co);
            min=Math.min(min,a,b)-tilt;max=Math.max(max,a,b)+tilt;
          }
        }
        v.min=min;v.max=max;
        spans.fill(1,Math.max(0,Math.min(n,Math.floor((min+1)/step))),Math.max(0,Math.min(n,Math.ceil((max+1)/step))));

      }
      if(!rowCuts.length)continue;
      pixel:for(let col=0;col<n;col++){
        const i=row*n+col;
        if(!spans[col]||!geometry.alpha[i])continue;
        const x=(col+.5)*step-1,front=geometry.z[i];let count=0;
        for(const v of rowCuts){
          if(x<v.min||x>v.max)continue;
          if(!v.peel&&v.c.left[row]<=v.c.right[row]){
            const lo=v.c.left[row],hi=v.c.right[row],q=x*v.co;
            let a,b;
            if(Math.abs(v.si)<.0001){
              if(q>=lo&&q<=hi){a=-2;b=2}
            }else{
              const z1=(lo-q)/v.si,z2=(hi-q)/v.si;
              a=Math.min(z1,z2);b=Math.max(z1,z2);
            }
            if(a<=-front&&b>=front){rgba[i*4+3]=0;continue pixel}
            if(a<=front&&b>=-front){
              start[count]=a;end[count]=b;surface[count]=v;spherical[count++]=0;
            }
          }
          const dx=x-v.p.x,d=v.rr-dx*dx;
          if(d>0){
            const span=Math.sqrt(d);let a=v.p.z-span,b=v.p.z+span,type=1;
            if(v.peel){
              const plane=v.c.floor-dx*v.nx-(y-v.c.y)*v.ny;
              if(Math.abs(v.nz)<.00001){if(plane>0)continue}
              else{
                const limit=v.p.z+plane/v.nz;
                if(v.nz>0&&a<limit){a=limit;type=2}
                else if(v.nz<0)b=Math.min(b,limit);
              }
              if(a>=b)continue;
            }else{
              // Clip the round excavation against the planet's fracture planes.
              // The entry can end against solid, stepped rock on any of them.
              for(const pl of v.planes){
                const q=pl.rowLimit-dx*pl.nx;
                if(!pl.inv){if(q<0){b=a;break}continue}
                const limit=q*pl.inv+v.p.z;
                if(pl.nz<0&&a<limit){a=limit;type=3;face[count]=pl}
                else if(pl.nz>0)b=Math.min(b,limit);
                if(a>=b)break;
              }
              if(a>=b)continue;
            }
            if(a<=front&&b>=-front){
              start[count]=a;end[count]=b;surface[count]=v;spherical[count++]=type;
            }
          }
        }
        let depth=front,last=-1;
        for(let pass=0;pass<count;pass++){
          let next=depth,which=-1;
          for(let j=0;j<count;j++){
            if(end[j]>=depth-.00001&&start[j]<next-.00001){next=start[j];which=j}
          }
          if(which<0)break;
          depth=next;last=which;if(depth<=-front)break;
        }
        if(last<0)continue;
        const k=i*4;
        if(depth<=-front){rgba[k+3]=0;continue}
        const v=surface[last],wall=v.c.wall;
        let nx,ny,nz;
        if(spherical[last]===3){const pl=face[last];nx=-pl.nx;ny=-pl.ny;nz=-pl.nz}
        else if(spherical[last]===2){nx=v.nx;ny=v.ny;nz=v.nz}
        else if(spherical[last]){
          nx=(v.p.x-x)/v.scoop;ny=(v.c.y-y)/v.scoop;nz=(v.p.z-depth)/v.scoop;
        }else{
          const sign=v.si>0?1:-1,slope=sign>0?v.c.leftSlope[row]:v.c.rightSlope[row];
          const norm=sign/Math.sqrt(1+slope*slope);
          nx=norm*v.co;ny=-norm*slope;nz=norm*v.si;
        }
        const crust=Math.max(0,1-Math.sqrt(x*x+y*y+depth*depth));
        const wx=x*cos+depth*sin,wz=depth*cos-x*sin;
        const recession=front-depth;
        const sun=Math.max(0,-.53*nx-.61*ny+.59*nz);
        const occlusion=Math.max(.46,1-recession*.30);
        if(mantle){
          // Bedding follows the depth beneath the intact round surface. Shearing
          // the sampling coordinates breaks up perfect concentric rings.
          const sweep=wx*.45+wz*.31+y*.21;
          const warp=y*(.34*y+.11*wx)+wz*(.11*wz-.06*wx);
          const tx=Math.floor((sweep+warp*.27+.5)*1024)&1023;
          const band=Math.min(.995,Math.max(.003,.08+crust*1.04+warp*.20+y*.085));
          const ty=Math.floor(band*255);
          const idx=(ty*1024+tx)*4,edge=(ty*1024+((tx+2)&1023))*4;
          const data=mantle.pixels,mr=data[idx],mg=data[idx+1],mb=data[idx+2];
          const relief=(mg-data[edge+1])*.0017;
          const shade=(.65+.50*sun+relief)*occlusion;
          const lip=Math.max(0,1-recession/.027);
          const glow=mantle.glow===0?Math.max(0,(mr-mg)*.0027):mantle.glow===1?.12:.09;
          const flash=(.11+sun*.08)*lip;
          const top=Math.max(0,1-crust*5);
          const brightness=Math.max(mr,mg,mb)/255;
          // Magic lingers in recesses and along chipped ridges as the wall cools.
          const mineralEdge=Math.min(1,Math.abs(mg-data[edge+1])*.021+.12);
          const coat=top*(.21+.79*v.fresh)*(.32+mineralEdge*.68);
          const heat=v.thermal===1?coat*(.40+brightness*.60):0;
          const frost=v.thermal===2?coat*(.26+.74*brightness):0;
          const stress=v.thermal===3?coat*mineralEdge:0;
          rgba[k]=mr*(shade+glow)+tint[0]*flash+heat*185+frost*78+stress*46;
          rgba[k+1]=mg*(shade+glow)+tint[1]*flash+heat*62+frost*116+stress*19;
          rgba[k+2]=mb*(shade+glow)+tint[2]*flash+heat*8+frost*149+stress*74;
        }else{
          const layer=(crust*9+wx*.64+wz*.35+y*.22+2)%1;
          const shade=(.54+.56*sun)*occlusion*(layer<.14?1.20:.91);
          for(let ch=0;ch<3;ch++)rgba[k+ch]=(wall[ch]*.54+tint[ch]*.46)*shade;
        }
      }
    }
  }
  return{strike,widen,advance,project,render,
    reset(){cuts.length=spalls.length=pending.length=0;removed=hits=0;for(const pt of samples)pt.gone=false},
    get remaining(){return 1-removed/samples.length},
    get active(){return cuts.length>0}};
}
