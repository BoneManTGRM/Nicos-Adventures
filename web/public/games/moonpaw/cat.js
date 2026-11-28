'use strict';

// Four separately skinned pieces share the same skeleton in WebGL and Canvas 2D.
// Extra room around the mesh lets the paw, jacket and tail travel outside the resting pose.
window.createFamiliar=function(wrapper,image,display){
  const artW=768,artH=502,padX=96,padY=88,viewW=artW+2*padX,viewH=artH+2*padY;
  const zones=new Image();zones.src='assets/jacket-rig.png';
  // Coordinates in the character artist's 768 × 502 resting pose.
  const eye=wrapper.querySelector('#castingEye'),eyeX=503,eyeY=87,lidSeam=119;
  const eyeBottom=eyeY+55;
  eye.style.left=100*eyeX/artW+'%';eye.style.top=100*eyeY/artH+'%';
  eye.style.width=100*62/artW+'%';eye.style.height=100*55/artH+'%';
  let draw=null,previous=-1,canvas=display;
  function makeMesh(name,bounds,step){
    const [x0,y0,x1,y1]=bounds,nx=Math.ceil((x1-x0)/step),ny=Math.ceil((y1-y0)/step);
    const verts=[],indices=[],uv=[];
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
      const x=x0+(x1-x0)*i/nx,y=y0+(y1-y0)*j/ny;
      verts.push({x,y,weights:boneWeights(name,x,y).filter(pair=>pair[1]>.00001)});
      uv.push(x/artW,y/artH);
      if(j&&i){
        const d=j*(nx+1)+i,c=d-1,b=d-nx-1,a=b-1;
        indices.push(a,b,d,a,d,c);
      }
    }
    return{verts,uv:new Float32Array(uv),indices:new Uint16Array(indices),xy:new Float32Array(verts.length*2)};
  }
  function skin(mesh,bones){
    const {xy,verts}=mesh;
    for(let i=0;i<verts.length;i++){
      const v=verts[i];let x=0,y=0;
      for(const [name,w] of v.weights){
        const m=bones[name];x+=w*(m[0]*v.x+m[2]*v.y+m[4]);y+=w*(m[1]*v.x+m[3]*v.y+m[5]);
      }
      xy[2*i]=x;xy[2*i+1]=y;
    }
  }
  function layerTextures(){
    const base=document.createElement('canvas');base.width=artW;base.height=artH;
    const g=base.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,artW,artH);
    const src=g.getImageData(0,0,artW,artH);g.clearRect(0,0,artW,artH);g.drawImage(zones,0,0,artW,artH);
    const mask=g.getImageData(0,0,artW,artH).data;
    // Attach the translucent fur fringe to its moving limb, including hairs that
    // extend a few pixels beyond the opaque region in the artist's mask.
    const original=mask.slice();
    for(let y=4;y<artH-4;y++)for(let x=4;x<artW-4;x++){
      const i=(y*artW+x)*4;
      if(!src.data[i+3]||src.data[i+3]>225||Math.max(original[i],original[i+1],original[i+2])>247)continue;
      let best=0,channel=-1;
      for(const delta of [-4,4,-4*artW,4*artW,-2*artW-2,2*artW+2]){
        const k=i+4*delta;
        for(let ch=0;ch<3;ch++)if(original[k+ch]>best){best=original[k+ch];channel=ch}
      }
      if(best>240){mask[i]=mask[i+1]=mask[i+2]=0;mask[i+channel]=255}
    }
    const configs=[['tail',1,[0,56,325,397] ],['leg',2,[75,330,401,502]],
      ['body',-1,[0,0,768,502]],['arm',0,[500,92,768,378]]];
    const layers=configs.map(([name,ch,bounds])=>{
      const card=document.createElement('canvas');card.width=artW;card.height=artH;
      const paint=card.getContext('2d'),bitmap=paint.createImageData(artW,artH);
      bitmap.data.set(src.data);
      for(let i=0;i<mask.length;i+=4){
        if(!src.data[i+3])continue;
        const x=(i/4)%artW,y=Math.floor(i/4/artW);
        let w=ch>=0?mask[i+ch]/255:1-Math.max(mask[i],mask[i+1],mask[i+2])/255;
        // Overlap each attachment under the moving piece to keep the joint covered.
        if(ch===-1&&w<1){
          const arms=1-Math.hypot((x-557)/63,(y-276)/50);
          const legs=1-Math.hypot((x-252)/57,(y-415)/37);
          const tail=1-Math.hypot((x-161)/57,(y-355)/42);
          w=Math.max(w,unitEase(Math.max(arms,legs,tail)*2.4));
        }
        bitmap.data[i+3]=src.data[i+3]*w;
      }
      paint.putImageData(bitmap,0,0);return{name,card,bounds};
    });
    if(eye.naturalWidth){
      const card=document.createElement('canvas');card.width=artW;card.height=artH;
      card.getContext('2d').drawImage(eye,eyeX,eyeY);
      // The entire forehead is weighted to the head joint. Keep the casting paw in front.
      layers.splice(3,0,{name:'eye',card,bounds:[eyeX,eyeY,eyeX+eye.naturalWidth,eyeBottom]});
    }
    return layers;
  }
  function configureCanvas(quality){
    canvas.width=Math.round(viewW*quality);canvas.height=Math.round(viewH*quality);
    canvas.style.width=(100*viewW/artW)+'%';canvas.style.height=(100*viewH/artH)+'%';
    canvas.style.left=(-100*padX/artW)+'%';canvas.style.top=(-100*padY/artH)+'%';
  }
  function gpuRenderer(gl,layers){
    const vs='attribute vec2 position,uv;varying vec2 tex;void main(){tex=uv;gl_Position=vec4((position.x+96.)/960.*2.-1.,1.-(position.y+88.)/678.*2.,0.,1.);}';
    const fs='precision mediump float;uniform sampler2D art;uniform vec2 visibleY;varying vec2 tex;void main(){if(tex.y<visibleY.x || tex.y>visibleY.y)discard;gl_FragColor=texture2D(art,tex);}';
    function shader(type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);return s}
    const prg=gl.createProgram();gl.attachShader(prg,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prg,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prg);
    if(!gl.getProgramParameter(prg,gl.LINK_STATUS))return null;
    gl.useProgram(prg);configureCanvas(.8);gl.viewport(0,0,canvas.width,canvas.height);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    const position=gl.getAttribLocation(prg,'position'),uv=gl.getAttribLocation(prg,'uv');
    const visibleY=gl.getUniformLocation(prg,'visibleY');
    gl.enableVertexAttribArray(position);gl.enableVertexAttribArray(uv);
    function buffer(target,data,usage){const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,data,usage);return b}
    const parts=layers.map(({name,card,bounds})=>{
      const m=makeMesh(name,bounds,name==='body'?24:17);
      m.isEye=name==='eye';
      m.vPos=buffer(gl.ARRAY_BUFFER,m.xy.byteLength,gl.DYNAMIC_DRAW);m.vUV=buffer(gl.ARRAY_BUFFER,m.uv,gl.STATIC_DRAW);
      m.ix=buffer(gl.ELEMENT_ARRAY_BUFFER,m.indices,gl.STATIC_DRAW);m.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,m.texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,card);
      return m;
    });
    return (bones,top,bottom)=>{
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      for(const m of parts){
        if(m.isEye&&top>=bottom)continue;
        gl.uniform2f(visibleY,m.isEye?top/artH:0,m.isEye?bottom/artH:1);
        skin(m,bones);gl.bindBuffer(gl.ARRAY_BUFFER,m.vPos);gl.bufferSubData(gl.ARRAY_BUFFER,0,m.xy);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,m.vUV);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
        gl.bindTexture(gl.TEXTURE_2D,m.texture);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ix);
        gl.drawElements(gl.TRIANGLES,m.indices.length,gl.UNSIGNED_SHORT,0);
      }
    };
  }
  function cpuRenderer(layers){
    // Rasterize the same weighted mesh into one small surface. A phone pays for
    // the visible character pixels, without hundreds of per-triangle canvas clips.
    configureCanvas(.43);
    const out=canvas.getContext('2d'),fw=canvas.width,fh=canvas.height;
    const frame=out.createImageData(fw,fh),rgba=frame.data;
    const sx=fw/viewW,sy=fh/viewH,tw=384,th=251;
    const parts=layers.map(l=>{
      const small=document.createElement('canvas');small.width=tw;small.height=th;
      const c=small.getContext('2d',{willReadFrequently:true});
      c.drawImage(l.card,0,0,tw,th);
      const data=c.getImageData(0,0,tw,th).data;
      return{...makeMesh(l.name,l.bounds,l.name==='body'?34:23),data,isEye:l.name==='eye'};
    });
    return (bones,top,bottom)=>{
      rgba.fill(0);
      for(const mesh of parts){
        if(mesh.isEye&&top>=bottom)continue;
        skin(mesh,bones);
        const {indices,verts,xy,data}=mesh;
        for(let j=0;j<xy.length;j+=2){xy[j]=(xy[j]+padX)*sx;xy[j+1]=(xy[j+1]+padY)*sy}
        for(let i=0;i<indices.length;i+=3){
          const ia=indices[i],ib=indices[i+1],ic=indices[i+2],a=verts[ia],b=verts[ib],c=verts[ic];
          const ax=xy[ia*2],ay=xy[ia*2+1],bx=xy[ib*2],by=xy[ib*2+1],cx=xy[ic*2],cy=xy[ic*2+1];
          const dx1=bx-ax,dy1=by-ay,dx2=cx-ax,dy2=cy-ay,area=dx1*dy2-dy1*dx2;
          if(Math.abs(area)<.05)continue;
          const x0=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5)),x1=Math.min(fw-1,Math.floor(Math.max(ax,bx,cx)-.5));
          const y0=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5)),y1=Math.min(fh-1,Math.floor(Math.max(ay,by,cy)-.5));
          const ux=dy2/area,uy=-dx2/area,vx=-dy1/area,vy=dx1/area;
          for(let y=y0;y<=y1;y++){
            let u=(x0+.5-ax)*ux+(y+.5-ay)*uy,v=(x0+.5-ax)*vx+(y+.5-ay)*vy;
            for(let x=x0;x<=x1;x++,u+=ux,v+=vx){
              if(u<-.00001||v<-.00001||u+v>1.00001)continue;
              const px=Math.min(tw-1,Math.max(0,((a.x+(b.x-a.x)*u+(c.x-a.x)*v)*.5)|0));
              const py=Math.min(th-1,Math.max(0,((a.y+(b.y-a.y)*u+(c.y-a.y)*v)*.5)|0));
              if(mesh.isEye&&(py*2+1<top||py*2+1>bottom))continue;
              const src=(py*tw+px)*4,alpha=data[src+3];if(!alpha)continue;
              const k=(y*fw+x)*4;
              if(alpha===255||!rgba[k+3]){
                rgba[k]=data[src];rgba[k+1]=data[src+1];rgba[k+2]=data[src+2];rgba[k+3]=alpha;
              }else{
                const back=rgba[k+3]*(1-alpha/255),sum=alpha+back;
                rgba[k]=(data[src]*alpha+rgba[k]*back)/sum;
                rgba[k+1]=(data[src+1]*alpha+rgba[k+1]*back)/sum;
                rgba[k+2]=(data[src+2]*alpha+rgba[k+2]*back)/sum;rgba[k+3]=sum;
              }
            }
          }
        }
      }
      out.putImageData(frame,0,0);
    };
  }
  function render(){
    const closed=1-actorPose.eye;
    const top=eyeY+(lidSeam-eyeY)*closed;
    const bottom=eyeBottom-(eyeBottom-lidSeam)*closed;
    if(draw)draw(actorBones(),top,bottom);
    else{
      eye.style.clipPath='inset('+(top-eyeY)/(eyeBottom-eyeY)*100+'% 0 '+(eyeBottom-bottom)/(eyeBottom-eyeY)*100+'% 0)';
      eye.style.opacity=actorPose.eye>0?'1':'0';
    }
  }
  function setup(){
    if(draw||!image.naturalWidth||!zones.naturalWidth||!eye.complete)return;
    const layers=layerTextures();
    const gl=canvas.getContext('webgl',{alpha:true,depth:false,antialias:true,premultipliedAlpha:true});
    if(gl)draw=gpuRenderer(gl,layers);
    function useCPU(){
      const fallback=document.createElement('canvas');fallback.id='catCanvas';fallback.setAttribute('aria-hidden','true');
      canvas.replaceWith(fallback);canvas=fallback;draw=fallback.getContext('2d')?cpuRenderer(layers):null;
    }
    if(!draw)useCPU();
    else canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();useCPU();wrapper.classList.toggle('gpu',!!draw);render();
    },{once:true});
    render();wrapper.classList.toggle('gpu',!!draw);
  }
  image.addEventListener('load',setup);zones.addEventListener('load',setup);
  eye.addEventListener('load',setup);eye.addEventListener('error',setup);setup();
  return function animate(time){
    if(time===previous)return;
    previous=time;render();
  };
};
