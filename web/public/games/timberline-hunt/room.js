'use strict';
const TrophyRoom = (() => {
  const halls = [
    {name:'Great Hall', art:'hall', color:'#dfb775', accepts:()=>true, subject:'any animal', track:'elephant'},
    {name:'Bear Den', art:'bears', color:'#bbd4a0', accepts:t=>!!HuntRules.wildlife[t.species].bearFamily, subject:'a bear', track:'grizzly'},
    {name:'Safari Gallery', art:'safari', color:'#f1b56b', accepts:t=>HuntRules.wildlife[t.species].group==='Safari', subject:'African wildlife', track:'elephant'},
    {name:'Hall of Legends', art:'legends', color:'#d2c1ea', accepts:t=>t.coat==='legend'||!!PursuitRules.signature(t), subject:'a named legend', track:'polar'}
  ];
  const slots = rec => [...rec.mounts,...rec.galleryMounts];
  const slotName = index => halls[Math.floor(index/3)].name+' · Display '+(index%3+1);
  function inventory(rec){
    const byId=new Map();
    const entries=Object.values(rec.book).flatMap(e=>[e.heavy,e.long,e.legend,e.previousHeavy,e.previousLong]);
    for(const t of [...slots(rec),...rec.cabinet,...rec.recent,...entries])if(t)byId.set(t.id,t);
    return [...byId.values()].sort((a,b)=>priority(b)-priority(a)||b.date-a.date||b.kg-a.kg);
  }
  function priority(t){return (t.coat==='legend'||PursuitRules.signature(t)?8:t.coat==='ivory'?4:0)+HuntRules.grades.indexOf(t.medal);}
  function remember(rec,t){if(t&&!rec.cabinet.some(p=>p.id===t.id))rec.cabinet.push(t);}
  function put(rec,index,t){if(index<3)rec.mounts[index]=t;else rec.galleryMounts[index-3]=t;}
  function place(rec,t,index){
    if(!Number.isInteger(index)||index<0||index>=12||!t||!halls[Math.floor(index/3)].accepts(t))return false;
    const all=slots(rec);
    remember(rec,all[index]);remember(rec,t);
    all.forEach((v,i)=>{if(v?.id===t.id)put(rec,i,null);});
    put(rec,index,t);return true;
  }
  function unmount(rec,index,id){
    const t=slots(rec)[index];
    if(!t||t.id!==id)return false;
    remember(rec,t);put(rec,index,null);return true;
  }
  function curate(rec,hall){
    const all=slots(rec),taken=new Set(all.filter(Boolean).map(t=>t.id));
    const row=all.slice(hall*3,hall*3+3);
    const seen=new Set(row.filter(Boolean).map(t=>t.species));
    const list=inventory(rec).filter(t=>!taken.has(t.id)&&halls[hall].accepts(t));
    let count=0;
    for(let i=0;i<3&&list.length;i++){
      if(row[i])continue;
      const preferred=list.findIndex(t=>!seen.has(t.species));
      const [t]=list.splice(Math.max(0,preferred),1);seen.add(t.species);
      if(place(rec,t,hall*3+i))count++;
    }
    return count;
  }
  function create({root,show,get,change,replay,leave,lodge,hunt,canHunt}){
    let index=0,page='floor',shownId=null,choices=[],origin='game',message='';
    let scrollToken=0;
    const hallIndex=()=>Math.floor(index/3);
    const btn=(action,label,cls='',attrs='')=>'<button type="button" class="'+cls+'" data-room="'+action+'" '+attrs+'>'+label+'</button>';
    const find=s=>root.querySelector(s);
    const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
    function plate(t){
      const items=[];
      if(t.coat==='legend'||PursuitRules.signature(t))items.push(HuntRules.wildlife[t.species].name);
      items.push(RangeRules.place(t));
      items.push(new Date(t.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}));
      return items.join(' · ');
    }
    function stand(t,i){
      const animals=t?TrophyLodge.portrait(t,450,230):'<span class="fixture-outline" aria-hidden="true">+</span>';
      const label=t?TrophyLodge.name(t):'Open display';
      return '<button type="button" data-room="stand" data-index="'+i+'" class="exhibit '+(t?'occupied':'vacant')+'" aria-pressed="'+(i===index)+'" aria-label="Display '+(i%3+1)+', '+esc(label)+'">'+
        '<span class="exhibit-figure">'+animals+'</span><span class="plinth"></span><span class="exhibit-plate"><b>'+esc(label)+'</b><small>'+(t?t.medal+' medal':'Choose a trophy')+'</small></span></button>';
    }
    function floor(focus=false){
      const h=hallIndex(),room=halls[h],rec=get(),all=slots(rec);
      page='floor';
      const tabs=halls.map((r,i)=>btn('hall',r.name,'hall-tab','data-hall="'+i+'" aria-pressed="'+(h===i)+'"')).join('');
      const crest=h===0&&PursuitRules.logged(rec.pursuits)===6?'<img class="room-trailmaster" src="assets/pursuits/trailmaster.webp" alt="Trailmaster crest, earned by completing all six wild pursuits" title="Trailmaster crest">':'';
      const scene='<div class="room-floor" style="--room-art:url(assets/room-'+room.art+'.webp);--room-accent:'+room.color+'"><div class="walkway" tabindex="0" aria-label="Gallery floor. Swipe or use the arrow keys to walk through the displays."><div class="exhibit-wall">'+all.slice(h*3,h*3+3).map((t,i)=>stand(t,h*3+i)).join('')+crest+'</div></div></div>';
      show('<div class="museum"><div class="museum-heading"><h2>Trophy room</h2><span>'+all.filter(Boolean).length+' / 12 on display</span></div><div class="hall-tabs" role="group" aria-label="Galleries">'+tabs+'</div>'+scene+
        '<div class="walking-controls">'+btn('prev','‹','walk-step','aria-label="Previous display"')+'<span id="walk-position" aria-live="polite"></span>'+btn('next','›','walk-step','aria-label="Next display"')+'</div><section id="exhibit-info" aria-label="Selected exhibit"></section><div class="museum-footer">'+btn('prints','Range gallery','lodge-action')+btn('collection','Trophy lodge','lodge-action')+btn('exit','Leave room','lodge-action')+'</div><div class="room-status" role="status"></div></div>','Trophy room');
      TrophyLodge.paint(find('.exhibit-wall'));
      const walkway=find('.walkway'),wall=find('.exhibit-wall');
      const token=++scrollToken;
      // The selected bay stays centered on phones; wider screens show the full wall.
      function syncMount(){
        if(token!==scrollToken||page!=='floor'||wall.clientWidth<=walkway.clientWidth+3)return;
        const midpoint=walkway.scrollLeft+walkway.clientWidth/2;
        const local=Math.max(0,Math.min(2,Math.floor(midpoint/(wall.clientWidth/3))));
        if(local!==index%3){index=h*3+local;info();}
      }
      let scrollFrame=0;
      walkway.onscroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;syncMount();});};
      walkway.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();walk(e.key==='ArrowRight'?1:-1);}};
      center();info();
      find('.hall-tab[aria-pressed="true"]').scrollIntoView({block:'nearest',inline:'nearest'});
      if(focus)walkway.focus({preventScroll:true});
      if(message)find('.room-status').textContent=message;
      message='';
    }
    function center(){
      const walk=find('.walkway'),wall=find('.exhibit-wall');
      if(walk&&wall)walk.scrollLeft=(index%3+.5)*wall.clientWidth/3-walk.clientWidth/2;
    }
    function info(){
      const rec=get(),all=slots(rec),t=all[index],h=hallIndex(),room=halls[h];
      shownId=t?.id??null;
      const displayed=new Set(all.filter(Boolean).map(v=>v.id));
      const eligible=inventory(rec).filter(v=>room.accepts(v));
      const fillable=all.slice(h*3,h*3+3).some(v=>!v)&&eligible.some(v=>!displayed.has(v.id));
      find('#walk-position').textContent=slotName(index);
      find('[data-room="prev"]').disabled=index===0;
      find('[data-room="next"]').disabled=index===11;
      root.querySelectorAll('.exhibit').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.index)===index)));
      const text=t?'<div><h3>'+esc(TrophyLodge.name(t))+'</h3><p>'+esc(plate(t))+'</p></div><dl class="room-facts"><div><dt>Weight</dt><dd>'+TrophyLodge.weight(t.kg)+'</dd></div><div><dt>Length</dt><dd>'+TrophyLodge.length(t.cm)+'</dd></div><div><dt>Medal</dt><dd>'+t.medal+'</dd></div></dl>':
        '<div><h3>Open display</h3><p>'+(eligible.length?'Choose a trophy from your collection to display here.':'Bring back '+room.subject+' to fill this display.')+'</p></div>';
      const actions=t?btn('fall','Replay fall','primary')+btn('replay','Replay sighting','lodge-action')+btn('choose','Change trophy','lodge-action')+btn('remove','Take down','lodge-action'):
        (eligible.length?btn('choose','Choose trophy','primary'):canHunt()?btn('hunt','Find a trophy','primary'):'');
      find('#exhibit-info').innerHTML='<div class="room-plaque">'+text+'</div><div class="room-actions">'+actions+(fillable?btn('curate','Fill open displays','lodge-action'):'')+'</div>';
    }
    function featured(h){
      const start=h*3,first=slots(get()).slice(start,start+3).findIndex(Boolean);
      return start+(first<0?1:first);
    }
    function walk(delta){
      const dest=Math.max(0,Math.min(11,index+delta)),old=hallIndex();if(dest===index)return;
      index=dest;message='';
      if(old===hallIndex()){center();info();find('.room-status').textContent='';}
      else floor(true);
    }
    function picker(){
      const rec=get(),room=halls[hallIndex()];
      page='picker';scrollToken++;
      let text='';
      show('<div class="museum museum-picker">'+btn('floor','Back to room','back-btn')+'<h2>Choose a trophy</h2><p>'+slotName(index)+'</p><label class="cabinet-filter">Find an animal<input type="search" placeholder="Search trophies" class="cabinet-search"></label><div class="cabinet-list"></div></div>','Choose a trophy');
      const list=find('.cabinet-list'),input=find('.cabinet-search');
      function draw(){
        const all=slots(rec);choices=inventory(rec).filter(t=>room.accepts(t)&&(TrophyLodge.name(t)+' '+HuntRules.wildlife[t.species].name).toLowerCase().includes(text.toLowerCase().trim()));
        list.innerHTML=choices.map((t,i)=>{
          const at=all.findIndex(m=>m?.id===t.id);
          return btn('place',TrophyLodge.portrait(t,135,70)+'<span><b>'+esc(TrophyLodge.name(t))+'</b><small>'+t.medal+' · '+TrophyLodge.weight(t.kg)+' · '+TrophyLodge.length(t.cm)+'</small><small>'+esc(RangeRules.place(t))+(at<0?'':at===index?' · On this display':' · Move from '+slotName(at))+'</small></span>','cabinet-item','data-choice="'+i+'"');
        }).join('')||'<p class="empty-state">'+(text?'No matching trophies.':'Bring back '+room.subject+' to start this gallery.')+'</p>';
        TrophyLodge.paint(list);
      }
      input.oninput=()=>{text=input.value;draw();};draw();
    }
    function prints(){
      page='prints';scrollToken++;
      const book=get().range;
      show('<div class="museum">'+btn('floor','Back to trophy room','back-btn')+'<h2>Range gallery</h2><p>Photograph the two traveling companions before collecting the legend to frame all three animals.</p>'+RangePrints.galleryHTML(book)+'</div>','Range gallery');
      root.querySelectorAll('[data-print]').forEach(el=>{const id=el.dataset.print;RangePrints.attach(el,book.logs[id].best,find('[data-saveprint="'+id+'"]'));});
    }
    function handle(e){
      const b=e.target.closest('button[data-room]');if(!b||!root.contains(b))return;
      const action=b.dataset.room;
      if(action==='prints'){prints();return;}
      if(action==='hall'){index=featured(Number(b.dataset.hall));floor();return;}
      if(action==='prev'||action==='next'){walk(action==='prev'?-1:1);return;}
      if(action==='stand'){
        index=Number(b.dataset.index);center();info();
        if(!shownId&&inventory(get()).some(halls[hallIndex()].accepts))picker();
        else find('#exhibit-info').scrollIntoView({block:'nearest'});
        return;
      }
      if(action==='choose'){picker();return;}
      if(action==='floor'){floor();return;}
      if(action==='place'){
        const t=choices[+b.dataset.choice];if(!t)return;
        change(rec=>{
          if((slots(rec)[index]?.id??null)!==shownId){message='This display changed in another tab.';return;}
          if(place(rec,t,index))message=TrophyLodge.name(t)+' is now on display.';
        });floor();return;
      }
      if(action==='remove'){change(rec=>{message=unmount(rec,index,shownId)?'Trophy returned to your collection.':'This display changed in another tab.';});floor();return;}
      if(action==='curate'){change(rec=>{const n=curate(rec,hallIndex());message=n+' open display'+(n===1?'':'s')+' filled.';});floor();return;}
      if(action==='replay'||action==='fall'){const t=slots(get())[index];if(t)replay(t,()=>floor(),action==='fall');return;}
      if(action==='collection'){lodge();return;}
      if(action==='exit'){leave(origin);return;}
      if(action==='hunt'&&canHunt())hunt(halls[hallIndex()].track);
    }
    root.addEventListener('click',handle);
    return {openPrints(from='game'){origin=from;index=featured(0);prints();},open(from='game',slot){origin=from;index=slot??featured(0);message='';floor();},back(){if(page==='picker'||page==='prints'){floor();return;}leave(origin);},refresh(){if(page==='prints'&&find('.museum'))prints();else if(page==='floor'&&find('.museum'))floor();}};
  }
  return {slots,place,unmount,inventory,curate,create,slotName,accepts:(i,t)=>halls[Math.floor(i/3)].accepts(t)};
})();
