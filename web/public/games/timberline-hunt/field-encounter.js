'use strict';
const FieldEncounter=(()=>{
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function pose(t,elapsed,reduced){
    if(reduced)return {x:.5,y:.70,dir:t.direction,gait:1,depth:1};
    const s=HuntRules.wildlife[t.species],heavy=s.bearFamily||s.size>=.9;
    const beat=elapsed*s.speed*(heavy?5:6.5)+t.phase;
    const stride=beat+(heavy ? .75 : .38)*Math.sin(beat);
    const depth=1+.14*Math.sin(stride*.83+t.phase);
    return {x:.50+.30*Math.sin(stride),y:.72+.075*Math.sin(stride*.83+t.phase),
      dir:Math.cos(stride)>=0?1:-1,gait:stride*(heavy?4.8:7.6),depth};
  }
  function create({root,land,t,sky,stop,reduced,sound,success,back}){
    let elapsed=0,tries=3,cooldown=0,alert=0,held=null,finished=false,frame=null;
    LandingArt.warm(t.species);
    let reveal=null;
    let aim={x:.5,y:.61};
    root.innerHTML='<div class="range-top"><h1>'+TrophyLodge.name(t)+'</h1><button class="range-link" data-back>Back to lookout</button></div>'+
      '<div class="enc-scene sky-'+sky+'" style="--land:url(assets/range/'+land.id+'.webp);--view:'+((stop/2)*100)+'%"><div class="enc-bg"></div><canvas aria-hidden="true"></canvas><div class="enc-place">'+land.landmarks[stop]+'</div><div class="wild-sight" aria-hidden="true"></div></div>'+
      '<div class="enc-panel"><div><strong data-call role="status">Tap the moving animal</strong><p>Tap the animal to shoot, or drag the sight over it and release.<span class="enc-keys"> Use arrow keys to aim and Space to shoot.</span></p></div><div><small data-tries>3 attempts</small><button class="primary" data-fire>Take shot</button></div></div>';
    const find=s=>root.querySelector(s),scene=find('.enc-scene'),canvas=find('canvas'),g=canvas.getContext('2d'),fire=find('[data-fire]'),label=find('[data-call]');
    const setCall=s=>{if(label.textContent!==s)label.textContent=s;};
    const onAnimal=pad=>!!frame&&TimberWildlife.hitTest(t.species,frame.x,frame.y,frame.size,frame.dir,frame.gait,aim.x*frame.w,aim.y*frame.h,pad);
    function reticle(){
      scene.style.setProperty('--aim-x',aim.x*100+'%');scene.style.setProperty('--aim-y',aim.y*100+'%');
      const aligned=onAnimal(2);scene.classList.toggle('enc-lock',aligned);
      if(!finished&&cooldown===0)setCall(aligned?'Animal in sight':'Tap the moving animal');
    }
    function render(dt){
      if(reveal){
        reveal.pose.age+=dt;
        if(reveal.pose.age>=TrophyReaction.life){const done=reveal.done;reveal=null;done();return;}
        const w=scene.clientWidth,h=scene.clientHeight;if(!w||!h)return;
        g.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);g.clearRect(0,0,w,h);
        TrophyReaction.paint(g,reveal.pose,w,h,reduced);return;
      }
      if(finished)return;
      elapsed+=dt*(1+1.8*alert);alert=Math.max(0,alert-dt*.48);cooldown=Math.max(0,cooldown-dt);
      const w=scene.clientWidth,h=scene.clientHeight;if(!w||!h)return;
      const d=Math.min(2,window.devicePixelRatio||1);
      if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
      g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;
      const p=pose(t,elapsed,reduced),ratio=TimberWildlife.bounds(t.species,1).width;
      const size=Math.min(h*.39,(w*.35)/ratio)*p.depth,x=w*p.x,y=h*p.y;
      const velocity=frame&&dt>0 ? (p.x-frame.x/frame.w)*w/dt : frame?.velocity||0;
      frame={w,h,x,y,size,dir:p.dir,gait:p.gait,velocity};
      g.fillStyle='#1c21165e';g.beginPath();g.ellipse(x,y,ratio*size*.35,Math.max(2,size*.035),0,0,Math.PI*2);g.fill();
      TimberWildlife.draw(g,t.species,x,y,size,p.dir,p.gait,TrophyLodge.palette(t),true);reticle();
    }
    function shoot(pad){
      if(finished||cooldown>0||!frame)return;
      if(onAnimal(pad)){
        finished=true;const done=success();
        if(typeof done==='function'){
          reveal={done,pose:TrophyReaction.capture(t.species,frame.x,frame.y,frame.size,frame.dir,frame.gait,TrophyLodge.palette(t),frame.w,frame.h,frame.y,TrophyReaction.terrain(land.id),frame.velocity)};
          setCall(t.medal+' medal · '+TrophyLodge.weight(t.kg));fire.disabled=true;find('[data-tries]').textContent='Trophy secured';render(0);
        }
        return;
      }
      tries--;sound('move');find('[data-tries]').textContent=tries+' attempt'+(tries===1?'':'s');
      if(!tries){finished=true;scene.classList.add('enc-escaped');setCall('It slipped away. Try another sighting at the lookout.');fire.textContent='Return to lookout';fire.focus({preventScroll:true});return;}
      alert=1;cooldown=.65;setCall(reduced?'Miss · try again':'Miss · the animal is moving faster');
    }
    function position(e){const box=scene.getBoundingClientRect();aim={x:clamp((e.clientX-box.left)/box.width,0,1),y:clamp((e.clientY-box.top)/box.height,0,1)};reticle();}
    scene.onpointerdown=e=>{if(finished||held!==null||e.button!==0)return;held=e.pointerId;scene.setPointerCapture(e.pointerId);position(e);};
    scene.onpointermove=e=>{if(!finished&&(held===e.pointerId||e.pointerType==='mouse'))position(e);};
    scene.onpointercancel=()=>{held=null;};
    scene.onpointerup=e=>{if(held!==e.pointerId)return;held=null;position(e);shoot(e.pointerType==='mouse'?2:8);};
    fire.onclick=()=>finished?back():shoot(4);
    fire.onkeydown=e=>{
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
      if(!delta||finished)return;e.preventDefault();
      aim={x:clamp(aim.x+delta[0]*.028,0,1),y:clamp(aim.y+delta[1]*.028,0,1)};reticle();
    };
    find('[data-back]').onclick=()=>{if(reveal){const done=reveal.done;reveal=null;done();}else back();};render(0);fire.focus({preventScroll:true});return {render};
  }
  return {create,pose};
})();
