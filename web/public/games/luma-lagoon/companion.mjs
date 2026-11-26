// A single textured quad bends the tail and gills independently. The canvas
// fallback keeps the same poses and movement when WebGL is unavailable.
const vertex = `
attribute vec2 point;
varying vec2 uv;
void main() {
  uv = vec2((point.x + 1.) * .5, (1. - point.y) * .5);
  gl_Position = vec4(point, 0., 1.);
}`;
const fragment = `
precision mediump float;
varying vec2 uv;
uniform sampler2D sheet;
uniform vec4 pose; // previous frame, next frame, blend, blink
uniform vec2 clock; // time in seconds, motion strength
vec2 bend(vec2 p, float frame) {
  float t = clock.x;
  float tail = (1. - smoothstep(.08, .50, p.x)) * smoothstep(.43, .72, p.y);
  float gills = smoothstep(.14,.62,abs(p.x-.62)*2.) * (1.-smoothstep(.38,.62,p.y));
  p.y += clock.y * (sin(t*3.8 + p.x*8.) * tail * (frame==3. ? .055 : .021)
         + sin(t*2.8+p.x*7.) * gills*.012);
  p.x += clock.y * sin(t*2.2+p.y*5.) * gills*.008;
  if (frame==0.) {
    vec2 eye = p.x < .70 ? vec2(.57,.425) : vec2(.805,.375);
    vec2 d = p-eye;
    float lid = (1.-smoothstep(.035,.093,abs(d.x))) * (1.-smoothstep(.058,.16,abs(d.y)));
    p.y += sign(d.y) * min(abs(d.y)*15.,.115) * lid * pose.w;
  }
  return p;
}
vec4 samplePose(float frame) {
  vec2 p = bend(uv,frame);
  if(min(p.x,p.y)<0. || max(p.x,p.y)>1.) return vec4(0.);
  return texture2D(sheet,vec2((frame+clamp(p.x,.001,.999))/6.,p.y));
}
void main() { gl_FragColor = mix(samplePose(pose.x),samplePose(pose.y),pose.z); }`;

function illustratedRenderer(canvas) {
  let gl;
  try { gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false}); } catch { return null; }
  if (!gl) return null;
  const program=gl.createProgram();
  for (const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) return null;
    gl.attachShader(program,shader);
  }
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'point');
  gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,texture);
  for (const param of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,param,gl.LINEAR);
  for (const param of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,param,gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  const poses=gl.getUniformLocation(program,'pose'), time=gl.getUniformLocation(program,'clock');
  let last;
  const maxWidth=gl.getParameter(gl.MAX_TEXTURE_SIZE);
  return (image,from,to,blend,blink,seconds,strength)=>{
    if(gl.isContextLost() || image.width>maxWidth) return false;
    if(image!==last) {
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      last=image;
    }
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform4f(poses,from,to,blend,blink);gl.uniform2f(time,seconds,strength);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    return true;
  };
}
const eggTones={
  coral:['#fff8dd','#ffcfb5','#ee8ba2','#824c8b'],
  mint:['#f7ffdf','#bdf8d5','#69cebf','#407d99'],
  violet:['#fff0ff','#e3c6ff','#ab82dd','#685494']
};
const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
const smooth=t=>t*t*(3-2*t);
function drawEgg(ctx,w,h,color,sheet,seconds) {
  const palette=eggTones[color], cx=w*.5,cy=h*.54,rx=h*.277,ry=h*.385;
  ctx.save();
  ctx.translate(cx,cy);
  ctx.beginPath();ctx.moveTo(0,-ry);
  ctx.bezierCurveTo(rx*.72,-ry,rx*1.12,-ry*.02,rx*.98,ry*.37);
  ctx.bezierCurveTo(rx*.79,ry*1.19,-rx*.8,ry*1.18,-rx*.98,ry*.37);
  ctx.bezierCurveTo(-rx*1.12,-ry*.02,-rx*.72,-ry,0,-ry);ctx.closePath();
  const shell=ctx.createRadialGradient(-rx*.32,-ry*.42,1,0,ry*.16,ry*1.2);
  [0,.40,.73,1].forEach((s,i)=>shell.addColorStop(s,palette[i]));
  ctx.fillStyle=shell;ctx.fill();ctx.save();ctx.clip();
  if(sheet?.naturalWidth) {
    const cell=sheet.naturalWidth/6;
    ctx.globalAlpha=.80+.05*Math.sin(seconds*1.2);
    ctx.drawImage(sheet,2*cell,0,cell,sheet.height,-rx*.97,-ry*.35,rx*1.95,ry*1.28);
    ctx.globalAlpha=1;
  }
  for(let i=0;i<20;i++){
    const x=Math.sin(i*12.9)*rx*.96,y=Math.cos(i*4.1)*ry*.94;
    const radius=(i%3+1)*w*.004;
    ctx.fillStyle=i%3?'#fffbecb0':palette[3]+'88';ctx.beginPath();ctx.arc(x,y,radius,0,2*Math.PI);ctx.fill();
  }
  ctx.strokeStyle='#fffaf2c4';ctx.lineWidth=rx*.07;ctx.lineCap='round';ctx.beginPath();
  ctx.moveTo(-rx*.69,-ry*.30);ctx.quadraticCurveTo(-rx*.62,-ry*.64,-rx*.33,-ry*.75);ctx.stroke();ctx.restore();
  ctx.strokeStyle=palette[0];ctx.lineWidth=w*.004;ctx.stroke();ctx.restore();
}
const validImage=image=>image?.complete && image.naturalWidth;
export function animateCompanion({state,stage,petTap,callPet}) {
  const byId=id=>document.getElementById(id);
  const scene=byId('habitat'), position=byId('petPosition'), rig=byId('petFloat'), canvas=byId('creature');
  const ink=canvas.getContext('2d'), gpuCanvas=byId('petArt'), gpu=illustratedRenderer(gpuCanvas);
  const hats=new Image(), classic=new Image(), sheets=new Map();
  hats.src='./accessories.png'; classic.src='./pets.png';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frameHandle=0,prev=0,t=0,x=.5,y=.71,goalX=.5,goalY=.71,wait=4,facing=1,turn=1;
  let hatchAt=-10,trailAt=0,expression='idle',held=0,from=0,to=0,blend=1,started=0;
  let width=1,height=1,petWidth=1,petHeight=1,seen=true,first=true,blinkAt=3.4;
  const layout=()=>{
    width=scene.clientWidth||width;height=scene.clientHeight||height;
    petWidth=position.offsetWidth||petWidth;petHeight=position.offsetHeight||petHeight;
  };
  const observer=new ResizeObserver(layout);observer.observe(scene);observer.observe(position);
  const watcher=new IntersectionObserver(entries=>{seen=entries[0].isIntersecting;wake();});watcher.observe(scene);
  function sheetFor(color) {
    if(!sheets.has(color)){
      const im=new Image(); im.src='./'+color+'.webp';sheets.set(color,im);
    }
    return sheets.get(color);
  }
  function aim(px,py){
    goalX=limit(px,.12,.88);goalY=limit(py,.50,.79);
  }
  function effect(kind,count){
    if(motion.matches)count=1;
    const glyph={love:'♥',feed:'✧',wash:'',nap:'z',wake:'✦',play:'✧',hatch:'✦',swim:''}[kind];
    for(let i=0;i<count;i++){
      const node=document.createElement('i');node.className='careParticle '+kind;node.setAttribute('aria-hidden','true');
      node.textContent=glyph||'';
      node.style.left=(x*100+(i%3-1)*3)+'%';node.style.top=(y*100-9-i%2*3)+'%';
      node.style.setProperty('--dx',(Math.cos(i*2.39)*(.3+i*.13)*52)+'px');node.style.setProperty('--delay',i*.055+'s');
      scene.append(node);setTimeout(()=>node.remove(),1650);
    }
  }
  let routine=null;
  const pearl=document.createElement('i');pearl.className='fetchPearl';pearl.hidden=true;pearl.setAttribute('aria-hidden','true');scene.append(pearl);
  function stopTrick(){
    routine=null;pearl.hidden=true;delete scene.dataset.routine;
    scene.querySelectorAll('.toyBubble').forEach(b=>b.remove());
  }
  function trick(kind){
    stopTrick();held=0;
    routine={kind,start:t,origin:x,depth:y,side:x>.5?.24:.76,next:0};scene.dataset.routine=kind;
    wake();
  }
  function bubble(){
    const b=document.createElement('button');b.type='button';b.className='toyBubble';b.setAttribute('aria-label',document.documentElement.lang.startsWith('es')?'Reventar burbuja':'Pop bubble');
    b.style.left=limit(x+(Math.random()-.5)*.39,.10,.90)*100+'%';b.style.top=limit(y-.13,.35,.70)*100+'%';
    b.onclick=e=>{e.stopPropagation();b.disabled=true;b.classList.add('popped');setTimeout(()=>b.remove(),220);};
    scene.append(b);setTimeout(()=>b.remove(),3300);
  }
  function act(kind){
    stopTrick();
    expression=kind;held=t+(kind==='feed'?2.3:kind==='wash'?2:1.7);wait=4;
    goalX=x;goalY=y;
    if(kind==='hatch')hatchAt=t;
    else effect(kind,kind==='wash'?12:kind==='nap'?3:7);
    if(kind==='feed'){
      const berry=document.createElement('span');berry.className='berryTreat';berry.textContent='🍓';berry.setAttribute('aria-hidden','true');
      berry.style.left=limit(x*width,petWidth*.46+3,width-petWidth*.46-3)+facing*petWidth*.14+'px';
      berry.style.top=y*height-petHeight*.24+'px';scene.append(berry);setTimeout(()=>berry.remove(),700);
    }
    wake();
  }
  function call(px,py){
    const s=state();if(!s.pet || s.sleeping || s.playing) return;
    stopTrick();aim(px,py);held=0;wait=6;callPet();
    const ring=document.createElement('span');ring.className='callRing';ring.setAttribute('aria-hidden','true');
    ring.style.left=px*100+'%';ring.style.top=py*100+'%';scene.append(ring);setTimeout(()=>ring.remove(),950);
    wake();
  }
  scene.addEventListener('click',e=>{
    if(e.target.closest('button'))return;
    const rect=scene.getBoundingClientRect();call((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);
  });
  const touch=byId('petTouch');
  let stroke=null, rubbed=false;
  touch.onclick=event=>{if(!state().sleeping && (!rubbed || event.detail===0))petTap();rubbed=false;};
  touch.addEventListener('pointerdown',e=>{rubbed=false;stroke=[e.clientX,e.clientY];touch.setPointerCapture?.(e.pointerId);});
  touch.addEventListener('pointermove',e=>{
    if(!stroke || Math.hypot(e.clientX-stroke[0],e.clientY-stroke[1])<23) return;
    stroke=null;rubbed=true;if(!state().sleeping)petTap();
  });
  touch.addEventListener('pointerup',()=>{stroke=null;});
  touch.addEventListener('pointercancel',()=>{stroke=null;});
  function draw(ts){
    frameHandle=0;
    if(document.hidden || scene.hidden || !seen){prev=0;return;}
    const s=state(), color=s.pet?.color||s.eggColor, sheet=sheetFor(color);
    const dt=prev?Math.min(.05,(ts-prev)/1000):0;prev=ts;t+=dt;
    const quiet=motion.matches, active=s.pet && !s.sleeping && !s.playing;
    const heldNow=t<held, swim=active && !quiet && !heldNow;
    if(!active && routine)stopTrick();
    let roll=0;
    if(routine){
      const q=routine,age=t-q.start;
      if(q.kind==='fetch'){
        const toss=Math.min(1,age/.78);
        const margin=Math.min(.48,(petWidth*.46+3)/width);
        const target=limit(q.side,margin,1-margin),origin=limit(q.origin,margin,1-margin);
        const carried=age>1.5 && (q.caught||Math.abs(x-target)<.035);
        if(carried)q.caught=true;
        if(age>.4)aim(carried?origin:target,carried?q.depth:.65);
        pearl.hidden=false;
        const px=carried?limit(x,margin,1-margin)+facing*petWidth*.11/width:origin+(target-origin)*smooth(toss);
        const py=carried?y-.08:q.depth+(.60-q.depth)*toss-(quiet?0:Math.sin(toss*Math.PI)*.21);
        pearl.style.left=px*100+'%';pearl.style.top=py*100+'%';
        if(age>2.6&&carried&&Math.abs(x-origin)<.035){effect('love',4);stopTrick();}
      }else if(q.kind==='loop'){
        const f=Math.min(1,age/3.4),angle=f*2*Math.PI;
        aim(q.origin+(q.side-q.origin)*(1-Math.cos(angle))*.48,q.depth-Math.sin(angle)*.17);
        roll=quiet?0:360*smooth(f);
        if(f===1){stopTrick();effect('swim',5);}
      }else{
        if(age>=q.next&&q.next<3){bubble();q.next+=.6;}
        if(age>5.8)stopTrick();
      }
      wait=1.2;
    }else if(swim && (wait-=dt)<=0){
      aim(x>.5?.16+Math.random()*.18:.67+Math.random()*.17,.48+Math.random()*.30);wait=2.2+Math.random()*2;
    }
    if(!s.pet){goalX=.5;goalY=.71;}
    if(s.playing&&s.bug)aim(s.bug[0]/100,s.bug[1]/100+.1);
    const difference=goalX-x, moving=(swim||s.playing) && (Math.abs(difference)*width+Math.abs(goalY-y)*height)>7;
    const ease=quiet?1:1-Math.exp(-dt*(routine?3.8:1.65));
    x+=difference*ease;y+=(goalY-y)*ease;
    if(moving && Math.abs(difference)*width>8)facing=difference<0?-1:1;
    turn+=(facing-turn)*(1-Math.exp(-dt*13));
    const margin=Math.min(width*.48,petWidth*.46+3), foot=limit(x*width,margin,width-margin);
    const bob=quiet?0:Math.sin(t*(moving?4.3:1.85))*(s.sleeping?1.1:moving?3.2:2.8);
    const breath=quiet?0:Math.sin(t*(s.sleeping?1.8:2.3))*.016;
    position.style.transform='translate3d('+Math.round((foot-petWidth/2)*10)/10+'px,'+Math.round((y*height-petHeight*.77+bob)*10)/10+'px,0)';
    const tilt=quiet?0:(moving?Math.sin(t*4.3)*2.8:Math.sin(t*1.6)*1.4)+(heldNow&&expression==='love'?Math.sin((held-t)*8)*3.2:0);
    rig.style.transform='rotate('+(tilt+roll)+'deg) scale('+((quiet?facing:turn)*(1-breath*.6))+','+(1+breath)+')';
    const desired=!s.pet?0:s.sleeping?2:heldNow?({love:1,feed:4,wash:1,wake:5,play:1,hatch:1}[expression]??0):moving||s.playing?3:(s.tired?5:0);
    if(desired!==to){from=blend<.5?from:to;to=desired;blend=0;started=t;}
    blend=quiet?1:smooth(limit((t-started)/.19,0,1));
    if(t>blinkAt+.17)blinkAt=t+2.6+Math.random()*3;
    const blink=quiet?0:Math.sin(limit((t-blinkAt)/.17,0,1)*Math.PI);
    if(moving && t>trailAt){effect('swim',1);trailAt=t+.43;}
    if(s.sleeping && !quiet && t>trailAt){effect('nap',1);trailAt=t+3.5;}
    const w=canvas.width,h=canvas.height;ink.clearRect(0,0,w,h);
    const hatching=s.pet && !quiet && t-hatchAt<.85;
    if(!s.pet || hatching){
      gpuCanvas.hidden=true;
      ink.save();
      if(hatching){
        const age=t-hatchAt;
        ink.translate(w/2,h*.77);ink.rotate(Math.sin(age*40)*age*.14);ink.translate(-w/2,-h*.77);
      }
      drawEgg(ink,w,h,color,sheet,quiet?0:t);
      if(hatching && t-hatchAt>.26){
        const nodes=[[.33,.50],[.40,.48],[.45,.56],[.52,.46],[.57,.53],[.66,.45]];
        ink.strokeStyle='#fffad9';ink.shadowBlur=9;ink.shadowColor='#ffcc76';ink.lineWidth=4;ink.lineJoin='round';ink.beginPath();
        for(const [i,[cx,cy]] of nodes.slice(0,Math.min(6,Math.floor((t-hatchAt)*9))).entries()){
          if(i===0)ink.moveTo(w*cx,h*cy);else ink.lineTo(w*cx,h*cy);
        }
        ink.stroke();
      }
      ink.restore();
    }else if(validImage(sheet)){
      if(hatchAt>=0){hatchAt=-10;effect('hatch',9);}
      const rendered=gpu && gpu(sheet,from,to,blend,blink,t%60,quiet ? 0 : s.sleeping ? .48 : 1);
      gpuCanvas.hidden=!rendered;
      if(!rendered){
        const fw=sheet.naturalWidth/6;
        function paintPose(p,alpha){
          if(alpha<=0)return;ink.globalAlpha=alpha;
          // Tail tip travels farther than the head when using the 2D renderer.
          const n=quiet?1:24;
          for(let i=0;i<n;i++){
            const tail=Math.max(0,1-i/(n*.5));
            const dy=quiet?0:Math.sin(t*3.8+i*.3)*tail*tail*(moving?8:3);
            ink.drawImage(sheet,p*fw+i*fw/n,0,fw/n,sheet.height,Math.floor(i*w/n),dy,Math.ceil((i+1)*w/n)-Math.floor(i*w/n),h);
          }
        }
        paintPose(from,1-blend);paintPose(to,blend);ink.globalAlpha=1;
      }
      if(s.wear && !s.sleeping && to!==3 && validImage(hats)){
        const piece=hats.width/4;
        const px=to===4?.53:to===1?.53:.52, py=to===5?.007:.026;
        ink.globalAlpha=to===from?1:Math.min(1,.6+blend);
        ink.drawImage(hats,(s.wear-1)*piece,0,piece,hats.height,w*px,h*py,w*.29,h*.25);ink.globalAlpha=1;
      }
      if(s.mastered){
        ink.strokeStyle='#fff0b5';ink.lineWidth=3;ink.beginPath();ink.ellipse(w*.64,h*.065,w*.135,h*.037,-.08,0,2*Math.PI);ink.stroke();
      }
    }else if(validImage(classic)){
      gpuCanvas.hidden=true;
      const row=['coral','mint','violet'].indexOf(color)*4+stage(s.pet.bond);
      ink.drawImage(classic,0,row*82,100,82,w*.09,h*.12,w*.82,h*.82);
    }
    if(first){layout();first=false;}
    frameHandle=requestAnimationFrame(draw);
  }
  function wake(){if(!frameHandle && !document.hidden && !scene.hidden && seen)frameHandle=requestAnimationFrame(draw);}
  document.addEventListener('visibilitychange',()=>{prev=0;wake();});
  window.addEventListener('pageshow',wake);
  return {wake,act,trick};
}
