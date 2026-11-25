'use strict';
const HuntRules = (() => {
  // The ranges are arcade specimen rolls, in kg and cm.
  function species(name, points, size, speed, weight, length, group) {
    return {name,points,size,speed,weight,length,group};
  }
  const wildlife = {
    elephant:species('African savanna elephant',280,1.17,.048,[2480,6700],[470,715],'Safari'),
    forestel:species('African forest elephant',295,.97,.059,[1450,4150],[380,600],'Safari'),
    rhino:species('White rhinoceros',245,.83,.071,[1360,2880],[310,420],'Safari'),
    giraffe:species('Giraffe',240,1.26,.068,[730,1550],[310,470],'Safari'),
    hippo:species('Hippopotamus',235,.70,.076,[995,3175],[260,440],'Safari'),
    eland:species('Common eland',208,.90,.085,[340,970],[215,342],'Safari'),
    brown:species('Eurasian brown bear',188,.81,.073,[95,380],[145,250],'Bears'),
    moonbear:species('Asiatic black bear',204,.69,.087,[50,195],[124,195],'Bears'),
    sunbear:species('Sun bear',218,.51,.108,[25,74],[102,151],'Bears'),
    slothbear:species('Sloth bear',214,.66,.087,[55,152],[137,190],'Bears'),
    spectacled:species('Spectacled bear',236,.65,.09,[44,180],[120,201],'Bears'),
    panda:species('Giant panda',248,.66,.077,[68,139],[122,183],'Bears'),
    spirit:species('Spirit bear',254,.71,.085,[58,259],[129,208],'Bears'),
    cinnamon:species('Cinnamon bear',205,.7,.09,[60,250],[133,201],'Bears'),
    glacier:species('Glacier bear',254,.70,.088,[58,245],[128,205],'Bears'),
    himalayan:species('Himalayan brown bear',250,.77,.084,[88,233],[148,222],'Bears'),
    kamchatka:species('Kamchatka brown bear',242,.89,.070,[197,610],[173,278],'Bears'),
    tibetan:species('Tibetan blue bear',265,.76,.082,[83,239],[141,227],'Bears'),
    peninsular:species('Alaska Peninsula brown bear',244,.88,.07,[200,590],[180,269],'Bears'),
    ussuri:species('Ussuri brown bear',237,.83,.076,[135,445],[158,254],'Bears'),
    himblack:species('Himalayan black bear',234,.67,.09,[51,185],[125,190],'Bears'),
    lankansloth:species('Sri Lankan sloth bear',245,.59,.094,[45,115],[116,170],'Bears'),
    formosan:species('Formosan black bear',250,.69,.092,[53,182],[121,188],'Bears'),
    bornean:species('Bornean sun bear',260,.47,.116,[21,59],[98,137],'Bears'),
    eastbrown:species('East Siberian brown bear',255,.85,.075,[146,465],[160,257],'Bears'),
    brownpanda:species('Brown giant panda',285,.63,.082,[67,131],[117,174],'Bears'),
    vicuna:species('Vicuña',188,.64,.122,[34,65],[128,168],'Woodland & tundra'),
    andeanfox:species('Andean fox',207,.44,.131,[5,14],[58,108],'Woodland & tundra'),
    yak:species('Wild yak',235,.89,.079,[305,1130],[215,365],'Woodland & tundra'),
    snowleopard:species('Snow leopard',275,.56,.13,[23,72],[88,139],'Woodland & tundra'),
    sambar:species('Sambar deer',188,.85,.10,[107,390],[160,259],'Woodland & tundra'),
    warthog:species('Warthog',165,.54,.11,[42,142],[95,167],'Safari'),
    zebra:species('Plains zebra',155,.82,.089,[190,410],[185,258],'Safari'),
    kudu:species('Greater kudu',205,1.05,.081,[135,310],[185,254],'Safari'),
    buffalo:species('Cape buffalo',195,.86,.064,[410,925],[210,335],'Safari'),
    wildebeest:species('Blue wildebeest',175,.77,.087,[130,285],[170,249],'Safari'),
    impala:species('Impala',210,.64,.135,[33,78],[115,162],'Safari'),
    lion:species('Lion',235,.68,.096,[118,245],[153,242],'Safari'),
    leopard:species('Leopard',260,.55,.126,[32,92],[98,187],'Safari'),
    blackbear:species('American black bear',165,.69,.087,[64,285],[135,210],'Bears'),
    grizzly:species('Grizzly bear',195,.82,.077,[135,410],[165,255],'Bears'),
    kodiak:species('Kodiak bear',230,.91,.066,[240,680],[190,298],'Bears'),
    polar:species('Polar bear',240,.90,.074,[260,720],[200,310],'Bears'),
    muskox:species('Musk ox',185,.66,.073,[195,430],[163,250],'Woodland & tundra'),
    arcticfox:species('Arctic fox',225,.38,.137,[2.5,9],[46,72],'Woodland & tundra'),
    elk:species('Elk',100,1,.060,[190,490],[175,268],'Woodland & tundra'),
    deer:species('Whitetail',120,.8,.077,[40,142],[115,205],'Woodland & tundra'),
    hare:species('Hare',180,.39,.116,[1.7,5.4],[36,68],'Woodland & tundra'),
    fox:species('Red fox',160,.53,.105,[3,13],[47,94],'Woodland & tundra'),
    pheasant:species('Pheasant',200,.43,.14,[.7,2.3],[46,93],'Woodland & tundra'),
    boar:species('Wild boar',140,.62,.083,[55,240],[112,201],'Woodland & tundra')
  };
  const families={blackbear:'American black bear',moonbear:'Asiatic black bear',brown:'Brown bear',polar:'Polar bear',panda:'Giant panda',sunbear:'Sun bear',slothbear:'Sloth bear',spectacled:'Spectacled bear'};
  const types={
    blackbear:['blackbear','cinnamon','glacier','spirit'],moonbear:['moonbear','himblack','formosan'],
    brown:['brown','grizzly','kodiak','himalayan','kamchatka','tibetan','peninsular','ussuri','eastbrown'],
    polar:['polar'],panda:['panda','brownpanda'],sunbear:['sunbear','bornean'],slothbear:['slothbear','lankansloth'],spectacled:['spectacled']
  };
  const aliases={formosan:'Taiwan black bear Formosan moon bear',bornean:'Borneo honey bear Bornean sun bear',eastbrown:'Siberian brown bear East Siberian bear',brownpanda:'brown panda bear Qinling brown and white panda',elephant:'African bush elephant',forestel:'forest elephant',rhino:'white rhino square-lipped rhinoceros',hippo:'hippo',kodiak:'Kodiak brown bear island bear',spirit:'Kermode bear white black bear',spectacled:'Andean bear spectacled bear',panda:'panda bear giant panda bear',moonbear:'Asian black bear moon bear white-chested bear',sunbear:'Malayan sun bear honey bear',grizzly:'North American brown bear silvertip',tibetan:'Tibetan brown bear Tibetan blue bear',polar:'ice bear white bear',slothbear:'labiated bear',glacier:'blue black bear',ussuri:'Ezo brown bear',peninsular:'Alaskan brown bear coastal brown bear',himblack:'Himalayan moon bear',lankansloth:'Sri Lanka sloth bear',blackbear:'North American black bear',brown:'European brown bear common brown bear',himalayan:'Himalayan red bear',andeanfox:'culpeo',vicuna:'vicuna',sambar:'sambur deer'};
  for(const [parent,members] of Object.entries(types))for(const k of members)wildlife[k].bearFamily=families[parent];
  const herdKeys=['zebra','wildebeest','impala','kudu','giraffe','eland','sambar','vicuna'];
  const giantKeys=['elephant','forestel','hippo','rhino','giraffe','buffalo','eland','yak'];
  const reserves = [
    {key:'savanna',name:'Acacia Plains',region:'Africa',light:'Sunrise',habitat:'East African grassland',species:['elephant','lion','warthog','zebra','giraffe','wildebeest','impala','eland'],goals:['warthog','zebra'],bonus:440,legend:'Sunmane',legendSpecies:'lion',gift:'Sunstone',power:'Earn 80 extra points for each Gold or Diamond trophy.'},
    {key:'baobab',name:'Baobab Basin',region:'Africa',light:'Copper dusk',habitat:'African river country',species:['warthog','buffalo','kudu','leopard','impala','hippo','rhino'],goals:['buffalo','kudu'],bonus:475,legend:'Copper Tusk',legendSpecies:'warthog',gift:'Copper Tusk Charm',power:'Carry six shots per reload.'},
    {key:'kodiak',name:'Kodiak Coast',region:'Alaska',light:'Sea mist',habitat:'Alaskan coastal meadow',species:['kodiak','fox','deer'],goals:['kodiak','deer'],bonus:440,legend:'Old Breakwater',legendSpecies:'kodiak',gift:'Tideglass',power:'Start each hunt with a third Scout charge.'},
    {key:'arctic',name:'Aurora Shelf',region:'Arctic',light:'Northern lights',habitat:'Arctic coastal tundra',species:['polar','arcticfox','muskox'],goals:['polar','muskox'],bonus:475,legend:'Northstar',legendSpecies:'polar',gift:'Aurora Lens',power:'Each Scout scan lasts eight seconds instead of five.'},
    {key:'ember',name:'Ember Valley',region:'North America',light:'Golden hour',habitat:'Autumn meadow',species:['elk','deer','hare','blackbear','cinnamon'],goals:['elk','hare'],bonus:350,legend:'The Gilded Stag',legendSpecies:'elk',gift:'Antler Crown',power:'Your first successful shot in each hunt earns 100 extra points.'},
    {key:'blue',name:'Bluewater Lake',region:'North America',light:'First light',habitat:'Boreal lakeshore',species:['blackbear','deer','pheasant','fox'],goals:['fox','pheasant'],bonus:400,legend:'Midnight',legendSpecies:'blackbear',gift:'Kingfisher Feather',power:'Hits in a streak of three or more earn 30 extra points.'},
    {key:'frost',name:'Frostpine Pass',region:'North America',light:'Moonrise',habitat:'Alpine snowfield',species:['grizzly','elk','hare','boar','blackbear'],goals:['boar','elk'],bonus:350,legend:'Silverback',legendSpecies:'grizzly',gift:'Moonstone',power:'Protect your streak from one miss per hunt.'},
    {key:'riverforest',name:'Canopy River',region:'Africa',light:'Morning mist',habitat:'Central African forest clearing',species:['forestel','leopard','buffalo','warthog'],goals:['forestel','leopard'],bonus:490,legend:'River Monarch',legendSpecies:'forestel',gift:'Forest Pearl',power:'Add 150 points to each completed trail bonus.'},
    {key:'cedar',name:'Cedar Sound',region:'North America',light:'Coastal mist',habitat:'North Pacific rainforest',species:['spirit','glacier','peninsular','blackbear','deer'],goals:['spirit','glacier'],bonus:485,legend:'White Cedar',legendSpecies:'spirit',gift:'Cedar Token',power:'Each ivory or legendary animal earns 60 extra points.'},
    {key:'cloud',name:'Cloud Terrace',region:'Andes',light:'Cloudbreak',habitat:'Andean cloud forest',species:['spectacled','vicuna','andeanfox'],goals:['spectacled','vicuna'],bonus:465,legend:'The Stargazer',legendSpecies:'spectacled',gift:'Condor Thread',power:'Hits in a streak of two or more earn 25 extra points.'},
    {key:'bamboo',name:'Jade Hollow',region:'Asia',light:'Bamboo shade',habitat:'East Asian forest',species:['panda','moonbear','sambar','boar','brownpanda','formosan'],goals:['panda','moonbear'],bonus:450,legend:'Jade Keeper',legendSpecies:'panda',gift:'Jade Blossom',power:'Every hunt opens with a free five-second Scout scan.'},
    {key:'highland',name:'Sky Plateau',region:'Asia',light:'Alpine dawn',habitat:'Himalayan and Tibetan highlands',species:['tibetan','himalayan','himblack','yak','snowleopard'],goals:['tibetan','yak'],bonus:495,legend:'Cloudwalker',legendSpecies:'tibetan',gift:'Cloud Bell',power:'Your first Gold or Diamond trophy each hunt earns 125 extra points.'},
    {key:'taiga',name:'Amber Taiga',region:'Eurasia',light:'Amber afternoon',habitat:'Northern Eurasian forests',species:['brown','kamchatka','ussuri','boar','fox','eastbrown'],goals:['brown','kamchatka'],bonus:470,legend:'The Amber King',legendSpecies:'kamchatka',gift:'Amber Claw',power:'Every bear earns 30 extra points.'},
    {key:'monsoon',name:'Monsoon Grove',region:'Asia',light:'Monsoon sun',habitat:'South and Southeast Asian forests',species:['sunbear','slothbear','lankansloth','moonbear','sambar','boar','bornean'],goals:['slothbear','sunbear'],bonus:485,legend:'Honeyheart',legendSpecies:'sunbear',gift:'Honeycomb',power:'Reload in 0.65 seconds instead of 1.05.'}
  ];
  const byKey=Object.fromEntries(reserves.map(r=>[r.key,r]));
  const keys=Object.keys(wildlife);
  const grades=['Bronze','Silver','Gold','Diamond'];
  const storageKey=WorldHuntProfile.key('timberline-hunt.records.v1');
  const number=x=>Number.isFinite(x)&&x>=0?Math.floor(x):0;
  const counts=(list,obj)=>Object.fromEntries(list.map(k=>[k,number(obj?.[k])]));
  function roll(k,coat='common',rng=Math.random){
    const v=wildlife[k],p=coat==='legend'?.86+rng()*.14:Math.pow(rng(),1.5);
    const l=Math.min(1,.45*p+.55*rng()),between=(r,t)=>r[0]+(r[1]-r[0])*t;
    return {kg:Math.round(between(v.weight,p)*10)/10,cm:Math.round(between(v.length,l)),medal:grades[p>=.94?3:p>=.78?2:p>=.46?1:0],size:.87+.28*p,coat};
  }
  function valid(t){return !!t&&Object.hasOwn(wildlife,t.species)&&Object.hasOwn(byKey,t.reserve)&&typeof t.id==='string'&&t.id.length<100&&Number.isFinite(t.kg)&&t.kg>0&&Number.isFinite(t.cm)&&t.cm>0&&grades.includes(t.medal)&&['common','ivory','legend'].includes(t.coat)&&Number.isFinite(t.date);}
  function records(raw){
    const book={};
    for(const k of keys){
      const info=raw?.book?.[k];
      if(info){
        const safe=t=>valid(t)&&t.species===k?t:null;
        book[k]={heavy:safe(info.heavy),long:safe(info.long),previousHeavy:safe(info.previousHeavy),previousLong:safe(info.previousLong),legend:safe(info.legend),medals:counts(grades,info.medals)};
      }
    }
    const gifts=Object.keys(byKey).filter(k=>raw?.gifts?.includes?.(k));
    return {hunts:number(raw?.hunts),rare:number(raw?.rare),bests:counts(Object.keys(byKey),raw?.bests),bag:counts(keys,raw?.bag),
      range:RangeRules.clean(raw?.range,valid),pursuits:PursuitRules.records(raw?.pursuits,valid),book,photos:FieldAlbum.clean(raw?.photos),gifts,equipped:gifts.includes(raw?.equipped)?raw.equipped:null,
      recent:Array.isArray(raw?.recent)?raw.recent.filter(valid).slice(0,24):[],
      mounts:[0,1,2].map(i=>valid(raw?.mounts?.[i])?raw.mounts[i]:null),
      galleryMounts:Array.from({length:9},(_,i)=>valid(raw?.galleryMounts?.[i])?raw.galleryMounts[i]:null),
      cabinet:Array.isArray(raw?.cabinet)?raw.cabinet.filter(valid):[],
      bestStreak:number(raw?.bestStreak),bestBag:number(raw?.bestBag)};
  }
  function round(reserve,gift=null){
    const capacity=gift==='baobab'?6:5;
    return {reserve,gift,capacity,elapsed:0,score:0,hits:0,shots:0,streak:0,bestStreak:0,bullets:capacity,reload:0,cooldown:0,
      bag:counts(keys),rare:0,contract:false,done:false,scouts:gift==='kodiak'?3:2,scan:gift==='bamboo'?5:0,shield:gift==='frost',bell:gift==='highland',
      trophies:[],legendSeen:false};
  }
  function tick(r,dt){
    if(r.done)return;r.elapsed=Math.min(60,r.elapsed+dt);r.cooldown=Math.max(0,r.cooldown-dt);r.scan=Math.max(0,r.scan-dt);
    if(r.reload>0){r.reload=Math.max(0,r.reload-dt);if(!r.reload)r.bullets=r.capacity;}if(r.elapsed>=60)r.done=true;
  }
  function scout(r){if(r.done||r.scouts<=0||r.scan>0)return false;r.scouts--;r.scan=r.gift==='arctic'?8:5;return true;}
  function reload(r){if(r.done||r.reload>0||r.bullets===r.capacity)return false;r.reload=r.gift==='monsoon'?.65:1.05;return true;}
  function shoot(r,a){
    if(r.done||r.reload>0||r.cooldown>0||r.bullets<=0)return null;
    r.shots++;r.bullets--;r.cooldown=.17;
    if(!a){const protectedStreak=r.shield&&r.streak>0;if(protectedStreak)r.shield=false;else r.streak=0;return {hit:false,protectedStreak};}
    const k=a.species,coat=a.specimen.coat;
    r.hits++;r.streak++;r.bestStreak=Math.max(r.streak,r.bestStreak);r.bag[k]++;if(coat!=='common')r.rare++;
    const factor=1+Math.min(4,r.streak-1)*.25;
    const gold=['Gold','Diamond'].includes(a.specimen.medal);
    const bell=r.bell&&gold;if(bell)r.bell=false;
    const perk=(bell?125:0)+(r.gift==='taiga'&&wildlife[k].bearFamily?30:0)+(r.gift==='cloud'&&r.streak>=2?25:0)+(r.gift==='cedar'&&coat!=='common'?60:0)+(r.gift==='savanna'&&['Gold','Diamond'].includes(a.specimen.medal)?80:0)+(r.gift==='ember'&&r.hits===1?100:0)+(r.gift==='blue'&&r.streak>=3?30:0);
    const tagged=a.tagged?75:0;
    const points=tagged+Math.round(wildlife[k].points*factor*(coat==='common'?1:coat==='ivory'?3:4))+perk;
    const bonus=!r.contract&&r.reserve.goals.every(s=>r.bag[s]>0)?r.reserve.bonus+(r.gift==='riverforest'?150:0):0;
    r.score+=points+bonus;r.contract ||= bonus>0;return {hit:true,points,bonus,factor,perk,tagged};
  }
  // Each specimen is filed on pickup. Finishing the round only updates round-level records.
  function file(records,t){
    const k=t.species,entry=records.book[k]??={heavy:null,long:null,legend:null,medals:counts(grades)};
    const previous=entry.heavy,priorLong=entry.long,first=!previous;
    if(t.id&&records.recent.some(recent=>recent.id===t.id))return {first:false,weightRecord:false,lengthRecord:false,previous,priorLong,newGift:false};
    const weightRecord=!previous||t.kg>previous.kg,lengthRecord=!priorLong||t.cm>priorLong.cm;
    if(weightRecord){entry.previousHeavy=previous;entry.heavy=t;}if(lengthRecord){entry.previousLong=priorLong;entry.long=t;}
    records.bag[k]++;entry.medals[t.medal]++;
    if(t.coat!=='common')records.rare++;
    const newGift=t.coat==='legend'&&!records.gifts.includes(t.reserve);
    if(t.coat==='legend'){if(!entry.legend||t.kg>entry.legend.kg)entry.legend=t;if(newGift)records.gifts.push(t.reserve);}
    records.recent=[t,...records.recent].slice(0,24);
    return {first,weightRecord,lengthRecord,previous,priorLong,newGift};
  }
  function finish(records,r){records.hunts++;records.bests[r.reserve.key]=Math.max(records.bests[r.reserve.key],r.score);records.bestStreak=Math.max(records.bestStreak,r.bestStreak);records.bestBag=Math.max(records.bestBag,r.hits);}
  function badges(rec){
    const bagged=list=>list.filter(k=>rec.bag[k]>0).length;
    return [
      {name:'Eight Bears',goal:8,now:Object.values(types).filter(m=>m.some(k=>rec.bag[k]>0)).length,detail:'Log all eight living bear species.'},
      {name:'Bear Grand Slam',goal:20,now:Math.min(20,bagged(keys.filter(k=>wildlife[k].group==='Bears'))),detail:'Log 20 different playable bear types.'},
      {name:'Land Giants',goal:giantKeys.length,now:bagged(giantKeys),detail:'Log both elephants, the hippo, rhino, giraffe, buffalo, eland and yak.'},
      {name:'Safari Passport',goal:keys.filter(k=>wildlife[k].group==='Safari').length,now:bagged(keys.filter(k=>wildlife[k].group==='Safari')),detail:'Log every African species.'},
      {name:'Diamond Club',goal:1,now:Object.values(rec.book).some(e=>e.medals.Diamond>0)?1:0,detail:'Earn a Diamond medal.'},
      {name:'Legend Keeper',goal:reserves.length,now:rec.gifts.length,detail:'Collect every reserve’s legendary gift.'},
      {name:'Full Field Guide',goal:47,now:Math.min(47,bagged(keys)),detail:'Log 47 different animals.'},
      {name:'Eastern Bears',goal:4,now:bagged(['brownpanda','formosan','bornean','eastbrown']),detail:'Log the brown giant panda, Formosan black bear, Bornean sun bear, and East Siberian brown bear.'},
      {name:'Master Naturalist',goal:keys.length,now:bagged(keys),detail:'Log every playable animal.'}
    ];
  }
  return {wildlife,reserves,byKey,grades,types,aliases,herdKeys,giantKeys,records,roll,round,tick,reload,scout,shoot,file,finish,badges,storageKey};
})();
