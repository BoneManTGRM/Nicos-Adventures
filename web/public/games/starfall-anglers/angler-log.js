"use strict";
const AnglerLog = (()=>{
 // A catch record owns its gift. Releasing the specimen or replaying its film cannot consume it.
 const gifts={
  crown:gift("Crown Scale","Escama Corona",{mass:1.55}),
  phoenix:gift("Ember Spool","Carrete de Brasa",{reel:1.23}),
  star:gift("Seven-Star Compass","Brújula de Siete Estrellas",{discovery:2}),
  dragon:gift("Leafline","Sedal de Hoja",{pull:.72}),
  axolotl:gift("Amber Bell","Campana de Ámbar",{bite:.69}),
  narwhal:gift("Aurora Prism","Prisma Boreal",{rare:1.65}),
  goldrooster:gift("Golden Comb","Peine Dorado",{ring:1.6}),
  marlin:gift("Billfin Reel","Carrete de Marlín",{reel:1.16,hook:1.8}),
  mantastar:gift("Starlit Wing","Ala Estelar",{pull:.83,ring:1.30}),
  veil:gift("Violet Ribbon","Listón Violeta",{discovery:1.55,bite:.84}),
  moonpaddle:gift("Moonmirror Spoon","Cuchara Espejo de Luna",{mass:1.27,ring:1.28}),
  obsidiangiant:gift("Ember Armor","Armadura de Brasa",{mass:1.25,pull:.82}),
  prismeel:gift("Prism Thread","Hilo de Prisma",{discovery:1.45,hook:2}),
  sunlion:gift("Sundial Spinner","Cucharilla Solar",{rare:1.35,bite:.82}),
  jadesaw:gift("Jade Ratchet","Trinquete de Jade",{pull:.85,reel:1.13}),
  auroraskate:gift("Polar Sail","Vela Polar",{ring:1.32,hook:2.5}),
  beaconsail:gift("Beacon Float","Flotador del Faro",{discovery:1.45,ring:1.28}),
  thunderblue:gift("Thunder Crank","Manivela de Trueno",{reel:1.15,bite:.85}),
  greatwhite:gift("Breaker Tooth","Diente Rompeolas",{rescue:true}),
  eclipseangler:gift("Eclipse Lantern","Linterna del Eclipse",{rare:1.37,discovery:1.45})
 };
 function gift(en,es,effects){return {name:[en,es],effects};}
 function equipped(save){return save.records[save.charm]?gifts[save.charm]:null;}
 function describe(g,lang){
  const e=g.effects,parts=[];
  const add=(en,es)=>parts.push(lang?es:en);
  if(e.mass)add("Heavier catches are more likely.","Aumenta la probabilidad de capturas más pesadas.");
  if(e.discovery)add("Attracts species missing from your catch records.","Atrae especies que te faltan por capturar.");
  if(e.rare)add("Attracts more rare and legendary fish.","Atrae más peces raros y legendarios.");
  if(e.pull)add("Slows the buildup of line tension.","La tensión del sedal aumenta más despacio.");
  if(e.reel)add("Reels fish in faster.","Recoge el sedal más rápido.");
  if(e.bite)add("Shortens the wait for a bite.","Reduce la espera para que pique un pez.");
  if(e.ring)add("Widens the target around the golden ring.","Amplía la zona de acierto del anillo dorado.");
  if(e.hook)add("Gives you "+e.hook+" extra seconds to set the hook.","Te da "+e.hook+" segundos más para enganchar al pez.");
  if(e.rescue)add("Saves a snapping line once per cast.","Salva el sedal una vez por lance si está a punto de romperse.");
  return parts.join(" ");
 }
 function sizeRoll(roll,effects){return 1-Math.pow(1-roll,effects.mass||1);}
 function rescue(fight,effects){
  if(!effects.rescue||fight.rescued)return false;
  fight.rescued=true;fight.tension=.28;return true;
 }
 function updateRecord(records,f,kg,now=Date.now()){
  const old=records[f.id],improved=!old||kg>old.best;
  const next={n:(old?.n||0)+1,best:improved?kg:old.best};
  if(improved)next.bestAt=now;else if(old.bestAt)next.bestAt=old.bestAt;
  records[f.id]=next;
  return {first:!old,previous:old?.best,improved};
 }
 function fillBook({root,sharksOnly,save,pick,el,button,weight,depth,go}){
  const all=sharksOnly?Waters.sharks:Waters.fish;
  const word=(en,es)=>pick([en,es]);
  const search=el("input","log-search");
  search.type="search";search.placeholder=word("Find a fish or fishing spot","Busca un pez o un sitio de pesca");
  search.setAttribute("aria-label",search.placeholder);
  const filters=el("div","log-filters"),list=el("div","log-list"),status=el("p","log-status");
  status.setAttribute("role","status");
  let mine=false;
  const filterButtons=[word("All species","Todas las especies"),word("My catches","Mis capturas")].map((name,i)=>
   button(name,()=>{mine=Boolean(i);draw();},"theme"));
  const normalize=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  function draw(){
   for(const [i,b] of filterButtons.entries())b.setAttribute("aria-pressed",String(Boolean(i)===mine));
   const query=normalize(search.value.trim());
   const rows=all.filter(f=>(!mine||save.records[f.id])&&normalize([...f.name,...Waters.places[f.place].name].join(" ")).includes(query));
   list.replaceChildren();status.textContent=rows.length+" / "+all.length+" "+word("species","especies");
   if(!rows.length){list.append(el("p","",word("No matching catches.","No hay coincidencias.")));return;}
   for(const f of rows){
    const record=save.records[f.id],port=Waters.places[f.place],row=el("article","log-row");
    const image=el("img","log-fish");image.alt="";image.loading="lazy";image.src="assets/"+f.id+".png";
    const words=el("div","log-copy");words.append(el("strong","",pick(f.name)),el("small","",pick(port.name)+(sharksOnly?" · "+depth(f):"")));
    if(record){
     let detail=record.n+" "+word("caught","capturas");
     if(record.bestAt)detail+=" · "+new Intl.DateTimeFormat(save.lang?"es-MX":"en",{dateStyle:"medium"}).format(record.bestAt);
     words.append(el("small","",detail));
    }
    const badge=el("span","log-weight",record?weight(record.best):word("Uncaught","Sin captura"));
    if(record)badge.setAttribute("aria-label",word("Personal best","Récord personal")+" "+weight(record.best));
    row.append(image,words,badge);
    if(sharksOnly&&go&&port.unlock<=Object.values(save.records).reduce((n,r)=>n+r.n,0))
     row.append(button(word("Fish here","Pescar aquí"),()=>go(f),"log-go"));
    list.append(row);
   }
  }
  filters.append(...filterButtons);search.oninput=draw;root.append(search,filters,status,list);draw();
 }
 return {gifts,equipped,describe,sizeRoll,rescue,updateRecord,fillBook};
})();
