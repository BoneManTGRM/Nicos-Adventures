'use strict';
const CrossingRush=(()=>{
  const herds={savanna:['warthog','zebra','elephant','buffalo','lion'],forest:['blackbear','elk','kodiak','grizzly'],ice:['arcticfox','muskox','polar']};
  const names=['First tracks','Herd crossing','Legend crossing'],duration=36;
  function schedule(id,seed){
    const a=RangeRules.byId[id],random=PursuitRules.rng(seed),list=herds[id],arr=[];
    for(let i=0;i<18;i++){
      const wave=Math.floor(i/6),legend=i===13,k=legend?a.legend:list[Math.floor(random()*list.length)];
      const coat=legend?'legend':i===8||random()<.13?'ivory':'common';
      const reserve=legend?a.home:HuntRules.reserves.find(v=>v.species.includes(k)).key;
      arr.push({i,k,coat,reserve,roll:HuntRules.roll(k,coat,random),time:wave*12+[0,1.2,3.2,5.0,7.2,9][i%6],span:legend?8:5+random()*3,lane:(i+wave)%3,dir:(i+wave)%2?1:-1,phase:random()*6});
    }
    return arr;
  }
  function create({root,land,sky,get,change,hang,home,sound,ambient,reduced}){
    let seed=new Uint32Array(1);crypto.getRandomValues(seed);
    const events=schedule(land.id,seed[0]),token=Date.now().toString(36)+'-'+seed[0].toString(36),taken=new Set(),bag=[],reactions=[];
    let elapsed=0,score=0,combo=0,peak=0,shots=0,wave=-1,aim={x:.5,y:.69},frame=[],pause=false,done=false,slow=0,charge=0,cooldown=0,banner=0,pop=null,chosen=0,freeze=0;
    const $=s=>root.querySelector(s),btn=(k,s,cl='range-link')=>'<button class="'+cl+'" data-rush="'+k+'">'+s+'</button>';
    const legend=HuntRules.byKey[land.home].legend;
    root.innerHTML='<div class="range-top"><h1>'+land.name+'</h1>'+ '<div class="rush-topactions">'+btn('pause','Pause hunt')+btn('end','Finish hunt')+'</div></div><section class="rush-field sky-'+sky+'" aria-label="Crossing Rush hunting field"><div class="rush-land" style="--land:url(assets/range/'+land.id+'.webp)"></div><canvas tabindex="0" aria-label="Tap a moving animal. Keyboard: arrows to aim, Space to shoot."></canvas><div class="rush-hud"><span>Score <b data-score>0</b></span><span data-time>36s</span><span data-combo>×1</span></div><div class="rush-banner" aria-live="polite"></div><div class="rush-pop" role="status"></div></section><div class="rush-deck"><div><strong data-wave>First tracks</strong><small data-tip>Tap an animal to shoot, or drag the sight and release.</small></div>'+btn('shoot','Shoot','primary')+btn('focus','Focus · 0/3','rush-focus')+'</div>';
    const field=$('.rush-field'),canvas=$('canvas'),g=canvas.getContext('2d'),badge=$('.rush-banner'),toast=$('.rush-pop');
    const on=(key,fn)=>{const el=root.querySelector('[data-rush="'+key+'"]');if(el)el.onclick=fn;};
    function setPause(next){if(done)return;pause=next;held=null;root.querySelector('[data-rush="shoot"]').disabled=pause;if(!pause)canvas.focus({preventScroll:true});root.querySelector('[data-rush="pause"]').textContent=pause?'Resume hunt':'Pause hunt';field.classList.toggle('paused',pause);badge.textContent=pause?'Hunt paused':names[wave];badge.hidden=false;banner=1;}
    on('pause',()=>setPause(!pause));on('end',finish);
    function focus(){if(pause||done||charge<3||slow>0)return;charge=0;slow=3;sound('photo');hud();}
    on('focus',focus);
    function hud(){
      $('[data-score]').textContent=score.toLocaleString();$('[data-combo]').textContent='×'+Math.min(5,Math.max(1,combo));
      const f=$('[data-rush="focus"]');f.disabled=charge<3||slow>0;f.textContent=slow>0?'Focus active':charge===3?'Use slow motion':'Focus · '+charge+'/3';field.classList.toggle('focused',slow>0);
    }
    function finish(){
      if(done)return;done=true;ambient('');const prev=get().range.logs[land.id].rushBest||0;
      change(rec=>{const l=rec.range.logs[land.id];l.rushBest=Math.max(l.rushBest||0,score);rec.hunts++;});
      bag.sort((a,b)=>Number(b.coat==='legend')-Number(a.coat==='legend')||HuntRules.grades.indexOf(b.medal)-HuntRules.grades.indexOf(a.medal)||b.kg-a.kg);
      function result(){
        const t=bag[chosen];
        root.innerHTML='<div class="range-top"><h1>Hunt complete</h1>'+btn('camp','Range camp')+'</div><div class="rush-results" style="--land:url(assets/range/'+land.id+'.webp)"><div><small>'+(score>prev?'New personal best':'Crossing Rush')+'</small><h2>'+score.toLocaleString()+' pts</h2><p>'+bag.length+(bag.length===1?' trophy · ':' trophies · ')+(shots?Math.round(bag.length/shots*100):0)+'% accuracy · '+peak+' hit streak</p><p>Range best '+Math.max(prev,score).toLocaleString()+' pts</p>'+btn('again','Play again','primary')+'</div></div>'+
          (t?'<div class="rush-award">'+TrophyLodge.portrait(t,300,170)+'<div><small>'+(t.coat==='legend'?'Legendary trophy':t.medal+' medal')+'</small><h2>'+TrophyLodge.name(t)+'</h2><p>'+TrophyLodge.weight(t.kg)+' · '+TrophyLodge.length(t.cm)+'</p>'+btn('mount','Display trophy','primary')+btn('fall','Replay fall')+'</div></div><div class="rush-picks">'+bag.map((v,i)=>'<button data-pick="'+i+'" aria-pressed="'+(chosen===i)+'">'+TrophyLodge.name(v)+' · '+TrophyLodge.weight(v.kg)+'</button>').join('')+'</div>':'<p>Try the next crossing for your first trophy.</p>');
        TrophyLodge.paint(root);on('camp',home);on('again',()=>replay());on('mount',()=>hang(t));on('fall',()=>TrophyReaction.replay($('.rush-award canvas'),t));root.querySelectorAll('[data-pick]').forEach(el=>el.onclick=()=>{chosen=+el.dataset.pick;result();});
      }
      result();sound('win');
    }
    function fire(x,y,pad){
      if(done||pause||elapsed>=duration||cooldown>0||freeze>0)return;shots++;cooldown=.22;
      const f=frame.slice().reverse().find(v=>!taken.has(v.e.i)&&TimberWildlife.hitTest(v.e.k,v.x,v.y,v.h,v.e.dir,v.gait,x,y,pad));
      if(!f){toast.classList.remove('legend');combo=0;toast.textContent='Miss · streak reset';pop=1;sound('move');hud();return;}
      const e=f.e;taken.add(e.i);combo++;peak=Math.max(peak,combo);charge=Math.min(3,charge+1);
      const pts=(e.coat==='legend'?650:e.coat==='ivory'?260:100)*Math.min(combo,5);score+=pts;
      const t={...e.roll,id:'rush-'+token+'-'+e.i,species:e.k,coat:e.coat,reserve:e.reserve,rangeId:land.id,rush:true,sky,date:Date.now()};
      change(rec=>{HuntRules.file(rec,t);});bag.push(t);
      reactions.push(TrophyReaction.capture(e.k,f.x,f.y,f.h,e.dir,f.gait,TrophyLodge.palette(t),canvas.clientWidth,canvas.clientHeight,f.ground,TrophyReaction.terrain(land.id),f.velocity,f.verticalVelocity));
      toast.classList.toggle('legend',e.coat==='legend');
      toast.textContent=TrophyLodge.name(t)+' · '+t.medal+' · '+TrophyLodge.weight(t.kg)+' · +'+pts.toLocaleString()+(combo>1?' · ×'+Math.min(5,combo):'');
      pop=2.35;if(e.coat==='legend')freeze=1.25;
      sound(e.coat==='legend'?'win':'seal');hud();render(0);
    }
    let held=null;
    function point(e){const b=canvas.getBoundingClientRect();aim={x:Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),y:Math.max(0,Math.min(1,(e.clientY-b.top)/b.height))};}
    function takeShot(pad){fire(aim.x*canvas.clientWidth,aim.y*canvas.clientHeight,pad);}
    canvas.onpointerdown=e=>{if(e.button!==0||held!==null||pause||done)return;held=e.pointerId;point(e);canvas.setPointerCapture(e.pointerId);};
    canvas.onpointermove=e=>{if(held===e.pointerId||e.pointerType==='mouse'&&held===null)point(e);};
    canvas.onpointerup=e=>{if(e.pointerId!==held)return;held=null;point(e);takeShot(e.pointerType==='mouse'?3:8);};
    canvas.onpointercancel=e=>{if(e.pointerId===held)held=null;};
    on('shoot',()=>takeShot(6));
    canvas.onkeydown=e=>{if(e.key==='Escape'){setPause(!pause);return;}const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(m){e.preventDefault();aim={x:Math.max(0,Math.min(1,aim.x+m[0]*.035)),y:Math.max(0,Math.min(1,aim.y+m[1]*.035))};}
      if(e.code==='Space'){e.preventDefault();if(!e.repeat)fire(aim.x*canvas.clientWidth,aim.y*canvas.clientHeight,6);}if(e.key.toLowerCase()==='f')focus();};

    function render(dt){
      if(done||pause)return;
      for(let i=reactions.length-1;i>=0;i--){reactions[i].age+=dt;if(reactions[i].age>=TrophyReaction.life)reactions.splice(i,1);}
      if(freeze>0){freeze=Math.max(0,freeze-dt);dt=0;}
      const before=slow;slow=Math.max(0,slow-dt);if(before&&!slow)hud();
      elapsed+=dt*(slow>0 ? .45 : 1);cooldown=Math.max(0,cooldown-dt);
      if(elapsed>=duration){if(!reactions.length){finish();return;}elapsed=duration;}
      const next=Math.min(2,Math.floor(elapsed/12));if(next!==wave){wave=next;field.style.setProperty('--pan',(20+wave*25)+'%');badge.textContent=names[wave];badge.hidden=false;banner=1.5;$('[data-wave]').textContent=names[wave];
        if(wave===2){$('[data-tip]').textContent='Watch for '+legend+' in the gold glow.';sound('start');}}
      banner-=dt;if(banner<=0)badge.hidden=true;if(pop!==null){pop-=dt;if(pop<=0){toast.textContent='';pop=null;}}
      $('[data-time]').textContent=Math.ceil(duration-elapsed)+'s';$('[data-time]').classList.toggle('urgent',elapsed>=31);
      const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(2,window.devicePixelRatio||1);if(!w||!h)return;
      if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
      g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,w,h);frame=[];
      for(const e of events){
        const progress=(elapsed-e.time)/e.span;if(progress<0||progress>1||taken.has(e.i))continue;
        // Link stride to ground distance. Quick animals bound, bears lope and heavy herds walk.
        const quick=['arcticfox','warthog','lion','elk','zebra'].includes(e.k);
        const travel=progress-(quick?.065:.035)*Math.sin(progress*2*Math.PI);
        const pos=e.dir===1?travel:1-travel;
        const x=w*(e.i===0 ? -.13+.88*pos : -.15+pos*1.3);
        const ratio=TimberWildlife.bounds(e.k,1).width;
        const base=Math.min(h*(.24+.055*e.lane),w*(.31+.052*e.lane)/ratio);
        const stride=base*(quick?1.02:.78);
        const gait=e.phase+(reduced?progress*18:travel*w*(e.i===0?.88:1.3)/stride*2*Math.PI);
        const ground=h*(.55+.137*e.lane+.017*Math.sin(progress*4+e.phase));
        const lift=reduced?0:Math.pow(Math.max(0,Math.sin(gait*2)),2)*base*(quick?.052:.016);
        const slope=1-(quick?.065:.035)*2*Math.PI*Math.cos(progress*2*Math.PI);
        const velocity=e.dir*w*(e.i===0?.88:1.3)*slope/e.span*(slow>0?.45:1);
        const running=slow>0?.45:1;
        const gaitRate=Math.abs(velocity)*2*Math.PI/stride;
        const liftRate=reduced?0:4*Math.max(0,Math.sin(gait*2))*Math.cos(gait*2)*gaitRate*base*(quick?.052:.016);
        const verticalVelocity=h*.068*Math.cos(progress*4+e.phase)*running/e.span-liftRate;
        frame.push({e,x,y:ground-lift,ground,h:base,gait,velocity,verticalVelocity});
      }
      frame.sort((a,b)=>a.ground-b.ground);
      const layers=reactions.length ? frame.concat(reactions.map(reaction=>({ground:reaction.ground*h,reaction}))).sort((a,b)=>a.ground-b.ground) : frame;
      for(const f of layers){
        if(f.reaction){TrophyReaction.paint(g,f.reaction,w,h,reduced);continue;}
        const {e,x,y,h:size,gait}=f;
        g.fillStyle='#171b1840';g.beginPath();g.ellipse(x,f.ground,TimberWildlife.bounds(e.k,size).width*.33,size*.045,0,0,Math.PI*2);g.fill();
        TimberWildlife.draw(g,e.k,x,y,size,e.dir,gait,e.coat==='legend'?'legend':e.coat==='ivory',true);
        if(!reduced){for(let j=0;j<4;j++){const step=(elapsed*1.5+j*.25)%1;g.fillStyle=land.id==='ice'?'rgba(229,248,255,'+(1-step)*.38+')':land.id==='forest'?'rgba(180,220,229,'+(1-step)*.32+')':'rgba(244,202,139,'+(1-step)*.36+')';g.fillRect(x-e.dir*size*(.28+step*.45),f.ground-size*.09*Math.sin(step*Math.PI),2+step*3,1+step*2);}}
        if(e.coat!=='common'){g.fillStyle=e.coat==='legend'?'#ffe8a3':'#edf4f0';g.font='bold 15px system-ui';g.textAlign='center';g.fillText(e.coat==='legend'?'✦ '+legend:'◇ Ivory',x,y-size-5);}
      }
      const ax=aim.x*w,ay=aim.y*h,r=10+cooldown*28;
      g.beginPath();g.arc(ax,ay,r,0,Math.PI*2);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){g.moveTo(ax+dx*(r-4),ay+dy*(r-4));g.lineTo(ax+dx*(r+5),ay+dy*(r+5));}
      g.strokeStyle='#15221ed9';g.lineWidth=3;g.stroke();g.strokeStyle=cooldown>0?'#ffd579':'#fff7dc';g.lineWidth=1.5;g.stroke();
    }
    let replay=()=>{};
    ambient(land.id);hud();render(0);canvas.focus({preventScroll:true});
    return {tick:render,onReplay:fn=>{replay=fn;},pause:()=>setPause(true)};
  }
  return {create,schedule,herds};
})();
