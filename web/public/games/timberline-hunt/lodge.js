'use strict';
const TrophyLodge=(()=>{
  const {wildlife,reserves,byKey,grades}=HuntRules;
  let unit='lb';
  try{unit=localStorage.getItem('timberline.units')==='kg'?'kg':'lb';}catch{}
  const number=(v,d=0)=>v.toLocaleString('en-US',{maximumFractionDigits:d});
  const weight=kg=>number(unit==='kg'?kg:kg*2.20462262,1)+' '+unit;
  const length=cm=>unit==='kg'?number(cm)+' cm':number(cm/2.54,1)+' in';
  const date=t=>new Date(t.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
  const name=t=>PursuitRules.signature(t)?.name||(t.coat==='legend'?byKey[t.reserve].legend:(t.coat==='ivory'?'Ivory ':'')+wildlife[t.species].name);
  const palette=t=>PursuitRules.signature(t)?.id||(t.coat==='legend'?'legend':t.coat==='ivory');
  const portrait=(t,w=210,h=98)=>'<canvas class="portrait" data-kind="'+t.species+'" data-coat="'+(t.coat||'common')+'" data-signature="'+(PursuitRules.signature(t)?.id||'')+'" width="'+w+'" height="'+h+'" aria-hidden="true"></canvas>';
  const medal=m=>'<span class="medal '+m.toLowerCase()+'"><i></i>'+m+'</span>';
  function paint(root){
    for(const c of root.querySelectorAll('canvas[data-kind]')){
      const render=()=>{
      const h=c.height-7,ratio=TimberWildlife.bounds(c.dataset.kind,1).width,s=Math.min(h,(c.width-12)/ratio);
      const x=c.getContext('2d');x.clearRect(0,0,c.width,c.height);
      TimberWildlife.draw(x,c.dataset.kind,c.width/2,c.height-3,s,1,1.1,c.dataset.signature||palette({coat:c.dataset.coat}));
      };render();
      if(!c.dataset.signature&&!window.TimberStride?.ratio(c.dataset.kind))window.TimberStride?.load(c.dataset.kind).then(s=>{if(s&&c.isConnected&&!c.dataset.fallPlay)render();});
    }
  }
  function create({get,show,change,track,canTrack,enterRoom}){
    let tab='Showcase',page='root',selected=null,filter='All',search='',from='Records',pickSlot=null,compare='heavy',replayBack=null;
    const root=document.getElementById('dialog-content');
    const button=(act,txt,cls='',extra='')=>'<button class="'+cls+'" data-act="'+act+'" '+extra+'>'+txt+'</button>';
    const action=(act,txt)=>button(act,txt,'lodge-action');
    const region=k=>reserves.filter(r=>r.species.includes(k)).map(r=>r.name).join(' · ');
    function header(title,sub){return '<p class="kicker">'+sub+'</p><h2>'+title+'</h2>';}
    function set(html,title){show(html,title);paint(root);root.closest('dialog').scrollTop=0;}
    function slots(rec){
      return '<div class="mounts">'+rec.mounts.map((t,i)=>{
        if(!t)return button('choose-slot','<span class="empty-cup">◇</span><b>Open mount</b><small>Choose a trophy</small>','mount empty','data-slot="'+i+'"');
        return button('open-mount','<div class="mount-scene" style="--land:url(assets/'+RangeRules.background(t)+'.webp)">'+portrait(t)+'</div><div class="brass-plaque"><b>'+name(t)+'</b><small>'+weight(t.kg)+' · '+t.medal+'</small><small>'+RangeRules.place(t)+' · '+date(t)+'</small></div>','mount','data-slot="'+i+'"');
      }).join('')+'</div>';
    }
    function specimenTile(t,i){return button('recent',portrait(t,140,60)+'<span><b>'+name(t)+'</b><small>'+weight(t.kg)+' · '+t.medal+'</small></span>','recent-row','data-i="'+i+'"');}
    function showcase(rec){
      return '<button class="room-door" data-act="enter-room"><span><b>Enter trophy room</b><small>'+TrophyRoom.slots(rec).filter(Boolean).length+' of 12 exhibits on display</small></span></button><div class="section-label"><h3>Your trophy wall</h3><span>'+rec.mounts.filter(Boolean).length+' / 3 mounted</span></div>'+slots(rec)+
        '<div class="section-label"><h3>Latest trophies</h3><span>'+rec.recent.length+' in log</span></div>'+
        (rec.recent.length?'<div class="recent-list">'+rec.recent.map(specimenTile).join('')+'</div>':'<p class="empty-state">Bag your first animal to earn a dated trophy. Tap an open mount to build your wall.</p>');
    }
    function bookEntries(rec){
      const list=Object.keys(wildlife).filter(k=>(filter==='All'||wildlife[k].group===filter||filter==='Big game'&&HuntRules.giantKeys.includes(k)||filter==='Logged'&&rec.bag[k]>0)&&(wildlife[k].name+' '+(HuntRules.aliases[k]||'')+' '+(wildlife[k].bearFamily||'')+' '+(wildlife[k].bearFamily?'bear':'')).toLowerCase().includes(search.toLowerCase().trim()));
      return list.length?list.map(k=>{
        const t=rec.book[k]?.heavy,summary=t?weight(t.kg)+' · '+t.medal:rec.bag[k]?'Prior hunts · weight unmeasured':'Awaiting first trophy';
        return button('species',portrait(t||{species:k},168,78)+'<span><b>'+wildlife[k].name+'</b><small>'+summary+'</small></span>','book-entry '+(t?'logged':''),'data-species="'+k+'"');
      }).join(''):'<p class="empty-state">No matching wildlife.</p>';
    }
    function recordBook(rec){
      return '<div class="book-tools"><label>Find a species<input type="search" id="species-search" placeholder="Search animals" autocomplete="off"></label><label>Show<select id="book-filter">'+['All','Logged','Bears','Big game','Safari','Woodland & tundra'].map(f=>'<option'+(filter===f?' selected':'')+'>'+f+'</option>').join('')+'</select></label></div><div class="book-grid" id="book-entries">'+bookEntries(rec)+'</div>'+
        '<details class="reserve-records"><summary>Hunt and reserve records</summary><div class="record"><span>Most animals in one hunt</span><strong>'+rec.bestBag+'</strong></div><div class="record"><span>Longest hit streak</span><strong>'+rec.bestStreak+'</strong></div>'+reserves.map(r=>'<div class="record"><span>'+r.name+'</span><strong>'+number(rec.bests[r.key])+' pts</strong></div>').join('')+'</details>';
    }
    function gifts(rec){
      return '<h3>Legendary gifts</h3><p class="lodge-note">Each reserve has a named legend. Bag it to keep its gift, then equip one for your next hunt.</p><div class="gifts">'+reserves.map(r=>{
        const owned=rec.gifts.includes(r.key),eq=rec.equipped===r.key;
        return '<div class="gift '+(owned?'owned':'')+'"><div><small>'+r.legend+' · '+r.name+'</small><b>'+r.gift+'</b><span>'+r.power+'</span></div>'+
          (owned?button('equip',eq?'Unequip':'Equip','lodge-action','data-key="'+r.key+'" aria-label="'+(eq?'Unequip ':'Equip ')+r.gift+'"'):'<span class="locked">Undiscovered</span>')+'</div>';
      }).join('')+'</div><h3>Collection badges</h3><div class="badge-grid">'+HuntRules.badges(rec).map(b=>'<div class="collection-badge '+(b.now===b.goal?'earned':'')+'"><b>'+b.name+'</b><span>'+b.detail+'</span><progress value="'+b.now+'" max="'+b.goal+'"></progress><small>'+b.now+' / '+b.goal+'</small></div>').join('')+'</div>';
    }
    function render(){
      const rec=get();page='root';
      set(header('Trophy lodge','Field collection')+'<div class="lodge-summary"><span><b>'+Object.keys(wildlife).filter(k=>rec.bag[k]>0).length+'</b> / '+Object.keys(wildlife).length+' wildlife logged</span><span><b>'+rec.gifts.length+'</b> / '+reserves.length+' legends</span>'+button('units',unit==='kg'?'kg / cm':'lb / in','unit-button','aria-label="Switch measurement units"')+'</div>'+
        '<div class="lodge-tabs" role="group" aria-label="Trophy lodge sections">'+['Showcase','Records','Photos','Expeditions','Gifts & badges'].map(k=>button('tab',k,'','data-tab="'+k+'" aria-pressed="'+(k===tab)+'"')).join('')+'</div>'+
        (tab==='Showcase'?showcase(rec):tab==='Records'?recordBook(rec):tab==='Photos'?FieldAlbum.gallery(rec):tab==='Expeditions'?'<h3>Expedition patches</h3>'+TimberTrails.shelf():gifts(rec)),'Trophy lodge');
      if(tab==='Records'){
        const field=document.getElementById('species-search');field.value=search;
        const refresh=()=>{const node=document.getElementById('book-entries');node.innerHTML=bookEntries(get());paint(node);};
        field.oninput=()=>{search=field.value;refresh();};document.getElementById('book-filter').onchange=e=>{filter=e.target.value;refresh();};
      }
    }
    function trophyCard(t){
      return '<div class="trophy-art" style="--land:url(assets/'+RangeRules.background(t)+'.webp)">'+medal(t.medal)+portrait(t,360,145)+'</div><div class="trophy-facts"><div><small>Weight</small><b>'+weight(t.kg)+'</b></div><div><small>Length</small><b>'+length(t.cm)+'</b></div></div><p class="place-date">'+RangeRules.place(t)+' · '+date(t)+'</p>';
    }
    function detail(k,t=null){
      page='detail';const rec=get(),entry=rec.book[k];selected=t||entry?.[compare]||null;
      const start=button('back','‹ '+from,'back-btn')+header(selected?name(selected):wildlife[k].name,PursuitRules.signature(selected)?'Wild pursuit · '+wildlife[k].name:selected?.coat==='legend'?'Named legend · '+wildlife[k].name:'Species record');
      let body='';
      if(selected){
        const t=selected,previous=compare==='long'?entry?.previousLong:entry?.previousHeavy,isRecord=entry?.[compare]?.id===t.id;
        body=trophyCard(t);
        if(entry?.heavy){body+='<div class="compare-tabs">'+button('heavy','Heaviest','', 'aria-pressed="'+(entry.heavy.id===t.id&&compare==='heavy')+'"')+button('long','Longest','', 'aria-pressed="'+(entry.long?.id===t.id&&compare==='long')+'"')+(entry.legend?button('legend','Legend','', 'aria-pressed="'+(entry.legend.id===t.id&&compare==='legend')+'"'):'')+'</div>';}
        if(previous&&isRecord&&compare!=='legend'){
          const isLength=compare==='long',prop=isLength?'cm':'kg',format=isLength?length:weight;
          const ratio=Math.max(.08,previous[prop]/t[prop])*100;
          body+='<div class="comparison"><b>'+(isLength?'Length':'Weight')+' record comparison</b><span>Previous <strong>'+format(previous[prop])+'</strong></span><i style="width:'+ratio+'%"></i><span>Record <strong>'+format(t[prop])+'</strong></span><i class="current"></i><small>Improved by '+format(t[prop]-previous[prop])+'</small></div>';
        }
        body+='<div class="lodge-actions">'+action('mount','Hang plaque')+action('replay','Replay sighting')+'</div>';
      }else body='<div class="undiscovered">'+portrait({species:k},250,100)+'<p>'+ (rec.bag[k]?'Your earlier hunt count is here. Your next '+wildlife[k].name.toLowerCase()+' starts its measured records.':'Your first '+wildlife[k].name.toLowerCase()+' earns this species a plaque.')+'</p></div>';
      body+='<div class="species-info">'+(wildlife[k].bearFamily?'<small>Bear species</small><p>'+wildlife[k].bearFamily+'</p>':'')+'<small>Reserves</small><p>'+region(k)+'</p><small>Lifetime tally</small><p>'+rec.bag[k]+' bagged'+(entry?' · '+grades.map(g=>entry.medals[g]+' '+g).join(' / '):'')+'</p></div>';
      if(canTrack())body+='<div class="lodge-actions">'+button('track','Track '+wildlife[k].name,'primary','data-species="'+k+'"')+'</div>';
      set(start+body,wildlife[k].name);root.dataset.species=k;
    }
    function mount(){
      const rec=get();page='mount';
      set(button('detail','‹ Trophy','back-btn')+header('Hang a plaque',name(selected))+'<p>Choose a mount. Replacing a plaque leaves its species records in the book.</p><div class="mount-choices">'+TrophyRoom.slots(rec).map((t,i)=>TrophyRoom.accepts(i,selected)?button('place','<small>'+TrophyRoom.slotName(i)+'</small><b>'+(t?name(t):'Open display')+'</b>','lodge-action','data-slot="'+i+'"'):'').join('')+'</div>','Hang a plaque');
    }
    function candidates(i){
      pickSlot=i;page='choose';const rec=get(),map=new Map();
      for(const t of [...rec.recent,...Object.values(rec.book).flatMap(e=>[e.heavy,e.long,e.legend])])if(t)map.set(t.id,t);
      const list=[...map.values()];set(button('showcase','‹ Showcase','back-btn')+header('Choose a trophy','Mount '+(i+1))+
        (list.length?'<div class="recent-list">'+list.map((t,n)=>button('pick',portrait(t,130,58)+'<span><b>'+name(t)+'</b><small>'+weight(t.kg)+' · '+t.medal+'</small></span>','recent-row','data-i="'+n+'"')).join('')+'</div>':'<p>Bag an animal, then choose its plaque here.</p>'),'Choose a trophy');
      root.querySelectorAll('[data-act="pick"]').forEach(b=>b.onclick=()=>place(list[+b.dataset.i],pickSlot));
    }
    function place(t,i){change(rec=>TrophyRoom.place(rec,t,i));tab='Showcase';render();}
    function replayFall(){
      root.querySelector('.replay-scene').classList.add('replay-landing');
      TrophyReaction.replay(root.querySelector('.replay-beast canvas'),selected);
    }
    function replay(t,back,fall=false){
      selected=t;page='replay';replayBack=back;LandingArt.warm(t.species);
      set(header('Trophy replay',t.coat==='legend'?'Legend sighting':RangeRules.place(t))+'<div class="replay-scene" style="--land:url(assets/'+RangeRules.background(t)+'.webp)"><div class="replay-beast">'+portrait(t,365,145)+'</div><div class="replay-caption">'+medal(t.medal)+'<b>'+name(t)+'</b><small>'+weight(t.kg)+' · '+length(t.cm)+'</small></div></div><p class="place-date">'+RangeRules.place(t)+' · '+date(t)+'</p><div class="lodge-actions">'+action('fall','Replay fall')+action('repeat','Replay sighting')+action('back-replay','Done')+'</div>','Trophy replay');
      if(fall){replayFall();return;}
      const c=root.querySelector('.replay-beast canvas');
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        const start=performance.now(),g=c.getContext('2d'),h=Math.min(c.height-7,(c.width-12)/TimberWildlife.bounds(t.species,1).width);
        function step(now){
          if(!c.isConnected||c.dataset.fallPlay||!c.closest('dialog')?.open)return;
          const elapsed=(now-start)/1000;g.clearRect(0,0,c.width,c.height);
          TimberWildlife.draw(g,t.species,c.width/2,c.height-3,h,-1,Math.min(elapsed,3.3)*4,palette(t));
          if(elapsed<5)requestAnimationFrame(step);
        }requestAnimationFrame(step);
      }
    }
    root.addEventListener('click',e=>{
      const b=e.target.closest('button[data-act]');if(!b)return;
      const a=b.dataset.act,rec=get();
      if(a==='enter-room'){enterRoom();return;}
      if(a==='tab'){tab=b.dataset.tab;render();}
      if(a==='back'||a==='showcase'){tab=a==='showcase'?'Showcase':from;render();}
      if(a==='photo'&&rec.photos[b.dataset.species]){
        const t=rec.photos[b.dataset.species];from='Photos';page='photo';
        set(button('back','‹ Photos','back-btn')+header(name(t),'Field postcard')+'<div class="postcard-holder">Developing postcard…</div><div class="lodge-actions"><a class="lodge-action download-postcard" hidden>Save postcard PNG</a></div>','Field postcard');FieldAlbum.open(root,t);
      }
      if(a==='species'){from='Records';compare='heavy';detail(b.dataset.species);}
      if(a==='recent'||a==='open-mount'){const t=a==='recent'?rec.recent[+b.dataset.i]:rec.mounts[+b.dataset.slot];if(t){from='Showcase';compare='heavy';detail(t.species,t);}}
      if(['heavy','long','legend'].includes(a)){compare=a;detail(root.dataset.species);}
      if(a==='units'){unit=unit==='kg'?'lb':'kg';try{localStorage.setItem('timberline.units',unit);}catch{}render();}
      if(a==='equip'){change(r=>{if(r.gifts.includes(b.dataset.key))r.equipped=r.equipped===b.dataset.key?null:b.dataset.key;});render();}
      if(a==='track'&&canTrack())track(b.dataset.species);
      if(a==='choose-slot')candidates(+b.dataset.slot);
      if(a==='mount')mount();
      if(a==='place'){const i=+b.dataset.slot;change(r=>TrophyRoom.place(r,selected,i));enterRoom(i);}
      if(a==='detail'&&selected)detail(selected.species,selected);
      if(a==='replay'&&selected)replay(selected,()=>detail(selected.species,selected));
      if(a==='fall')replayFall();
      if(a==='repeat')replay(selected,replayBack);
      if(a==='back-replay')replayBack?.();
    });
    return {
      open(t='Showcase'){tab=t;render();},
      hang(t){selected=t;from='Records';compare='heavy';mount();},
      record(t){from='Records';compare='heavy';detail(t.species,t);},
      replay,
      back(){
        if(page==='root')return false;
        if(page==='replay'){replayBack?.();return true;}
        if(page==='mount'){detail(selected.species,selected);return true;}
        tab=page==='choose'?'Showcase':from;render();return true;
      }
    };
  }
  return {create,weight,length,name,portrait,medal,paint,palette};
})();
