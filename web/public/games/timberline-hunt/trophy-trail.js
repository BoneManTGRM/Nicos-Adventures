'use strict';
const TrophyTrail=(()=>{
  const clue={
    elephant:'A long trunk and a pair of curved tusks.',lion:'A deep mane and a dark tuft at the tip of the tail.',warthog:'An upright tail and tusks above the snout.',
    kodiak:'A broad brown bear with a heavy shoulder hump.',grizzly:'A silver-tipped hump rises just behind the head.',elk:'A dark neck beneath a tall rack of antlers.',
    polar:'An ivory coat, low head and a long neck.',muskox:'A shaggy skirt of hair and downward-curving horns.',arcticfox:'A low white silhouette with a long, bushy tail.'
  };
  const choices={savanna:['elephant','lion','warthog'],forest:['kodiak','grizzly','elk'],ice:['polar','muskox','arcticfox']};
  const pick=(list,rand)=>list[Math.floor(rand()*list.length)];
  const btn=(id,title,cls='trail-button')=>'<button class="'+cls+'" data-trail="'+id+'">'+title+'</button>';
  function create({root,land,sky,change,hang,home,sound,ambient,reduced}){
    const rand=PursuitRules.rng(crypto.getRandomValues(new Uint32Array(1))[0]);
    const slots=choices[land.id],name=k=>HuntRules.wildlife[k].name;
    const find=s=>root.querySelector(s),on=(id,fn)=>{find('[data-trail="'+id+'"]').onclick=fn;};
    let stage='choose',quarry,leg,site,location,target,herd=[],time,remaining,shots,bag=[],elapsed=0,frame=[],aim={x:.5,y:.65},press,scanTime=0,scanned=new Set(),paused=false,notice=0,canvas,scene,ctx,filing;
    let reveal=null, targetCoat='common';
    let displayClock=0,displayFrame=-1,portraits=[];
    function showPortraits(){
      TrophyLodge.paint(root);displayClock=0;displayFrame=-1;
      portraits=Array.from(root.querySelectorAll('canvas[data-kind]'));
    }
    function animatePortraits(dt){
      if(reduced)return;
      displayClock+=dt;const next=Math.floor(displayClock*12);
      if(next===displayFrame)return;displayFrame=next;
      for(const [i,c] of portraits.entries()){
        if(c.dataset.fallPlay)continue;
        const k=c.dataset.kind,g=c.getContext('2d');
        const size=Math.min(c.height-8,(c.width-18)/TimberWildlife.bounds(k,1).width);
        const step=displayClock*2.4+i;
        g.clearRect(0,0,c.width,c.height);
        TimberWildlife.draw(g,k,c.width/2+Math.sin(step*.38)*3,c.height-4,size,1,step,TrophyLodge.palette({coat:c.dataset.coat}));
      }
    }
    const heading=(title,action)=>'<div class="range-top"><h1>'+title+'</h1>'+action+'</div>';
    function select(){
      stage='choose';ambient('');root.innerHTML=heading('Choose your quarry',btn('camp','Range camp','range-link'))+'<p class="trail-lead">Choose your first animal. Bring home two trophies to open the legendary trail.</p><div class="trail-choices">'+slots.map(k=>'<button data-quarry="'+k+'">'+TrophyLodge.portrait({species:k},240,128)+'<strong>'+name(k)+'</strong><small>'+clue[k]+'</small></button>').join('')+'</div>';
      showPortraits();on('camp',home);root.querySelectorAll('[data-quarry]').forEach(el=>el.onclick=()=>{quarry=el.dataset.quarry;leg=0;bag=[];begin();});
    }
    function begin(retry=false){
      if(!retry){
        target=leg===0?quarry:leg===1?pick(slots.filter(k=>k!==quarry&&k!==land.legend),rand):land.legend;
        targetCoat=leg===2?'legend':rand()<.15?'ivory':'common';
      }
      site=Math.floor(rand()*3);location=(site+1+Math.floor(rand()*2))%3;stage='search';elapsed=0;time=0;notice=0;paused=false;press=null;shots=3;remaining=13;scanTime=0;scanned.clear();
      const decoys=CrossingRush.herds[land.id].filter(k=>k!==target);
      herd=Array.from({length:3},(_,i)=>{
        const pool=[...decoys],cast=[];
        for(let j=0;j<3;j++){if(!pool.length)pool.push(...decoys);cast.push(pool.splice(Math.floor(rand()*pool.length),1)[0]);}
        if(i===site)cast[1+Math.floor(rand()*2)]=target;
        return cast.map((k,j)=>({k,s:rand()*6,depth:[.68,.87,.77][j],speed:.29+rand()*.15}));
      });
      sceneView();ambient(land.id);sound('start');
    }
    function title(){return leg===2?HuntRules.byKey[land.home].legend:name(target);}
    function sceneView(){
      root.innerHTML=heading(title(),btn('pause','Pause','range-link'))+'<div class="trail-status"><b>Trail '+(leg+1)+' / 3</b><span data-phase></span></div><section class="rush-field trail-scene sky-'+sky+'" aria-label="Wildlife lookout"><div class="rush-land" style="--land:url(assets/range/'+land.id+'.webp)"></div><canvas tabindex="0" aria-label="Animal field. Arrow keys move your cursor. Space selects an animal."></canvas><div class="trail-marker"></div><div class="trail-message" aria-live="polite"></div></section><div class="trail-compass">'+land.landmarks.map((n,i)=>btn('site'+i,n)).join('')+'</div><div class="trail-guide"><strong data-instruction></strong><p data-hint></p>'+btn('scan','Survey lookout')+'</div>';
      scene=find('.trail-scene');canvas=find('canvas');ctx=canvas.getContext('2d');on('pause',()=>pause(!paused));
      on('scan',()=>{if(paused||stage!=='search'||scanned.has(location))return;scanned.add(location);scanTime=3;sound('photo');update();message(location===site?'Fresh sign here. Check the herd.':location<site?'Tracks lead to the right.':'Tracks lead to the left.');});
      land.landmarks.forEach((_,i)=>on('site'+i,()=>travel(i)));
      canvas.onpointerdown=e=>{if(e.button===0&&!paused){press={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}};
      canvas.onpointercancel=()=>press=null;
      canvas.onpointerup=e=>{if(!press||e.pointerId!==press.id)return;const dx=e.clientX-press.x,dy=e.clientY-press.y;press=null;
        if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){travel(Math.min(2,Math.max(0,location+(dx<0?1:-1))));return;}
        if(Math.abs(dy)>35)return;
        const b=canvas.getBoundingClientRect();aim={x:(e.clientX-b.left)/b.width,y:(e.clientY-b.top)/b.height};act(e.pointerType==='mouse'?3:8);};
      canvas.onkeydown=e=>{if(e.key==='Escape'){pause(!paused);return;}if(paused)return;
        const delta={ArrowLeft:[-.035,0],ArrowRight:[.035,0],ArrowUp:[0,-.035],ArrowDown:[0,.035]}[e.key];
        if(delta){e.preventDefault();aim={x:Math.max(0,Math.min(1,aim.x+delta[0])),y:Math.max(0,Math.min(1,aim.y+delta[1]))};canvas.classList.add('aiming');}
        if(e.code==='Space'){e.preventDefault();if(!e.repeat)act(6);}};
      update();tick(0);canvas.focus({preventScroll:true});
    }
    function travel(i){if(paused||stage!=='search'||location===i)return;location=i;scanTime=0;sound('move');message('');update();tick(0);}
    function update(){
      const search=stage==='search';find('[data-phase]').textContent=search?'Scout the range':'Crossing · '+shots+' shots · '+Math.ceil(remaining)+'s';
      find('.trail-marker').textContent=land.landmarks[location];scene.style.setProperty('--pan',location*50+'%');
      land.landmarks.forEach((_,i)=>{const b=find('[data-trail="site'+i+'"]');b.disabled=!search||paused;b.setAttribute('aria-pressed',String(location===i));});
      const scanner=find('[data-trail="scan"]');scanner.hidden=!search;scanner.disabled=paused||scanned.has(location);scanner.textContent=scanned.has(location)?'Lookout surveyed':'Survey lookout';
      find('[data-instruction]').textContent=search?'Spot '+title():'Shoot '+title();
      find('[data-hint]').textContent=search?clue[target]+' Tap a lookout or swipe to scout. Tap your quarry to spot it, then tap it again to shoot.':'Follow the moving animal. Other animals cost a shot.';
    }
    function message(s){find('.trail-message').textContent=s;notice=2;}
    function pause(value){if(!['search','crossing'].includes(stage))return;paused=value;press=null;find('[data-trail="pause"]').textContent=value?'Resume':'Pause';message(value?'Hunt paused':'');update();}
    function tick(dt){
      if(stage==='reveal'){
        reveal.pose.age+=dt;
        if(reveal.pose.age>=TrophyReaction.life){const done=reveal.done;reveal=null;done();return;}
        const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
        ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.clearRect(0,0,w,h);
        for(const a of frame){
          if(a===reveal.animal){TrophyReaction.paint(ctx,reveal.pose,w,h,reduced);continue;}
          const age=reduced?0:reveal.pose.age, size=a.size*h/reveal.height;
          const x=a.x*w/reveal.width+a.dir*w*.095*age, y=a.y*h/reveal.height;
          ctx.fillStyle='#10170e55';ctx.beginPath();ctx.ellipse(x,y,TimberWildlife.bounds(a.k,size).width*.36,size*.04,0,0,Math.PI*2);ctx.fill();
          TimberWildlife.draw(ctx,a.k,x,y,size,a.dir,a.gait+age*7,a.rare);
        }
        return;
      }
      if(stage==='choose'||stage==='result'){animatePortraits(dt);return;}
      if(paused||!['search','crossing'].includes(stage))return;
      elapsed+=dt;scanTime=Math.max(0,scanTime-dt);if(stage==='crossing'){time+=dt;remaining-=dt;if(remaining<=0){result(false);return;}find('[data-phase]').textContent='Crossing · '+shots+' shots · '+Math.ceil(remaining)+'s';}
      if((notice-=dt)<=0)find('.trail-message').textContent='';
      const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const d=Math.min(2,window.devicePixelRatio||1);
      if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
      ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);frame=[];
      for(const [j,a] of herd[location].entries()){
        const moving=stage==='crossing',phase=a.s+elapsed*a.speed;
        let nx=[.23,.50,.78][j]+Math.sin(phase)*.14,dir=Math.cos(phase)>=0?1:-1;
        let gait=phase*6,depth=a.depth;
        if(moving){
          const pursuer=a.k===target,delay=pursuer?.58:.12+j*.22;
          const run=Math.max(0,time-delay),fraction=Math.min(1,run/(13-delay));
          const advance=fraction*(.27+.73*fraction)+.075*Math.sin(fraction*Math.PI*2)**2;
          const end=a.escape>0?1.12:-.12;
          nx=a.start+(end-a.start)*advance*(pursuer?1:1.5);
          dir=a.escape;gait=a.gait+run*(a.k==='elephant'||a.k==='muskox'?5.5:8.8);
          depth+=Math.sin(fraction*Math.PI)*(pursuer?.075:-.045);
        }
        if(dt>0&&moving)a.velocity=(nx-(a.previousX??nx))*w/dt;
        a.previousX=nx;
        const x=w*nx,feet=h*(depth+(reduced?0:.006*Math.sin(gait*2)));
        const ratio=TimberWildlife.bounds(a.k,1).width;
        const size=Math.min(w*(.30+(depth-.65)*.95)/ratio,h*(.23+(depth-.65)*.57));
        frame.push({k:a.k,x,y:feet,size,dir,gait,j,velocity:a.velocity||0,rare:a.k===target&&location===site?TrophyLodge.palette({coat:targetCoat}):false});
      }
      frame.sort((a,b)=>a.y-b.y);for(const a of frame){ctx.fillStyle='#10170e55';ctx.beginPath();ctx.ellipse(a.x,a.y,TimberWildlife.bounds(a.k,a.size).width*.36,a.size*.04,0,0,Math.PI*2);ctx.fill();TimberWildlife.draw(ctx,a.k,a.x,a.y,a.size,a.dir,a.gait,a.rare,a.k===target);}
      if(scanTime>0){ctx.save();ctx.textAlign='center';ctx.font='bold 14px system-ui';for(const a of frame){const text=name(a.k),y=a.y-a.size-6,bw=ctx.measureText(text).width+12,labelX=Math.max(bw/2,Math.min(w-bw/2,a.x));ctx.fillStyle='#14261fe8';ctx.fillRect(labelX-bw/2,y-15,bw,21);ctx.fillStyle='#fff0c9';ctx.fillText(text,labelX,y);}ctx.restore();}
      if(canvas.classList.contains('aiming')){ctx.strokeStyle='#fff3b8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w*aim.x,h*aim.y,8,0,Math.PI*2);ctx.stroke();}
    }
    function act(pad){
      if(paused||!['search','crossing'].includes(stage))return;
      const animal=frame.slice().reverse().find(a=>TimberWildlife.hitTest(a.k,a.x,a.y,a.size,a.dir,a.gait,aim.x*canvas.clientWidth,aim.y*canvas.clientHeight,pad));
      if(stage==='search'){
        if(animal?.k===target){
          for(const pose of frame){const a=herd[location][pose.j];a.start=pose.x/canvas.clientWidth;a.gait=pose.gait;a.escape=a.k===target?(a.start>.5?-1:1):pose.dir;}
          stage='crossing';scanTime=0;time=0;sound('photo');update();message('Spotted! Tap the animal to shoot.');tick(0);}
        else message(animal?name(animal.k)+' spotted. Keep looking.':'Look for movement near '+land.landmarks[site]+'.');
      }else if(animal?.k===target){result(true,animal);}
      else{shots--;if(!shots){result(false);return;}sound('move');update();message(animal?'Different animal · '+shots+' shots left':'Miss · '+shots+' shots left');}
    }
    function result(won,animal){
      if(stage!=='crossing')return;stage='result';ambient('');let specimen;
      if(won){
        const reserve=leg===2?land.home:HuntRules.reserves.find(r=>r.species.includes(target)).key;
        const coat=targetCoat;
        specimen={...HuntRules.roll(target,coat,rand),id:crypto.randomUUID(),species:target,reserve,coat,date:Date.now(),rangeId:land.id,rangeStop:site,sky};
        change(r=>{filing=HuntRules.file(r,specimen);r.hunts++;});bag.push(specimen);
      }
      sound(won?'win':'move');
      if(won){
        stage='reveal';const pose=TrophyReaction.capture(target,animal.x,animal.y,animal.size,animal.dir,animal.gait,animal.rare,canvas.clientWidth,canvas.clientHeight,animal.y,TrophyReaction.terrain(land.id),animal.velocity);
        reveal={pose,animal,width:canvas.clientWidth,height:canvas.clientHeight,done:()=>showResult(won,specimen)};
        const detail=specimen.medal+' medal · '+TrophyLodge.weight(specimen.kg);message(detail);
        find('[data-phase]').textContent='Trophy secured';find('[data-instruction]').textContent=TrophyLodge.name(specimen);
        find('[data-hint]').textContent=detail;find('[data-trail="pause"]').disabled=true;tick(0);
      }else showResult(false,null);
    }
    function showResult(won,specimen){
      stage='result';const label=won?(filing.first?'First of its species':filing.weightRecord?'New weight record':filing.lengthRecord?'New length record':specimen.medal+' medal'):'Trail lost';
      root.innerHTML=heading(won&&leg===2?'Legend claimed':won?'Trophy claimed':'It got away',btn('camp','Range camp','range-link'))+
        '<section class="trail-prize" style="--land:url(assets/range/'+land.id+'.webp)"><div>'+TrophyLodge.portrait(specimen||{species:target},390,195)+'</div><article><small>'+label+'</small><h2>'+(won?TrophyLodge.name(specimen):title())+'</h2><p>'+(won?TrophyLodge.weight(specimen.kg)+' · '+TrophyLodge.length(specimen.cm)+' · '+specimen.medal+' medal':shots?'The herd cleared the lookout.':'All three shots are spent.')+'</p></article></section>'+
        '<div class="trail-actions">'+btn('next',won?(leg===2?'Choose another hunt':leg===1?'Follow the legendary trail':'Follow the next trail'):'Retry this trail','primary')+(won?btn('mount','Display trophy')+btn('fall','Replay fall'):'')+'</div><p class="trail-lead">'+bag.length+' / 3 trophies collected on this trail.</p>';
      showPortraits();on('camp',home);if(won){on('mount',()=>hang(specimen));on('fall',()=>TrophyReaction.replay(find('.trail-prize canvas'),specimen));}on('next',()=>{if(won&&leg===2){select();return;}if(won)leg++;begin(!won);});
    }
    select();return {tick,pause:()=>pause(true)};
  }
  return {create};
})();
