'use strict';
const OpenRange=(()=>{
  const R=RangeRules;
  const icon=n=>'<svg aria-hidden="true"><use href="#i-'+n+'"/></svg>';
  const button=(action,label,classes='',attrs='')=>'<button type="button" class="'+classes+'" data-range="'+action+'" '+attrs+'>'+label+'</button>';
  const art=a=>'assets/range/'+a.id+'.webp';
  const name=t=>TrophyLodge.name(t);
  const skies=['☀','◒','☾'];
  const stampLine=log=>R.skies.map((n,i)=>'<span class="range-stamp '+(log.skies.includes(i)?'stamped':'')+'">'+(log.skies.includes(i)?'✓ ':'○ ')+n+'</span>').join('');
  function create({root,get,change,exit,hang,room,sound,ambient}){
    let selected='savanna',sky=0,page='board',clock=0,sprites=[],token='',scrollTask=0,notice='',lastCue=0,renderKey=0,entrance=false,encounter=null,rush=null;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $=s=>root.querySelector(s);
    const a=()=>R.byId[selected],run=()=>get().range.runs[selected];
    function choose(raw=true){selected=get().range.selected;const r=run();sky=r?.sky??0;if(raw)notice='';}
    function memo(fn){let value;change(rec=>{const r=rec.range.runs[selected];if(r&&r.token===token)value=fn(r,rec);});return value;}
    function resetPage(next){clearTimeout(scrollTask);sprites=[];encounter=null;rush=null;page=next;renderKey++;lastCue=0;}
    function sprite(layer,t,sceneIndex,cell,hero=false){
      const c=layer.querySelector('canvas'),g=c.getContext('2d'),s=HuntRules.wildlife[t.species];
      const animalHeight=Math.min(c.height-14,(c.width-16)/TimberWildlife.bounds(t.species,1).width);
      sprites.push({layer,c,g,t,sceneIndex,cell,hero,phase:t.phase||0,h:animalHeight,pace:s.speed*12,lastFrame:-1});
    }
    function galleryButton(){return button('gallery',icon('room')+'Range gallery','range-link');}
    function home(){choose();board();}
    function board(){
      resetPage('board');ambient('');const land=a(),rec=get().range,r=run(),pending=r&&r.stage!=='done',log=rec.logs[selected];
      CrossingRush.herds[land.id].forEach(LandingArt.warm);
      const selects=R.ranges.map(v=>{
        const e=rec.logs[v.id],inProgress=rec.runs[v.id]&&rec.runs[v.id].stage!=='done';
        return button('range','<span class="range-card-image" style="background-image:url('+art(v)+')"></span><span class="range-card-copy"><small>'+v.area+'</small><strong>'+v.name+'</strong><em>'+(inProgress?'Outing in progress':e.best?RangePrints.title(e.best):HuntRules.byKey[v.home].legend+' crossing')+'</em></span>','range-card','data-id="'+v.id+'" aria-pressed="'+(v.id===selected)+'"');
      }).join('');
      const sample={id:selected,sky,seed:8745,token:'camp',date:0};
      const featured=selected==='savanna'?[0,8,6]:selected==='forest'?[1,6,3]:[1,0,2];
      root.innerHTML='<div class="range-top"><h1>Timberline hunts</h1><div>'+button('pursuits','Wild pursuits','range-link')+button('expeditions','Expeditions','range-link')+button('quick','Quick hunt','range-link')+'</div></div>'+
      '<div class="range-hero deluxe-hero sky-'+sky+'" style="--land:url('+art(land)+');--tint:'+land.color+'"><div class="range-hero-art"></div><div class="range-hero-cast" aria-hidden="true">'+featured.map((_,i)=>'<span class="range-model hero-model-'+i+'"><canvas width="340" height="225"></canvas></span>').join('')+'</div><div class="range-hero-shade"></div><div class="range-banner"><small>'+land.area+' &nbsp; / &nbsp; Hunting grounds</small><h2>'+land.name+'</h2><p>Tap a moving animal to shoot. Hunt the crossing and watch for '+HuntRules.byKey[land.home].legend+'.</p>'+button('rush',icon('play')+'Hunt now','primary')+button('trail','Track a trophy','range-explore')+button('explore',pending?'Resume open range':'Explore open range','range-explore')+'</div></div>'+
      '<div class="range-prefs"><div role="group" aria-label="Light for your outing"><b>Departure</b>'+R.skies.map((n,i)=>button('sky','<i>'+skies[i]+'</i>'+n,'range-sky','data-sky="'+i+'" aria-pressed="'+(sky===i)+'" ' +''+' title="'+n+'"')).join('')+'</div>'+galleryButton()+'</div>'+
      '<div class="range-section"><h2>Roaming grounds</h2><span>'+R.ranges.filter(v=>rec.logs[v.id].best).length+' / 3 panoramas · Rush best '+(log.rushBest||0).toLocaleString()+'</span></div><div class="range-cards">'+selects+'</div>'+
      (log.best?'<div class="range-last"><b>'+RangePrints.title(log.best)+'</b><span>'+log.clears+' crossing'+(log.clears===1?'':'s')+' · '+log.skies.length+' / 3 lights collected</span><div class="range-stamps">'+stampLine(log)+'</div>'+galleryButton()+'</div>':'');
      const models=root.querySelectorAll('.range-model');
      featured.forEach((index,i)=>sprite(models[i],R.animal(sample,index),i,0,true));
      tick(0,true);
    }
    function playRush(){
      resetPage('rush');sound('start');
      rush=CrossingRush.create({root,land:a(),sky,get,change,hang,home,sound,ambient,reduced});
      rush.onReplay(playRush);window.scrollTo(0,0);
    }
    function start(direct){
      const fresh=!run()||run().stage==='done';
      change(rec=>{
        let r=rec.range.runs[selected];
        if(!r||r.stage==='done')rec.range.runs[selected]=R.begin(selected,sky,Math.floor(Math.random()*0x100000000));
      });token=run().token;notice='';sound('start');field();
      if(fresh&&direct)tap(selected==='ice'?2:0);
    }
    function instructions(r){
      const goals=R.targets(r),p=R.progress(r),land=a();
      const phrases=land.landmarks.map(n=>'Explore '+n);
      if(r.stage==='event')return {line:'The crossing is here',body:'Hunt '+HuntRules.byKey[land.home].legend+' at '+land.landmarks[2]+'. Photograph the companions first for a fuller panorama.',loc:2,p,phrases};
      const idx=p.indexOf(false);
      const alternatives=[' A photo of '+HuntRules.wildlife[R.animal(r,goals.photo).species].name+' also counts.','',' The '+land.seal.toLowerCase()+' also counts.'];
      return {line:'Hunt at '+land.landmarks[idx],body:'Choose an animal for a close encounter.'+alternatives[idx],loc:idx,p,phrases};
    }
    function weatherLayer(){
      const n=R.ranges.indexOf(a());
      return '<div class="range-drift drift-'+n+'" aria-hidden="true">'+Array.from({length:11},(_,i)=>'<i style="left:'+((i*13+5)%100)+'%;top:'+((i*19+6)%85)+'%;--delay:-'+(i*1.7)+'s"></i>').join('')+'</div>';
    }
    function receipt(r){
      if(!r.lastCatch||!r.bag.includes(r.lastCatch.index))return '';
      const t=R.animal(r,r.lastCatch.index),prior=r.lastCatch.prior;
      const record=r.lastCatch.record?(Number.isFinite(prior)?'Weight record · up '+TrophyLodge.weight(Math.round((t.kg-prior)*10)/10):'First species record'):'Trophy collected';
      return '<div class="field-receipt">'+TrophyLodge.portrait(t,160,88)+'<div><small>'+record+'</small><br><strong>'+name(t)+'</strong><p>'+t.medal+' · '+TrophyLodge.weight(t.kg)+' · '+TrophyLodge.length(t.cm)+'</p></div>'+button('lastMount','Display trophy','range-link')+'</div>';
    }
    function field(){
      const r=run();if(!r||r.stage==='done'){if(r)result();else board();return;}
      resetPage('field');token=r.token;const land=a(),inst=instructions(r);ambient(land.id);const savedStop=r.stop;
      const stops=land.landmarks.map((n,i)=>button('travel','<small>0'+(i+1)+'</small><span>'+n+'</span>','range-stop','data-stop="'+i+'" aria-pressed="'+(r.stop===i)+'"')).join('');
      const sections=land.landmarks.map((n,cell)=>{
        const ids=R.active({...r,stop:cell});
        const items=ids.map(i=>{
          const t=R.animal(r,i),slot=i%3,photo=r.photo.includes(i),legend=i===11;
          const inEvent=r.stage==='event'&&cell===2;
          return button('animal','<canvas width="325" height="200" aria-hidden="true"></canvas><span class="range-tag">'+(legend?'✦ ':photo?'✓ ':'')+name(t)+'</span>','range-animal spot-'+slot+(legend?' range-legend':'')+(inEvent?' crossing-animal':''),'data-i="'+i+'" aria-label="'+name(t)+(legend?', crossing legend':'')+(photo?', photographed':'')+'" tabindex="'+(cell===r.stop?0:-1)+'"');
        }).join('');
        return '<div class="range-cell" aria-label="'+n+'">'+items+(cell===2&&r.stage==='roam'&&!r.seen?button('seal','<span>'+land.sign+'</span>','range-seal','aria-label="Collect '+land.seal+'" tabindex="'+(r.stop===2?0:-1)+'"'):'')+'</div>';
      }).join('');
      root.innerHTML='<div class="range-top"><h1>'+land.name+'</h1>'+button('camp',icon('map')+'Range camp','range-link')+'</div><div class="range-field-layout"><div class="range-live sky-'+r.sky+'"><div class="range-viewport" tabindex="0" role="region" aria-label="Panoramic field. Swipe or use left and right arrows to move."><div class="range-world" style="--land:url('+art(land)+')">'+sections+'</div></div>'+weatherLayer()+(r.sky===2?'<div class="range-night" aria-hidden="true">☾</div>':'')+(entrance?'<div class="range-arrival"><small>Legendary migration</small><strong>'+land.event+'</strong></div>':'')+'<div class="range-location"><small>'+R.skies[r.sky]+'</small><b data-location>'+land.landmarks[r.stop]+'</b></div><div class="range-flash"></div></div>'+
      '<aside class="range-brief"><div class="range-tools" role="group" aria-label="Field tool">'+['camera','hunt'].map(key=>button('tool',icon(key==='hunt'?'cross':'camera')+(key==='hunt'?'Hunt':'Camera'),'','data-tool="'+key+'" aria-pressed="'+(key===r.tool)+'"')).join('')+'</div>'+
      (r.stage==='event'?'<div class="range-focus" '+(r.tool==='camera'?'':'hidden')+'><div><strong>'+(r.gilt?'Gold exposure saved':'Legend portrait')+'</strong><span data-focus-text></span></div><div class="range-track" aria-hidden="true"><i></i></div><small>'+(r.gilt?'The gold frame is yours.':'Tap the legend with Camera when the meter reads Gold.')+'</small></div>':'')+'<div class="range-order"><small>'+(r.stage==='event'?'Legendary migration':'Field assignment · '+inst.p.filter(Boolean).length+' / 3')+'</small><h2>'+inst.line+'</h2><p>'+inst.body+'</p>'+button('objective',icon('pin')+land.landmarks[inst.loc],'range-destination')+'</div><div class="range-tasks">'+(r.stage==='event'?[9,10].map(i=>'<span class="'+(r.photo.includes(i)?'checked':'')+'">'+(r.photo.includes(i)?'✓':'○')+' '+name(R.animal(r,i))+' photo</span>').join(''):inst.phrases.map((s,i)=>'<span class="'+(inst.p[i]?'checked':'')+'">'+(inst.p[i]?'✓':'○')+' '+s+'</span>').join(''))+'</div></aside></div>'+
      '<div class="range-waypoints" aria-label="Lookouts">'+stops+'</div><div class="range-announce" role="status" aria-live="polite">'+(notice||'Swipe the scene or choose a lookout.')+'</div>'+receipt(r);
      if(r.lastCatch)TrophyLodge.paint(root);
      const view=$('.range-viewport');view.scrollLeft=view.clientWidth*savedStop;
      root.querySelectorAll('.range-animal').forEach(el=>{const index=Number(el.dataset.i);sprite(el,R.animal(r,index),index%3,index>=9?2:Math.floor(index/3));});
      const version=renderKey;
      view.onscroll=()=>{clearTimeout(scrollTask);scrollTask=setTimeout(()=>{if(version===renderKey&&view.clientWidth)atStop(Math.min(2,Math.max(0,Math.round(view.scrollLeft/view.clientWidth))));},90);};
      view.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();travel(Math.max(0,Math.min(2,run().stop+(e.key==='ArrowLeft'?-1:1))));};
      if(entrance){$('.range-live').classList.add('arriving');entrance=false;}
      atStop(savedStop);tick(0,true);
    }
    function atStop(i){
      const r=run();if(!r||page!=='field')return;
      if(i!==r.stop)memo(v=>{v.stop=i;});
      $('.range-location b').textContent=a().landmarks[i];
      root.querySelectorAll('.range-stop').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.stop)===i)));
      root.querySelectorAll('.range-cell').forEach((cell,index)=>{cell.inert=index!==i;cell.querySelectorAll('button').forEach(el=>el.tabIndex=index===i?0:-1);});
    }
    function travel(i){
      const view=$('.range-viewport');if(!view)return;clearTimeout(scrollTask);view.scrollLeft=view.clientWidth*i;atStop(i);sound('move');tick(0,true);
    }
    function tell(text){notice=text;const status=$('.range-announce');if(status)status.textContent=text;}
    function tap(i,shot=false,afterReaction=false){
      let pre=run().stage;
      // Native panning can end immediately before a tap, ahead of the debounced scroll callback.
      const view=$('.range-viewport');if(view?.clientWidth)atStop(Math.min(2,Math.round(view.scrollLeft/view.clientWidth)));
      const r=run();
      if(r.tool==='hunt'&&!shot&&R.active(r).includes(i)&&!(i>=9&&i<=10&&!r.photo.includes(i))){
        resetPage('encounter');const t=R.animal(r,i);
        encounter=FieldEncounter.create({root,land:a(),t,sky:r.sky,stop:r.stop,reduced,sound,success:()=>tap(i,true,true),back:field});
        return;
      }
      const outcome=memo((current,rec)=>{
        if(shot&&current.tool!=='hunt')return null;
        const out=R.interact(rec,current,i,current.tool,displayFocus());
        if(out?.kind==='harvest')current.lastCatch={index:i,record:out.record.weightRecord,prior:out.record.previous?.kg??null};
        return out;
      });if(!outcome){field();return;}
      const t=outcome.t,n=name(t);
      if(outcome.kind==='already'){tell(i===11&&!run().gilt?'Try another portrait when the meter reads Gold.':n+' is already in your photo log.');return;}
      if(outcome.kind==='needPhoto'||outcome.kind==='companion'){tell('Switch to Camera to photograph '+n+' first.');return;}
      if(outcome.kind==='finish'){sound('win');if(afterReaction)return result;result();return;}
      const photo=outcome.kind==='photo'||outcome.kind==='exposure';sound(photo?'photo':'seal');
      notice=outcome.kind==='exposure'?'Gold exposure · '+n+' earned a gilded panorama':photo?'Photo logged · '+n:'Trophy collected · '+n+' · '+TrophyLodge.weight(t.kg)+(outcome.record.weightRecord?' · Personal weight record':'');
      if(pre==='roam'&&run().stage==='event'){sound('win');entrance=true;notice+=' · '+a().event+' has begun!';}
      function showReceipt(){field();$('.range-live')?.classList.add(photo?'taking-photo':'taking-trophy');
        if(!photo)$('.field-receipt')?.scrollIntoView({block:'nearest'});}
      if(afterReaction)return showReceipt;showReceipt();
    }
    function result(){
      resetPage('result');ambient('');const r=run(),land=a(),pic=R.scene(r),t=pic.cast[2],log=get().range.logs[selected];
      root.innerHTML='<div class="range-top"><h1>Crossing complete</h1>'+button('camp','Range camp','range-link')+'</div><div class="range-result"><div class="range-printmat"><canvas width="1440" height="720" role="img" aria-label="'+land.event+' panorama"></canvas></div><div class="range-reward"><small>'+RangePrints.title(pic)+' · '+R.size(pic)+' / 3 animals</small><h2>'+name(t)+'</h2><p>'+TrophyLodge.weight(t.kg)+' · '+TrophyLodge.length(t.cm)+' · '+t.medal+' medal</p><p>'+ (r.featured?'This panorama is framed in your trophy room.':'Your gallery favors a fuller crossing, then a gold exposure, then a heavier legend.')+'</p><div>'+button('mount',icon('room')+'Display trophy','primary')+galleryButton()+'<a class="range-download" hidden>Save picture</a></div></div></div><div class="range-result-foot"><span>'+log.clears+' crossing'+(log.clears===1?'':'s')+' · '+log.skies.length+' / 3 lights collected</span>'+button('camp','Choose another outing','range-link')+'</div>';
      RangePrints.attach($('canvas'),pic,$('.range-download'));window.scrollTo(0,0);
    }
    let shownFocus=0;
    function displayFocus(){return shownFocus;}
    function focusMeter(r){
      const panel=$('.range-focus');if(!panel)return;
      panel.hidden=r.tool!=='camera';if(panel.hidden)return;
      shownFocus=reduced?1:R.focusAt(clock);
      const active=shownFocus>=.69,tag=panel.querySelector('[data-focus-text]');
      const text=r.gilt?'✓':active?'Gold':'Focusing';
      if(tag.textContent!==text)tag.textContent=text;
      panel.classList.toggle('gold',active||r.gilt);panel.style.setProperty('--focus',(100*(r.gilt?1:shownFocus)).toFixed(1)+'%');
    }
    function tick(dt,force=false){
      if(page==='rush'||page==='trail'){rush?.tick(dt);return;}
      if(page==='encounter'){encounter?.render(dt);return;}
      clock+=dt;if(!force&&clock-lastCue<.083)return;lastCue=clock;
      const current=run();if(page==='field'&&current?.stage==='event')focusMeter(current);
      for(const b of sprites){
        if(page==='field'&&current&&b.cell!==current.stop&&!force)continue;
        const cycle=(reduced?0:clock)*b.pace+b.phase,step=Math.floor(cycle*4);
        if(!force&&b.lastFrame===step)continue;
        b.lastFrame=step;const {g,c,t,h}=b,drift=reduced?0:Math.sin(cycle*.29+b.sceneIndex)*(b.hero?7:19);
        const dir=b.hero?t.direction:(Math.cos(cycle*.29+b.sceneIndex)>=0?1:-1);
        b.layer.style.setProperty('--wander',drift.toFixed(2)+'%');
        g.clearRect(0,0,c.width,c.height);g.fillStyle='#131c1a55';g.beginPath();g.ellipse(c.width/2,c.height-8,TimberWildlife.bounds(t.species,h).width*.33,Math.max(2,h*.032),0,0,Math.PI*2);g.fill();
        TimberWildlife.draw(g,t.species,c.width/2,c.height-8,h,dir,cycle,TrophyLodge.palette(t));
      }
    }
    root.addEventListener('click',e=>{
      const b=e.target.closest('[data-range]');if(!b||b.disabled||!root.contains(b))return;
      const action=b.dataset.range;
      if(action==='range'){change(rec=>{rec.range.selected=b.dataset.id;});home();sound('move');}
      if(action==='sky'){sky=+b.dataset.sky;board();}
      if(action==='camp'){home();window.scrollTo(0,0);}
      if(action==='trail'){resetPage('trail');rush=TrophyTrail.create({root,land:a(),sky,get,change,hang,home,sound,ambient,reduced});window.scrollTo(0,0);}
      if(action==='rush')playRush();
      if(action==='start'||action==='explore')start(action==='start');
      if(action==='gallery')room();
      if(action==='lastMount'&&run()?.lastCatch)hang(R.animal(run(),run().lastCatch.index));
      if(action==='mount'&&run()?.stage==='done')hang(R.animal(run(),11));
      if(['pursuits','quick','expeditions'].includes(action))exit(action);
      if(action==='travel')travel(+b.dataset.stop);
      if(action==='objective')travel(instructions(run()).loc);
      if(action==='tool'){memo(r=>{r.tool=b.dataset.tool;});root.querySelectorAll('[data-tool]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.tool===run().tool)));if(run().stage==='event')focusMeter(run());sound('move');}
      if(action==='animal'){
        tap(+b.dataset.i);
        if(e.detail===0&&page==='field'&&!b.isConnected){
          const next=root.querySelector('[data-i="'+b.dataset.i+'"]')||root.querySelector('[data-tool][aria-pressed="true"]');
          next?.focus({preventScroll:true});
        }
      }
      if(action==='seal'){atStop(2);const ok=memo(r=>R.seal(r));if(ok){entrance=run().stage==='event';sound(entrance?'win':'seal');notice=run().stage==='event'?a().event+' has begun!':a().seal+' collected.';field();}}
    });
    function external(){if(root.hidden||page==='rush'||page==='trail')return;if(page==='board'){home();return;}if(!run()||run().token!==token){home();return;}if(run().stage==='done')result();else field();}
    function resize(){if(page==='field'&&!root.hidden&&$('.range-viewport')){const view=$('.range-viewport');view.scrollLeft=view.clientWidth*run().stop;}}
    return {home,tick,external,resize,pauseRush:()=>rush?.pause(),leave(){resetPage('away');ambient('');}};
  }
  return {create};
})();
