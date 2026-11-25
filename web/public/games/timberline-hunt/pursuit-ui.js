'use strict';
const WildPursuits=(()=>{
  const P=PursuitRules;
  const glyphs={Sun:'☀',Peak:'▲',Flame:'♨',Star:'✦',Bolt:'ϟ',Wave:'≋'};
  const b=(act,text,cls='',attr='')=>'<button type="button" class="'+cls+'" data-pact="'+act+'" '+attr+'>'+text+'</button>';
  const icon=id=>'<svg aria-hidden="true"><use href="#i-'+id+'"/></svg>';
  const coord=(pos,n)=>String.fromCharCode(65+pos%n)+(1+Math.floor(pos/n));
  const cover=q=>'assets/pursuits/'+q.id+'.webp';
  const fmt=n=>n.toLocaleString('en-US');
  const shotWindows={trail:[.20,.82],master:[.37,.65]};
  function create({root,get,change,sound,ambient,exitTo,hang,plaque,album}){
    let selected=P.quarry[0].id,level='trail',page='board',seen=null,notice='',running=false,carry=0;
    let actors=[],elapsedPaint=0,gateLabel='',delay=0,latestPose=null;
    const find=s=>root.querySelector(s), q=()=>P.byId[selected];
    const lookup=rec=>rec.pursuits.runs[P.key(selected,level)],current=()=>lookup(get());
    function sync(){const r=current();seen=r?{token:r.token,rev:r.rev}:null;}
    function edit(fn){
      let applied=false;
      change(rec=>{
        const r=lookup(rec);
        if(r&&r.token===seen?.token&&r.rev===seen.rev&&fn(r,rec)!==false){r.rev++;applied=true;}
      });
      sync();if(!applied){notice='The hunt changed. Your latest checkpoint is open.';}return applied;
    }
    function music(on){ambient(on?q().terrain:null);}
    function stopClock(save=true){
      if(running&&save&&carry>0){const ms=carry;carry=0;edit(r=>P.spend(r,ms));}
      running=false;carry=0;actors=[];music(false);
    }
    function paint(html){root.innerHTML=html;}
    function focusTitle(){root.querySelector('[data-focus]')?.focus({preventScroll:true});}
    function switchLevel(id){
      const saved=get().pursuits;
      const active=['master','trail'].find(l=>{const r=saved.runs[P.key(id,l)];return r&&r.state!=='done';});
      return active||'trail';
    }
    function home(){
      stopClock();page='board';selected=get().pursuits.selected;level=switchLevel(selected);sync();renderBoard();
    }
    function gearLocker(book){
      const keys=P.quarry.filter(a=>book.ledger[a.id].clears);
      if(!keys.length)return '';
      const equipped=book.gear?P.gear[book.gear].name:'None';
      return '<details class="pq-locker"><summary>Field gear · '+equipped+'</summary><p>Equip one item for your next new pursuit.</p><div>'+
        keys.map(a=>b('equip','<b>'+P.gear[a.id].name+'</b><small>'+P.gear[a.id].power+'</small>','pq-kit','data-id="'+a.id+'" aria-pressed="'+(book.gear===a.id)+'"')).join('')+'</div></details>';
    }
    function renderBoard(){
      page='board';const animal=q(),rec=get().pursuits,item=rec.ledger[selected],r=current(),master=item.clears>0;
      const ongoing=r&&r.state!=='done';
      const sub=''+HuntRules.wildlife[animal.species].name+' · '+HuntRules.byKey[animal.reserve].name;
      const cards=P.quarry.map(a=>{
        const record=rec.ledger[a.id],active=['trail','master'].some(l=>{const r=rec.runs[P.key(a.id,l)];return r&&r.state!=='done';});
        return b('select','<span class="pq-photo" style="background-image:url('+cover(a)+')"></span><span class="pq-card-copy"><b>'+a.name+'</b><small>'+HuntRules.wildlife[a.species].name+'</small><em>'+(record.clears?'★ '+fmt(record.best)+' pts':active?'Trail in progress':'Open dossier')+'</em></span>','pq-card','data-id="'+a.id+'" aria-pressed="'+(a.id===selected)+'"');
      }).join('');
      const modes='<div class="pq-game-modes" aria-label="Other game modes">'+b('range','Open range','text-btn')+b('expeditions',icon('map')+'Expeditions','text-btn')+b('quick',icon('cross')+'Quick hunt','text-btn')+'</div>';
      paint('<div class="pq-board"><div class="pq-boardline"><h1>Wild pursuits</h1>'+modes+'</div><div class="pq-hero" style="--picture:url('+cover(animal)+');--glow:'+animal.tint+'"><div class="pq-hero-copy"><small class="pq-eyebrow">'+sub+'</small><h2>'+animal.name+'</h2><p>'+animal.description+'</p>'+
        '<div class="pq-hero-actions">'+b('start',icon(ongoing?'pin':'play')+(ongoing?'Resume pursuit':r?.state==='done'?'Hunt again':'Start pursuit'),'primary')+
        (master?b('level',level==='master'?'Master trail':'Explorer trail','pq-level','aria-label="Switch pursuit difficulty"'):'')+'</div></div>'+
        '<div class="pq-sign medallion" aria-label="'+animal.sign+' seal">'+glyphs[animal.sign]+'</div><div class="pq-hero-foot"><span>'+animal.weather+'</span><span>'+(item.clears?fmt(item.best)+' pts · '+item.stars+'/3 stars':'Field seal · '+animal.sign)+'</span></div></div>'+
        '<div class="pq-section-head"><h2>Quarry dossiers</h2><span>'+P.logged(rec)+' / 6 logged</span></div><div class="pq-cards">'+cards+'</div>'+
        (item.clears?'<div class="pq-ledger"><b>'+animal.name+' records</b><span>'+item.clears+' completed</span><span>'+item.master+' Master clears</span><span>Explorer best '+fmt(item.scores.trail)+'</span><span>Master best '+fmt(item.scores.master)+'</span>'+(item.heaviest?'<span>Heaviest '+TrophyLodge.weight(item.heaviest.kg)+'</span>'+b('record','View record','lodge-action'):'')+'</div>':'')+gearLocker(rec)+'<div class="pq-crest-case '+(P.logged(rec)===6?'earned':'')+'"><img loading="lazy" src="assets/pursuits/trailmaster.webp" alt=""><div><b>Trailmaster crest</b><small>'+(P.logged(rec)===6?'Awarded · On display in your Great Hall':'Complete all six pursuits to hang the crest in your Great Hall.')+'</small></div></div></div>');
    }
    function start(){
      const animal=q();
      change(rec=>{
        const book=rec.pursuits,k=P.key(selected,level),prior=book.runs[k];
        if(level==='master'&&!book.ledger[selected].clears)return;
        if(!prior||prior.state==='done')book.runs[k]=P.begin(selected,level,Math.floor(Math.random()*4294967296),book.gear);
        book.selected=animal.id;
      });
      sync();notice='';resumeView();focusTitle();window.scrollTo(0,0);
    }
    function head(label){
      return '<div class="pq-fieldhead">'+b('home',icon('map')+'Hunt board','text-btn')+'<span>'+label+' · '+(level==='master'?'Master':'Explorer')+'</span></div>';
    }
    function renderMap(){
      page='map';const animal=q(),r=current(),board=P.board(r),t=P.trail(r),goal=board.seals[t.seals]??board.exit;
      const glyph=glyphs[animal.sign],order=board.seals.indexOf(t.pos);
      let message=notice;
      if(!message&&order>=0&&t.seals>order)message='Seal found at '+animal.places[order]+'.';
      if(t.remaining===0)message='Out of supplies. Undo a move to try another route.';
      let cells='';
      for(let i=0;i<board.n*board.n;i++){
        const seal=board.seals.indexOf(i),wall=board.walls.includes(i),cache=board.caches.includes(i),found=t.found.includes(i);
        const current=t.pos===i,goalCell=i===goal,exit=i===board.exit;
        const nearby=P.near(t.pos,board.n).includes(i)&&!wall;
        const mark=wall?'×':current?'◆':seal>=0?(seal<t.seals?'✓':glyph):exit?'⚑':cache?(found?'·':'+'):'·';
        const label=wall?'closed':seal>=0?animal.places[seal]+(seal<t.seals?', collected':', seal '+(seal+1)):exit?'lookout':cache?'supply cache':i===board.start?'camp':'open';
        cells+=b('step','<strong>'+mark+'</strong><small>'+coord(i,board.n)+'</small>','pq-cell '+[current?'here':'',goalCell?'goal':'',wall?'blocked':'',nearby?'next':'',r.path.includes(i)||i===board.start?'visited':'',cache&&!found?'cache':'',seal>=0?'seal':''].join(' '),'data-pos="'+i+'" aria-label="'+coord(i,board.n)+', '+label+(current?', you are here':'')+'" '+(!nearby||!t.remaining?'disabled':''));
      }
      const route=animal.places.map((p,i)=>'<li class="'+(i<t.seals?'passed':i===t.seals?'active':'')+'"><b>'+(i<t.seals?'✓':i+1)+'</b>'+p+' <small>'+coord(board.seals[i],board.n)+'</small></li>').join('');
      paint('<div class="pq-play">'+head('Trail map')+'<div class="pq-maplayout"><div class="pq-map-main"><div class="pq-title"><span>'+HuntRules.byKey[animal.reserve].name+'</span><h2 data-focus tabindex="-1">'+animal.name+'</h2></div><div class="pq-map" style="--terrain:url(assets/pursuits/map-'+animal.terrain+'.webp);--n:'+board.n+'">'+cells+'</div><div class="pq-mapkey"><span>◆ You</span><span>'+glyph+' Seal</span><span>+ Supplies</span><span>⚑ Lookout</span></div></div>'+
        '<aside class="pq-notes"><h3>'+(t.seals<3?'Reach '+animal.places[t.seals]:'Reach the lookout')+'</h3><p>Move one square up, down, left, or right. Collect the three seals in order, then reach the flag.</p><div class="pq-stats"><div><small>Supplies</small><b>'+t.remaining+'</b></div><div><small>Seals</small><b>'+t.seals+' / 3</b></div><div><small>Moves</small><b>'+r.path.length+'</b></div></div>'+
        '<ol class="pq-itinerary">'+route+'<li class="'+(t.seals===3?'active':'')+'"><b>⚑</b>Lookout <small>'+coord(board.exit,board.n)+'</small></li></ol><p class="pq-tip">A supply cache gives you '+(r.gear==='red-comet'?'four':'two')+' extra moves.</p>'+
        (r.gear==='cinderback'?b('hint','Cinder Lantern · '+(2-(r.lights||0))+((r.lights||0)===1?' use':' uses'),'lodge-action',(r.lights||0)>=2?'disabled':''):'')+b('undo','Undo last move','lodge-action',r.path.length?'':'disabled')+'<div class="pq-notice" role="status">'+message+'</div></aside></div></div>');
    }
    function renderReady(){
      page='ready';const a=q(),r=current(),escaped=r.state==='escaped',paused=['field','tagged'].includes(r.state);
      paint('<div class="pq-play">'+head('Lookout')+'<div class="pq-ready" style="--picture:url('+cover(a)+')"><div><small class="pq-eyebrow">'+HuntRules.byKey[a.reserve].name+'</small><h2 data-focus tabindex="-1">'+(escaped?'The trail went quiet':paused?'Lookout paused':'At the lookout')+'</h2><p>'+(escaped?a.name+' slipped out of the clearing. Your map is saved.':r.state==='tagged'?a.name+' is tagged. Tap the animal when the timing band lights up.':'Find the '+a.sign.toLowerCase()+' mark above '+a.name+'. Tap the marked animal to photograph it, then time your shot.')+'</p>'+
        b('enter',icon('play')+(escaped?'Retry encounter':paused?'Resume encounter':'Enter clearing'),'primary')+'<span class="pq-time-note">'+(escaped?Math.round(P.limit(r)/1000):Math.ceil((P.limit(r)-r.fieldMs)/1000))+' seconds · '+(level==='master'?4:3)+' animals</span></div></div></div>');
    }
    function resumeView(){
      const r=current();if(!r){home();return;}
      if(r.state==='map')renderMap();else if(r.state==='done')result();else renderReady();
    }
    function advanceStep(to){
      const before=P.trail(current());notice='';
      if(!edit(r=>P.move(r,to))){resumeView();return;}
      const r=current(),after=P.trail(r);
      if(after.seals>before.seals){sound('seal');notice='Seal '+after.seals+' found.';}
      else if(after.found.length>before.found.length){sound('cache');notice='Supply cache opened. '+(r.gear==='red-comet'?'Four':'Two')+' moves restored.';}else sound('move');
      resumeView();
      if(page==='map')find('.pq-cell.next:not(:disabled)')?.focus({preventScroll:true});
      else focusTitle();
    }
    function fieldAction(type){
      const spent=carry;carry=0;
      const success=edit((r,rec)=>{
        if(!['field','tagged'].includes(r.state))return false;
        P.spend(r,spent);if(r.state==='escaped')return true;
        if(type==='miss')return P.miss(r);
        if(type==='tag'){if(!P.tag(r))return false;r.pose=latestPose;r.photoKept=FieldAlbum.keep(rec,P.photo(r));return true;}
        return P.finish(rec,r);
      });
      if(!success||['done','escaped'].includes(current()?.state)){stopClock(false);resumeView();focusTitle();return false;}
      return true;
    }
    function attempt(i){
      if(!running||delay>0)return;
      const r=current(),u=actors[i];if(!r||!u)return;
      if(!u.marked){if(fieldAction('miss')){sound('wrong');say('Different animal. Look for the '+q().sign.toLowerCase()+' mark.');delay=330;}return;}
      if(r.state==='field'){if(fieldAction('tag')){sound('photo');say(current().photoKept?'Field photo saved. Watch for the gold timing band.':'Animal tagged. Your album holds a higher-ranked photo.');delay=800;updateField(true);}return;}
      if(r.state==='tagged'){
        if(![0,-75,60].some(offset=>gate(r,r.fieldMs+carry+offset).open)){if(fieldAction('miss')){sound('wrong');say('Early or late. Tap when the marker is inside the gold band.');delay=360;}return;}
        sound('win');fieldAction('bag');
      }
    }
    function band(r){const [lo,hi]=shotWindows[r.level];return r.gear==='blue-hour'?[lo-.095,hi+.095]:[lo,hi];}
    function gate(r,ms){
      const [low,high]=band(r),length=r.level==='master'?2350:2500;
      const wave=((ms%length)+length)%length/length;
      return {wave,open:wave>=low&&wave<=high};
    }
    function say(msg){notice=msg;const el=find('.pq-live');if(el)el.textContent=msg;}
    function enter(){
      if(!edit(r=>{
        if(r.state==='escaped')P.retry(r);
        if(r.state==='ready')r.state='field';
        return ['field','tagged'].includes(r.state);
      })){resumeView();return;}
      const r=current(),a=q(),n=level==='master'?4:3;
      const species=HuntRules.byKey[a.reserve].species.filter(k=>k!==a.species),at=(r.seed>>>2)%n;
      const otherSigns=Object.keys(glyphs).filter(k=>k!==a.sign);let decoy=0;
      const group=Array.from({length:n},(_,i)=>{
        const marked=i===at,j=marked?0:decoy++;
        const speciesId=marked||j===0?a.species:species[(r.seed%species.length+j-1)%species.length];
        return {marked,k:speciesId,sign:marked?a.sign:otherSigns[(r.seed%otherSigns.length+j)%otherSigns.length],i};
      });
      page='field';paint('<div class="pq-play">'+head('Wild encounter')+'<div class="pq-encounter pq-weather-'+a.terrain+'" style="--land:url(assets/'+a.reserve+'.webp);--glow:'+a.tint+'"><div class="pq-fieldsky"></div><div class="pq-topmeters"><span><small>Lookout</small><b>'+a.name+'</b></span><span><small>Time</small><b class="pq-time"></b></span>'+b('pause',icon('pause'),'dark-btn','aria-label="Pause pursuit"')+'</div><div class="pq-objective"></div><div class="pq-animals">'+group.map(u=>b('animal','<span class="pq-marker">'+glyphs[u.sign]+'</span><canvas width="240" height="130" aria-hidden="true"></canvas>','pq-animal','data-animal="'+u.i+'" aria-label="'+u.sign+' mark, '+HuntRules.wildlife[u.k].name+'"')).join('')+'</div></div>'+
        '<div class="pq-controls"><div class="pq-gauge" hidden><b class="pq-gate-label"></b><div class="pq-meter"><i></i><em></em></div></div><span class="pq-live" role="status"></span></div></div>');
      actors=group.map(u=>{const el=find('[data-animal="'+u.i+'"]'),canvas=el.querySelector('canvas');return {...u,el,canvas,ctx:canvas.getContext('2d'),lastFrame:-1};});
      elapsedPaint=0;delay=0;gateLabel='';carry=0;running=true;notice='';music(true);sound('start');
      updateField(true);positionActors(r.fieldMs);window.scrollTo(0,0);
    }
    function updateField(force=false){
      const r=current(),ms=r.fieldMs+carry,isTagged=r.state==='tagged',a=q();
      find('.pq-time').textContent=Math.max(0,Math.ceil((P.limit(r)-ms)/1000))+'s';
      if(force){
        find('.pq-objective').textContent=isTagged?'Hunt · Tap '+a.name+' in the gold band':'Camera · Photograph the '+a.sign.toLowerCase()+' mark '+glyphs[a.sign];
        find('.pq-gauge').hidden=!isTagged;
        find('.pq-encounter').classList.toggle('tagged',isTagged);
        const [low,high]=band(r);find('.pq-meter').style.setProperty('--start',low*100+'%');find('.pq-meter').style.setProperty('--size',(high-low)*100+'%');
      }
      if(isTagged){
        const g=gate(r,ms);g.open=g.open&&delay<=0;const label=g.open?'Shoot now':'Wait for gold';
        find('.pq-meter em').style.left=g.wave*100+'%';
        if(label!==gateLabel||force){gateLabel=label;find('.pq-gate-label').textContent=label;find('.pq-gauge').classList.toggle('open',g.open);}
      }
    }
    const motion={amble:[.46,.04],roam:[.72,.12],dash:[1.13,.17],glide:[.52,.05],zigzag:[1.32,.21],tide:[.63,.11]};
    function positionActors(ms){
      const r=current(),a=q(),t=ms/1000,amount=actors.length,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      for(const u of actors){
        const phase=(r.seed%401)/77+u.i*2.12,pace=(u.marked?motion[a.motion][0]:.6+u.i*.14)*(level==='master'?1.24:1);
        const v=t*pace+phase,base=amount===4?[21,69,28,76][u.i]:[22,72,47][u.i],amp=reduce?4:(u.marked?14:12);
        const x=base+Math.sin(v)*amp,y=(amount===4?[48,52,78,82][u.i]:[53,61,84][u.i])+Math.sin(v*.66)*(reduce?1:3);
        u.el.style.left=x+'%';u.el.style.top=y+'%';u.el.style.zIndex=String(Math.floor(y));const dir=Math.cos(v)<0?-1:1;
        const step=Math.floor(t*(reduce?2:7))+u.i,frame=step*dir;
        if(u.lastFrame!==frame){u.lastFrame=frame;const h=Math.min(124,228/TimberWildlife.bounds(u.k,1).width);u.ctx.clearRect(0,0,240,130);TimberWildlife.draw(u.ctx,u.k,120,127,h,dir,step*.55,u.marked?a.id:false);}
        if(u.marked)latestPose={x:x/100,phase:step*.55,direction:dir};
      }
    }
    function tick(dt){
      if(!running||document.hidden)return;
      const ms=dt*1000;carry+=ms;elapsedPaint+=ms;delay=Math.max(0,delay-ms);
      if(carry>=3000||current().fieldMs+carry>=P.limit(current())){
        const spent=carry;carry=0;
        if(!edit(r=>P.spend(r,spent))||current().state==='escaped'){stopClock(false);resumeView();return;}
      }
      if(elapsedPaint>=34){elapsedPaint=0;updateField();positionActors(current().fieldMs+carry);}
    }
    function pause(){
      if(!running)return;
      stopClock();resumeView();
    }
    function result(){
      page='result';const r=current(),a=q(),t=r.trophy,v=r.result,record=get().pursuits.ledger[selected];
      paint('<div class="pq-play">'+head('Pursuit complete')+'<div class="pq-result" style="--picture:url('+cover(a)+');--glow:'+a.tint+'"><div class="pq-resultcard"><small class="pq-eyebrow">'+(r.newBest?'Personal best':'Pursuit complete')+'</small><h2 data-focus tabindex="-1">'+a.name+'</h2><p>'+HuntRules.wildlife[t.species].name+' · '+t.medal+' medal</p><div class="pq-stars" aria-label="'+v.stars+' of 3 stars">'+'★'.repeat(v.stars)+'☆'.repeat(3-v.stars)+'</div><div class="pq-stats"><div><small>Score</small><b>'+fmt(v.score)+'</b></div><div><small>Weight</small><b>'+TrophyLodge.weight(t.kg)+'</b></div><div><small>Length</small><b>'+TrophyLodge.length(t.cm)+'</b></div></div>'+
        '<ul class="pq-recap"><li>✓ Named trophy collected</li><li>'+(v.efficient?'✓':'○')+' Finish within two moves of the shortest route</li><li>'+(v.clean?'✓':'○')+' Clear the encounter without a mistake or retry</li></ul><div class="pq-result-actions">'+b('hang','Display trophy','primary')+b('plaque','View plaque','lodge-action')+b('photos','Field photos','lodge-action')+'</div></div></div>'+(r.firstClear?'<div class="pq-prize"><b>Gear unlocked · '+P.gear[a.id].name+'</b><span>'+P.gear[a.id].power+'</span></div>':'')+(r.crestUnlocked?'<div class="pq-crest-case earned"><img src="assets/pursuits/trailmaster.webp" alt=""><div><b>Trailmaster crest earned</b><small>All six named trophies logged. Your crest now hangs in the Great Hall.</small></div></div>':'')+'<div class="pq-resultfoot"><span>'+ (level==='trail'&&record.clears===1?'Master trail unlocked':'Best '+fmt(record.best)+' pts')+'</span>'+b('home','Back to dossiers','text-btn')+'</div></div>');
    }
    root.addEventListener('click',e=>{
      const el=e.target.closest('[data-pact]');if(!el||el.disabled||!root.contains(el))return;
      const act=el.dataset.pact;
      if(act==='select'){selected=el.dataset.id;change(rec=>{rec.pursuits.selected=selected;});level=switchLevel(selected);sync();sound('move');renderBoard();root.querySelector('.pq-hero')?.scrollIntoView({block:'nearest'});}
      if(act==='equip'){const id=el.dataset.id;change(rec=>{if(rec.pursuits.ledger[id]?.clears)rec.pursuits.gear=rec.pursuits.gear===id?null:id;});renderBoard();find('.pq-locker').open=true;return;}
      if(act==='hint'){let next=null;if(edit(r=>{next=P.hint(r);return next!==null;})){notice='Lantern · Move to '+coord(next,P.board(current()).n)+'.';}renderMap();return;}
      if(act==='level'){level=level==='master'?'trail':'master';sync();renderBoard();}
      if(act==='start')start();
      if(act==='home'){home();window.scrollTo(0,0);}
      if(act==='expeditions'||act==='quick'||act==='range'){stopClock();exitTo(act);}
      if(act==='step')advanceStep(+el.dataset.pos);
      if(act==='undo'){if(edit(P.undo)){notice='Last move undone.';}resumeView();}
      if(act==='enter')enter();
      if(act==='animal')attempt(+el.dataset.animal);
      if(act==='pause')pause();
      if(act==='hang'&&current()?.trophy)hang(current().trophy);
      if(act==='plaque'&&current()?.trophy)plaque(current().trophy);
      if(act==='photos')album();
      if(act==='record'){const trophy=get().pursuits.ledger[selected].heaviest;if(trophy)plaque(trophy);}
    });
    root.addEventListener('keydown',e=>{
      if(page==='field'&&e.key==='Escape'){e.preventDefault();pause();return;}
      if(page!=='map'||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
      e.preventDefault();const r=current(),t=P.trail(r),bb=P.board(r),to=t.pos+({ArrowUp:-bb.n,ArrowDown:bb.n,ArrowLeft:-1,ArrowRight:1}[e.key]);
      if(P.near(t.pos,bb.n).includes(to)&&!bb.walls.includes(to)&&t.remaining)advanceStep(to);
    });
    return {home,pause,tick,leave:()=>stopClock(),isRunning:()=>running,external(){
      if(root.hidden)return;if(running)stopClock(false);sync();if(page==='board')renderBoard();else resumeView();
    }};
  }
  return {create};
})();
