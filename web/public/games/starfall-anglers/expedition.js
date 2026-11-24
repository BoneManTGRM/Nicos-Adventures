"use strict";
const StarExpedition=(()=>{
 const routes=[
  {key:"pines",title:["Firefly Pines","Pinar de luciérnagas"],legend:["Moon Stag","Ciervo lunar"],color:"#c6e6a5",card:"trail-card-moonstag",
   sites:[["Hollow log","Tronco hueco",.18,.34],["Moon pool","Poza lunar",.77,.17],["Hollow oak","Roble hueco",.86,.62]],
   glyphs:[["☾","Moon","Luna"],["✦","Star","Estrella"],["❧","Leaf","Hoja"]],order:[2,0,1],
   clues:[["A leaf rests on a crescent carving. The leaf comes before the moon.","Una hoja cubre una media luna tallada. La hoja va antes de la luna."],["In the reflection, the moon rises before the star.","En el reflejo, la luna sale antes que la estrella."]],
   wisp:[.44,.835],story:["The oak lantern has gone dark. Tap landmarks for clues and animals for field notes.","El farol del roble se apagó. Toca los lugares para encontrar pistas y los animales para tomar notas."]},
  {key:"ridge",title:["Aurora Ridge","Sierra de la aurora"],legend:["Aurora Lynx","Lince de la aurora"],color:"#9be9ee",card:"trail-card-lynx",
   sites:[["Ice arch","Arco de hielo",.20,.32],["Violet crystal","Cristal violeta",.84,.18],["Frozen pool","Poza helada",.79,.75]],
   glyphs:[["❄","Snowflake","Copo"],["☾","Moon","Luna"],["◆","Crystal","Cristal"]],order:[2,1,0],
   clues:[["Inside the arch, the crystal rings before the moon lights up.","Dentro del arco, el cristal suena antes de que se ilumine la luna."],["A moonbeam crosses the violet stone before a snowflake lands.","Un rayo de luna cruza la piedra violeta antes de que caiga un copo."]],
   wisp:[.49,.83],story:["Under the ice, a lantern is waiting for the aurora to sing again.","Bajo el hielo, un farol espera que la aurora vuelva a cantar."]},
  {key:"canyon",title:["Canyon of the Sun","Cañón del Sol"],legend:["Sun Jaguar","Jaguar del sol"],color:"#ffc17b",card:"trail-card-sunjaguar",
   sites:[["Plank bridge","Puente de madera",.145,.43],["Sunstone","Piedra del sol",.86,.15],["Hidden spring","Manantial secreto",.83,.71]],
   glyphs:[["☀","Sun","Sol"],["✿","Blossom","Flor"],["◆","Crystal","Cristal"]],order:[1,2,0],
   clues:[["The bridge carving shows a blossom opening before the crystal gleams.","El puente muestra una flor que se abre antes de que brille el cristal."],["On the sundial, the crystal catches the light before the sun symbol.","En el reloj solar, la luz toca primero el cristal y después el sol."]],
   wisp:[.39,.825],story:["The spring has fallen silent. Trace the old sunkeeper’s marks to wake it.","El manantial quedó en silencio. Sigue las señales de su guardián para despertarlo."]}
 ];
 const wildlife=[
  [["The fox leaves silver pawprints when a wisp passes.","El zorro deja huellas plateadas cuando pasa un destello."],["The deer tilts its ears toward the wisp’s song.","El corzo orienta las orejas hacia el canto del destello."]],
  [["Look for a little blue light in the hare’s tracks.","Busca una lucecita azul entre las huellas de la liebre."],["The wolf’s howl makes the snow wisps flicker.","El aullido del lobo hace parpadear los destellos de la nieve."]],
  [["The armadillo’s shell glints when a wisp passes overhead.","El caparazón del armadillo brilla cuando pasa un destello."],["The roadrunner races the wisp across the warm rocks.","El correcaminos compite con el destello sobre las rocas tibias."]]
 ];
 const finale={title:["Sky Gate","Puerta del cielo"],legend:["Starwing Griffin","Grifo estelar"],card:"expedition-starwing"};
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 const allRegions=[...routes,finale];
 const seals=data=>data.photos.slice(0,3).filter(Boolean).length;
 const gold=data=>data.wisps.every(Boolean);
 function clean(raw){
  const clues=routes.map((_,i)=>Number.isInteger(raw?.clues?.[i])?clamp(raw.clues[i],0,3):0);
  const lit=routes.map((_,i)=>clues[i]===3&&raw?.lit?.[i]===true);
  const wisps=routes.map((_,i)=>raw?.wisps?.[i]===true);
  const photos=allRegions.map((_,i)=>ExpeditionPhoto.clean(raw?.photos?.[i]));
  for(let i=0;i<3;i++)if(!lit[i])photos[i]=null;
  if(photos.slice(0,3).some(p=>!p))photos[3]=null;
  const seen=routes.map((_,i)=>Number.isInteger(raw?.seen?.[i])?clamp(raw.seen[i],0,3):0);
  return {region:Number.isInteger(raw?.region)?clamp(raw.region,0,2):0,clues,lit,wisps,seen,photos,
   assist:typeof raw?.assist==="boolean"?raw.assist:null};
 }
 function noteClue(data,region,site){
  if(!routes[region]||![0,1].includes(site))return false;
  const before=data.clues[region];data.clues[region]|=1<<site;
  return before!==data.clues[region];
 }
 function light(data,region,choice){
  if(!routes[region]||data.clues[region]!==3||choice.length!==3)return false;
  if(!choice.every((glyph,i)=>glyph===routes[region].order[i]))return false;
  data.lit[region]=true;return true;
 }
 function keep(data,region,photo){
  const shot=ExpeditionPhoto.clean(photo);
  if(!allRegions[region]||!shot||(region===3?seals(data)!==3:!data.lit[region]))return false;
  if(data.photos[region]&&data.photos[region].stars>=shot.stars)return false;
  data.photos[region]=shot;return true;
 }
 function open({root,data,pick,el,button,persist,beep,reduced,steady,onLodge,changeLanguage}){
  const t=(en,es)=>pick([en,es]),world=el("section","trail-hunt exp-world");
  const header=el("header","trail-head"),title=el("h2"),body=el("div","exp-body"),status=el("p","exp-status");
  title.id="modalTitle";status.setAttribute("role","status");
  const lang=button("",()=>{changeLanguage();render();},"trail-lang");header.append(title,lang);world.append(header,body,status);root.append(world);
  let region=data.region,view="map",token=0,frame=null,last=null,chosen=[],shownClue=-1;
  let visitor={x:.50,y:.78},destination=null,arrive=null,face=1,walkTime=0,shot=null,reviewFrom="atlas",kept=false;
  let lens=.50,exposure=0,lastPose=null;
  const btn=(text,fn,main=false)=>button(text,fn,main?"trail-main":"trail-sub");
  const guardian=()=>pick(allRegions[region].legend);
  const setStatus=text=>{status.textContent=text;};
  const save=()=>{if(!persist())setStatus(t("Progress will last for this session only.","El progreso durará solo esta sesión."));};
  const isCalm=()=>reduced||(data.assist??steady);
  const nr=(n,total)=>n+"/"+total;
  function go(next){
   view=next;destination=null;arrive=null;render();
   body.querySelector("[data-focus]")?.focus({preventScroll:true});
  }
  function heading(text){const h=el("h3","exp-heading",text);h.tabIndex=-1;h.dataset.focus="";return h;}
  function nav(...items){const bar=el("nav","exp-nav");for(const [label,fn] of items)bar.append(btn(label,fn));body.append(bar);}
  function pickMap(i){
   region=i;data.region=i;visitor={x:.50,y:.78};shownClue=-1;save();go("map");
  }
  function asset(node,filename){node.style.backgroundImage='url("assets/'+filename+'.webp")';}
  function atlas(){
   const count=seals(data);
   body.append(heading(t("Trail atlas","Atlas de senderos")),el("p","exp-copy",t("Photograph the three guardians to open the Sky Gate.","Fotografía a los tres guardianes para abrir la Puerta del cielo.")));
   const grid=el("div","exp-atlas");
   allRegions.forEach((r,i)=>{
    const locked=i===3&&count<3;
    const b=button("",()=>{if(i===3){region=3;go("gate");}else pickMap(i);},"exp-tile");
    asset(b,i===3?r.card:"expedition-"+r.key);b.disabled=locked;
    const label=el("span","exp-tile-label");label.append(el("strong","",pick(r.title)));
    const detail=data.photos[i]?"★".repeat(data.photos[i].stars):i===3?nr(count,3)+" "+t("guardian seals","sellos de guardián"):
     data.lit[i]?t("Guardian sighted","Guardián a la vista"):nr(Number(!!(data.clues[i]&1))+Number(!!(data.clues[i]&2)),2)+" "+t("clues","pistas");
    label.append(el("small","",detail));b.append(label);b.setAttribute("aria-label",pick(r.title)+" · "+detail);grid.append(b);
   });
   body.append(grid);
   nav([t("Photo album","Álbum de fotos"),()=>go("album")],[t("Hunting lodge","Refugio de cacería"),onLodge]);
  }
  const coord=(node,x,y)=>{node.style.left=x*100+"%";node.style.top=y*100+"%";};
  function map(){
   const r=routes[region],stage=el("div","exp-map");
   asset(stage,"expedition-"+r.key);stage.style.setProperty("--exp-accent",r.color);
   stage.tabIndex=0;stage.setAttribute("role","group");stage.setAttribute("aria-label",t("Trail map. Tap to walk or use the arrow keys.","Mapa del sendero. Toca para caminar o usa las flechas."));
   const labels=r.sites.map(site=>pick(site.slice(0,2)));
   const hud=el("div","exp-map-hud");hud.append(heading(pick(r.title)),el("span","",nr(seals(data),3)+" "+t("seals","sellos")));stage.append(hud);
   const walker=el("span","exp-walker");walker.setAttribute("aria-hidden","true");const explorer=el("i","exp-avatar");walker.append(explorer);
   const friend=data.photos[3]?el("i","exp-friend"):null;if(friend)walker.append(friend);
   function showWalker(){
    coord(walker,visitor.x,visitor.y);walker.style.setProperty("--facing",face);
    walker.classList.toggle("walking",!!destination&&!reduced);
   }
   function walk(x,y,done){
    // Leave the dense forest and the cliff edges outside the traversable clearing.
    destination={x:clamp(x,.11,.89),y:clamp(y,.19,.88)};arrive=done;face=destination.x>=visitor.x?1:-1;
    if(reduced){visitor={...destination};finishWalk();}else showWalker();
   }
   function finishWalk(){const done=arrive;destination=null;arrive=null;showWalker();if(done)done();}
   function toSite(i){
    const site=r.sites[i];setStatus(t("Walking to ","Rumbo a ")+labels[i]);
    walk(site[2]+(site[2]>.65?-.045:.055),site[3]+.085,()=>{
     if(i<2){
      const fresh=noteClue(data,region,i);shownClue=i;if(fresh)beep([508,679,847],.06);
      render();setStatus(pick(r.clues[i]));if(fresh)save();
     }else if(data.lit[region])startCamera();
     else if(data.clues[region]===3){chosen=[];go("runes");}
     else setStatus(t("Two clues reveal the order of the lantern signs.","Dos pistas revelan el orden de los signos del farol."));
    });
   }
   for(let i=0;i<3;i++){
    const visited=i<2?!!(data.clues[region]&(1<<i)):data.lit[region];
    const b=button("",()=>toSite(i),"exp-pin"+(visited?" found":"")+(i===2?" shrine":""));
    b.setAttribute("aria-label",labels[i]);b.title=labels[i];
    b.append(el("i","",i===2?"✦":visited?"✓":"◇"));coord(b,r.sites[i][2],r.sites[i][3]);stage.append(b);
   }
   let wisp=null;
   function wispPosition(){
    const phase=reduced?0:walkTime/2400;
    return {x:r.wisp[0]+.045*Math.sin(phase),y:r.wisp[1]+.022*Math.cos(phase)};
   }
   function collectWisp(){
    const p=wispPosition();setStatus(t("Following the wisp…","Siguiendo al destello…"));walk(p.x,p.y,()=>{
     data.wisps[region]=true;beep([660,880,1108],.07);render();
     setStatus(gold(data)?t("All three wisps found! Your photos now have a gold frame.","¡Hallaste los tres destellos! Tus fotos ya tienen un marco dorado."):t("Wisp found! Collect one in each habitat for a gold photo frame.","¡Hallaste un destello! Encuentra uno en cada hábitat para conseguir un marco dorado."));save();
    });
   }
   if(!data.wisps[region]){
    wisp=button("✧",collectWisp,"exp-wisp");wisp.setAttribute("aria-label",t("Follow the wandering wisp","Seguir al destello viajero"));
    const p=wispPosition();coord(wisp,p.x,p.y);stage.append(wisp);
   }
   const wildlifeButtons=[];
   function wildName(i){return pick(TrailHunt.animals[region*3+i].slice(1));}
   function animalPose(i){
    const clock=reduced?(i+1)*1500:walkTime+(i+1)*1700;
    const pose=TrailField.motion(region*3+i,clock);
    return {x:(i?.54:.26)+.27*pose.x,y:(i?.46:.57)+.025*Math.sin(clock/830+i),lift:reduced?0:pose.lift*.23};
   }
   function locateAnimal(i,record){
    const p=animalPose(i);coord(record.node,p.x,p.y);
    if(!reduced&&Math.abs(p.x-record.x)>.00002)record.art.style.setProperty("--face",p.x>record.x?1:-1);
    record.art.style.setProperty("--lift",(-p.lift)+"px");record.x=p.x;
   }
   for(let i=0;i<2;i++){
    const b=button("",()=>{
     const p=animalPose(i);walk(p.x,p.y+.065,()=>{
      const fresh=!(data.seen[region]&(1<<i));data.seen[region]|=1<<i;
      if(fresh)beep([525,700],.06);render();setStatus(wildName(i)+" · "+pick(wildlife[region][i]));if(fresh)save();
     });
    },"exp-wild");
    const name=wildName(i);b.setAttribute("aria-label",t("Observe ","Observar a ")+name);b.title=name;
    const art=el("span","trail-sprite");art.style.backgroundPosition=i*50+"% "+region*50+"%";b.append(art);
    const record={node:b,art,x:animalPose(i).x};locateAnimal(i,record);wildlifeButtons.push(record);stage.append(b);
   }
   stage.append(walker);showWalker();
   stage.onclick=e=>{
    if(e.target.closest("button"))return;
    const b=stage.getBoundingClientRect();walk((e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height,null);
   };
   stage.onkeydown=e=>{
    if(e.target!==stage)return;
    const delta={ArrowLeft:[-.07,0],ArrowRight:[.07,0],ArrowUp:[0,-.09],ArrowDown:[0,.09]}[e.key];
    if(delta){e.preventDefault();const origin=destination??visitor;walk(origin.x+delta[0],origin.y+delta[1],null);}
   };
   body.append(stage);
   const count=Number(!!(data.clues[region]&1))+Number(!!(data.clues[region]&2));
   const next=(data.clues[region]&1)===0?0:(data.clues[region]&2)===0?1:2;
   const quest=el("div","exp-objective");
   quest.append(el("small","",data.photos[region]?t("Guardian photographed","Guardián fotografiado"):t("Lantern quest","Misión del farol")),
    el("strong","",count<2?t("Find the two carvings","Encuentra las dos marcas"):!data.lit[region]?t("Wake the lantern","Despierta el farol"):t("Look for ","Busca a ")+guardian()),
    el("p","",count===0?pick(r.story):count<2?t("The second carving holds the other half of the song.","La segunda marca guarda la otra mitad de la canción."):t("Visit the lantern at ","Visita el farol de ")+labels[2]+"."));
   const row=el("div","exp-action-row");row.append(btn(t("Walk to ","Caminar a ")+labels[next],()=>toSite(next),true));
   if(wisp&&data.photos[3])row.append(btn(t("Call Starwing","Llamar al grifo"),collectWisp));
   else if(wisp&&data.seen[region]===3)row.append(btn(t("Follow the wisp trail","Seguir el rastro del destello"),collectWisp));
   quest.append(row);body.append(quest);
   if(count||data.seen[region]){
    const notes=el("details","exp-notes");notes.open=shownClue>=0;
    notes.append(el("summary","",t("Field notes","Notas de campo")+" · "+nr(count,2)));
    for(let i=0;i<2;i++)if((data.clues[region]&(1<<i))!==0)notes.append(el("p","",pick(r.clues[i])));
    for(let i=0;i<2;i++)if(data.seen[region]&(1<<i))notes.append(el("p","",wildName(i)+" · "+pick(wildlife[region][i])));
    body.append(notes);
   }
   nav([t("Trail atlas","Atlas de senderos"),()=>go("atlas")],[t("Photo album","Álbum de fotos"),()=>go("album")],[t("Hunting lodge","Refugio de cacería"),onLodge]);
   frame=dt=>{
    walkTime+=dt;
    if(!reduced)wildlifeButtons.forEach((animal,i)=>locateAnimal(i,animal));
    if(wisp&&!reduced){const p=wispPosition();coord(wisp,p.x,p.y);}
    if(!destination)return;
    const dx=destination.x-visitor.x,dy=destination.y-visitor.y;
    const dist=Math.hypot(dx,dy*.68),step=dt*.00055;
    if(dist<=step||dist<.001){visitor={...destination};finishWalk();}
    else{visitor.x+=dx*step/dist;visitor.y+=dy*step/dist;showWalker();}
   };
  }
  function runes(){
   const r=routes[region],altar=el("div","exp-altar");asset(altar,"expedition-"+r.key);
   altar.append(heading(t("Lantern song","Canción del farol")));
   const slots=el("div","exp-slots");slots.setAttribute("aria-label",t("Signs lit","Signos encendidos"));
   for(let i=0;i<3;i++)slots.append(el("span",i<chosen.length?"on":"",i<chosen.length?r.glyphs[chosen[i]][0]:"·"));
   altar.append(slots);body.append(altar);
   body.append(el("p","exp-copy",t("Light the signs in the order described by the two carvings.","Enciende los signos en el orden que indican las dos marcas.")));
   const clues=el("ul","exp-hints");r.clues.forEach(c=>clues.append(el("li","",pick(c))));body.append(clues);
   const keys=el("div","exp-keys");
   r.glyphs.forEach(([icon,en,es],id)=>{
    const key=btn(icon+" "+t(en,es),()=>{
     if(id!==r.order[chosen.length]){
      chosen=[];beep([290,224],.08);render();setStatus(t("The lantern flickered. Read the first clue and try again.","El farol parpadeó. Lee la primera pista e inténtalo otra vez."));return;
     }
     chosen.push(id);beep([[450,620,825][chosen.length-1]],.08);
     if(light(data,region,chosen)){save();startCamera();return;}
     render();setStatus(nr(chosen.length,3)+" "+t("signs lit","signos encendidos"));
    });
    key.setAttribute("aria-label",t(en,es));key.disabled=chosen.includes(id);keys.append(key);
   });
   body.append(keys);nav([t("Back to trail","Volver al sendero"),()=>go("map")]);
  }
  function gate(){
   const cover=el("div","exp-cover");asset(cover,"expedition-starwing");
   cover.append(heading(guardian()));body.append(cover);
   body.append(el("p","exp-copy",data.photos[3]?
    t("Starwing knows your call. On the trails, your companion can guide you to wandering wisps.","Tu grifo reconoce tu llamado. En los senderos te puede guiar hasta los destellos viajeros."):
    t("Three lanterns shine below the clouds. A griffin circles the gate. Photograph it and it will join Nico on the trails.","Tres faroles brillan bajo las nubes. Un grifo rodea la puerta. Fotografíalo y acompañará a Nico por los senderos.")));
   body.append(btn(t("Meet Starwing","Conocer al grifo"),startCamera,true));nav([t("Trail atlas","Atlas de senderos"),()=>go("atlas")]);
  }
  function startCamera(){exposure=0;lens=.5;lastPose=null;go("camera");}
  function camera(){
   const request=token,caption=heading(t("Photograph ","Fotografía a ")+guardian()),field=el("div","exp-viewfinder");
   const canvas=ExpeditionPhoto.createCanvas();canvas.setAttribute("role","img");canvas.setAttribute("aria-label",guardian());field.append(canvas);
   const glow=el("span","exp-pose");field.append(glow);body.append(caption,field);
   body.append(el("p","exp-copy",t("Slide the frame onto the guardian. Take the photo when it glows for three stars.","Desliza el encuadre hasta el guardián. Toma la foto cuando brille para ganar tres estrellas.")));
   const slider=el("input","exp-slider");slider.type="range";slider.min="10";slider.max="90";slider.step="1";slider.value=String(lens*100);slider.setAttribute("aria-label",t("Aim camera","Apuntar cámara"));body.append(slider);
   let art=null,paintTime=1000,dirty=true;
   function aim(x){lens=clamp(x,.10,.90);slider.value=String(Math.round(lens*100));dirty=true;update(0);}
   slider.oninput=()=>aim(Number(slider.value)/100);
   let pointer=null;
   const point=e=>{const b=field.getBoundingClientRect();aim((e.clientX-b.left)/b.width);};
   field.onpointerdown=e=>{if(e.button!==0||!e.isPrimary)return;pointer=e.pointerId;field.setPointerCapture(pointer);point(e);};
   field.onpointermove=e=>{if(pointer===e.pointerId)point(e);};
   field.onpointerup=field.onpointercancel=()=>{pointer=null;};
   const bar=el("div","exp-action-row");
   const shutter=btn(t("Take photo","Tomar foto"),()=>{
    if(!art||!lastPose)return;
    const result=ExpeditionPhoto.capture(lastPose,lens);
    if(!result){setStatus(t("The guardian was outside the frame. Follow it and try again.","El guardián quedó fuera del encuadre. Síguelo e inténtalo otra vez."));beep([240],.05);return;}
    shot=result;kept=keep(data,region,shot);reviewFrom="camera";beep([750,1030],.055);go("print");save();
   },true);
   shutter.disabled=true;
   const assist=el("label","exp-easy"),check=el("input");check.type="checkbox";check.checked=isCalm();check.disabled=reduced;
   check.onchange=()=>{data.assist=check.checked;dirty=true;update(0);save();};
   assist.append(check,document.createTextNode(t("Still pose","Pose quieta")));bar.append(shutter,assist);body.append(bar);
   nav([t("Trail atlas","Atlas de senderos"),()=>go("atlas")]);
   const load=()=>{
    setStatus(t("Opening camera…","Abriendo la cámara…"));
    ExpeditionPhoto.load(region).then(result=>{
     if(request!==token)return;art=result;dirty=true;update(0);shutter.disabled=false;setStatus("");
    }).catch(()=>{
     if(request!==token)return;
     setStatus(t("The camera artwork could not load.","No se pudo cargar la imagen de la cámara."));
     const retry=btn(t("Retry camera","Reintentar cámara"),()=>{retry.remove();load();});bar.prepend(retry);
    });
   };
   function update(dt){
    if(!isCalm())exposure+=dt;
    paintTime+=dt;
    if(!art||(!dirty&&(isCalm()||paintTime<33)))return;paintTime=0;dirty=false;
    lastPose=ExpeditionPhoto.moment(region,exposure,isCalm());
    ExpeditionPhoto.draw(canvas,art,region,lastPose,lens);
    const label=lastPose.glow?t("Star pose","Pose estelar"):t("In motion","En movimiento");
    if(glow.textContent!==label)glow.textContent=label;
    glow.classList.toggle("glow",lastPose.glow);
   }
   frame=update;load();
  }
  function album(){
   body.append(heading(t("Nico’s photo album","Álbum de fotos de Nico")));
   const total=data.photos.filter(Boolean).length;
   body.append(el("p","exp-copy",nr(total,4)+" "+t("portraits","retratos")+" · "+nr(data.wisps.filter(Boolean).length,3)+" "+t("wisps","destellos")+" · "+nr(data.seen.reduce((n,v)=>n+Number(!!(v&1))+Number(!!(v&2)),0),6)+" "+t("wildlife sightings","avistamientos")));
   const grid=el("div","exp-album");
   allRegions.forEach((r,i)=>{
    const photo=data.photos[i],entry=button("",()=>{region=i;shot=photo;reviewFrom="album";go("print");},"exp-album-item");
    entry.disabled=!photo;entry.setAttribute("aria-label",pick(r.legend));
    const cover=el("span","exp-album-img");asset(cover,r.card);entry.append(cover);
    entry.append(el("strong","",pick(r.legend)),el("small","",photo?"★".repeat(photo.stars):t("Undiscovered","Por descubrir")));grid.append(entry);
   });
   body.append(grid);nav([t("Trail atlas","Atlas de senderos"),()=>go("atlas")],[t("Hunting lodge","Refugio de cacería"),onLodge]);
  }
  function print(){
   const request=token,photo=shot;
   body.append(heading(guardian()));
   const canvas=ExpeditionPhoto.createCanvas();
   canvas.setAttribute("role","img");canvas.setAttribute("aria-label",t("Photograph of ","Fotografía de ")+guardian());
   const mount=el("figure","exp-print");mount.append(canvas);
   mount.append(el("figcaption","",guardian()+" · "+"★".repeat(photo.stars)+"☆".repeat(3-photo.stars)));body.append(mount);
   if(reviewFrom==="camera"){
    const message=region===3?t("Starwing is now Nico’s trail companion.","Ahora el grifo acompaña a Nico en los senderos."):
     pick(routes[region].title)+" · "+t("Guardian seal earned","Sello de guardián conseguido");
    body.append(el("p","exp-reward",message));
    body.append(el("p","exp-copy",kept?t("This shot is in your album.","Esta foto está en tu álbum."):t("Your album keeps the highest-rated shot. You can save this one too.","Tu álbum conserva la foto con más estrellas. También puedes guardar esta.")));
   }
   const row=el("div","exp-action-row");
   if(reviewFrom==="camera"){
    const next=routes.findIndex((_,i)=>!data.photos[i]);
    if(next!==-1)row.append(btn(t("Explore ","Explorar ")+pick(routes[next].title),()=>pickMap(next),true));
    else if(region!==3&&!data.photos[3])row.append(btn(t("Open the Sky Gate","Abrir la Puerta del cielo"),()=>{region=3;go("gate");},true));
    else if(region===3)row.append(btn(t("Walk with Starwing","Caminar con el grifo"),()=>pickMap(data.region),true));
   }
   const download=el("a","trail-sub exp-download",t("Save photo (PNG)","Guardar foto (PNG)"));
   download.download="nico-"+["moon-stag","aurora-lynx","sun-jaguar","starwing-griffin"][region]+".png";
   download.setAttribute("aria-disabled","true");row.append(download);body.append(row);
   const develop=()=>ExpeditionPhoto.load(region).then(art=>{
    if(request!==token)return;
    ExpeditionPhoto.draw(canvas,art,region,photo,photo.aim,{print:true,gold:gold(data)});
    // A normal download link also works on touch devices without a camera permission prompt.
    canvas.toBlob(blob=>{
     if(!blob||request!==token)return;
     const url=URL.createObjectURL(blob);download.href=url;download.removeAttribute("aria-disabled");
     photoUrl=url;
    },"image/png");
   }).catch(()=>{
    if(request!==token)return;
    setStatus(t("The photograph could not be developed.","No se pudo revelar la foto."));
    const retry=btn(t("Retry photo","Reintentar foto"),()=>{retry.remove();develop();});row.append(retry);
   });
   develop();
   nav([t("Retake photo","Volver a tomar foto"),startCamera],[t("Photo album","Álbum de fotos"),()=>go("album")],[t("Trail atlas","Atlas de senderos"),()=>go("atlas")]);
  }
  let photoUrl=null;
  function clearUrl(){if(photoUrl){URL.revokeObjectURL(photoUrl);photoUrl=null;}}
  // Closing the parent dialog or switching to the lodge also retires an outstanding download.
  const dialog=root.closest("dialog");
  const cleanup=()=>{++token;clearUrl();observer.disconnect();dialog?.removeEventListener("close",cleanup);};
  const observer=new MutationObserver(()=>{if(!world.isConnected)cleanup();});
  observer.observe(root,{childList:true});
  dialog?.addEventListener("close",cleanup,{once:true});
  function render(){
   token++;frame=null;last=null;clearUrl();body.replaceChildren();setStatus("");
   title.textContent=t("Starlight Expedition","Expedición estelar");
   lang.textContent=t("ES","EN");lang.setAttribute("aria-label",t("Cambiar a español","Switch to English"));
   world.dataset.expedition=view;
   ({map,atlas,runes,gate,camera,album,print})[view]();
  }
  render();
  return now=>{const dt=last===null?0:clamp(now-last,0,100);last=now;frame?.(dt);};
 }
 return {routes,clean,noteClue,light,keep,seals,gold,open};
})();
