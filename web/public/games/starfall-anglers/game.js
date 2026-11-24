"use strict";
(() => {
 const $=id=>document.getElementById(id), {places,fish}=Waters;
 const baseKey="nicos-world.starfall-anglers.v1";
 let key=baseKey,raw=null,worldLanguage;
 try{
  const world=JSON.parse(localStorage.getItem("nicos-world-local-save-v4"));
  const player=world?.profiles?.find(profile=>profile.id===world.activeProfileId);
  if(player){
   key=baseKey+"."+player.id;
   worldLanguage=player.language;
   // A first visit via the direct game URL can precede creation of a world profile.
   const guest=localStorage.getItem(baseKey);
   if(guest!==null && localStorage.getItem(key)===null){
    localStorage.setItem(key,guest);
    localStorage.removeItem(baseKey);
   }
  }
  raw=JSON.parse(localStorage.getItem(key));
 }catch{}
 const save=Waters.clean(raw);
 save.trails=TrailHunt.clean(raw?.trails);
 if(save.lang===null)save.lang=(worldLanguage||navigator.language).toLowerCase().startsWith("es")?1:0;
 const pick=a=>a[save.lang], tr=id=>pick(strings[id]), here=()=>places[save.place], total=()=>Object.values(save.records).reduce((a,r)=>a+r.n,0);
 const strings={
 hunting:["Hunting","Cacería"],
 recordBook:["Record Book","Libro de récords"],sharkBook:["Shark guide","Guía de tiburones"],legendGifts:["Legend charms","Amuletos legendarios"],legendGift:["Legend gift","Regalo legendario"],noCharm:["Charm removed","Amuleto retirado"],
 backArcade:["← Back to arcade","← Volver a la sala"],arcade:["GAME ARCADE","SALA DE JUEGOS"],fishing:["Fishing","Pescar"],guide:["Field guide","Guía de peces"],caught:["caught","capturas"],species:["species","especies"],nowFishing:["NOW FISHING","PESCANDO EN"],aim:["Tap the water to aim","Toca el agua para apuntar"],spots:["Fishing spots","Sitios de pesca"],landed:["Reeled in","Avance"],tension:["Line tension","Tensión del hilo"],statusReady:["Ready to cast","Listo para lanzar"],descReady:["Aim for the golden ripples to find rarer fish.","Apunta a las ondas doradas para encontrar peces raros."],cast:["Cast line","Lanzar"],flying:["Casting…","Lanzando…"],descFlying:["Your float is on its way.","El flotador ya va en camino."],waiting:["Watch the bobber","Mira el flotador"],descWaiting:["Wait until it dips under. Then set the hook!","Espera a que se hunda. ¡Entonces engancha!"],waitBtn:["Waiting…","Esperando…"],nibble:["A little nibble…","Un mordisquito…"],bite:["Fish on!","¡Ya picó!"],descBite:["Swipe up on the water or tap Set hook!","Desliza hacia arriba en el agua o toca ¡Enganchar!"],hook:["Set hook!","¡Enganchar!"],reel:["Hold to reel","Mantén para recoger"],release:["Ease off!","¡Afloja!"],fightTitle:["Bring it in","Acércalo"],fightHint:["Hold to reel. Let go when the line gets tight.","Mantén para recoger. Suelta si se tensa el hilo."],run:["It’s pulling!","¡Está jalando!"],runHint:["Ease off the reel to loosen the line.","Suelta el botón para aflojar el hilo."],escaped:["It got away","Se escapó"],escMiss:["The fish let go. Another cast, another chance.","El pez se soltó. Puedes intentarlo otra vez."],escLine:["The line snapped. Ease off sooner next time.","Se rompió el hilo. Suelta un poco antes la próxima vez."],catchTitle:["Catch landed!","¡Lo atrapaste!"],catchHint:["Your catch is in the field guide.","Tu captura está en la guía de peces."],reeling:["Tap to pause","Toca para pausar"],returning:["Swimming home","Vuelve al agua"],returned:["Your field guide keeps the discovery.","Tu guía conserva el descubrimiento."],again:["Cast again","Volver a lanzar"],here:["Fishing here","Estás aquí"],visit:["Travel here","Viajar aquí"],opened:["open","abiertos"],help:["How to play","Cómo jugar"],close:["Close","Cerrar"],soundOn:["Turn sound on","Activar sonido"],soundOff:["Mute sound","Silenciar"],swapAim:["Aim at the golden ring","Apuntar al anillo dorado"],common:["Common","Común"],uncommon:["Uncommon","Poco común"],rare:["Rare","Raro"],legend:["Legendary","Legendario"],newSpecies:["New discovery","Nueva especie"],repeat:["Catch landed","Pez atrapado"],best:["Personal best","Récord personal"],releaseFish:["Release fish","Soltar pez"],found:["discovered","descubiertas"],unknown:["Undiscovered","Por descubrir"],mystery:["Mystery fish","Pez misterioso"],backGuide:["Back to guide","Volver a la guía"],journalIntro:["Select a fish to see its field notes.","Elige un pez para ver sus notas de campo."],guideDone:["You’ve discovered every species in all ten waters!","¡Descubriste todas las especies de los diez sitios!"],calm:["Gentle fishing","Pesca tranquila"],calmHint:["Bites wait for you and your line stays strong.","El pez espera y el hilo resiste los jalones."],help1:["Aim and cast","Apunta y lanza"],how1:["Tap the lake to choose a spot. The golden rings mark feeding fish.","Toca el lago para elegir un lugar. Los anillos dorados marcan dónde comen los peces."],help2:["Watch for the bite","Espera a que pique"],how2:["A nibble makes the float wiggle. When it plunges and “Fish on!” appears, set the hook.","Si mordisquea, el flotador tiembla. Cuando se hunda y veas «¡Ya picó!», engancha."],help3:["Play the fish","Sigue al pez"],how3:["Hold the reel to bring the fish closer. Release to lower tension. A quick tap also switches reeling on or off.","Mantén el botón para acercar el pez. Suéltalo para aflojar el hilo. Un toque corto también activa o pausa el carrete."],keys:["Keyboard: aim with the arrow keys. Space casts, hooks, and reels.","Con teclado: apunta con las flechas. La barra espaciadora lanza, engancha y recoge."],go:["Let’s fish","A pescar"],locked:["Unexplored water","Agua por explorar"],travel:["Travel","Viajar"],keep:["Keep fishing","Seguir pescando"],leaveCast:["Leave this cast?","¿Dejar este lance?"],moveHint:["Your current fish will swim away.","El pez de este lance se irá nadando."],chooseSpot:["Choose a fishing spot","Elige un sitio"],progress:["Guide progress","Progreso de la guía"],allGuide:["Field guide complete!","¡Guía completa!"],notSaved:["Progress is only available in this session.","El progreso solo estará disponible en esta sesión."],current:["Current spot","Sitio actual"]
 };
 Object.assign(strings,{
  trackAgain:["Track this legend again","Volver a rastrear la leyenda"],legendaryDive:["Legendary dive!","¡Se sumerge la leyenda!"],surgeHint:["Give it slack. Reel again after the dive.","Afloja el hilo. Recoge de nuevo cuando termine de sumergirse."],giveSlack:["Give slack","Aflojar"],photoSingular:["photo","foto"],
  album:["Photo album","Álbum de fotos"],noPhotos:["Open Dive cam and tap a swimming fish to take your first photo.","Abre la cámara submarina y toca un pez para tomar tu primera foto."],focusing:["Focusing…","Enfocando…"],underReady:["Photograph a swimmer or cast beside the golden sparks.","Fotografía un pez o lanza junto a los destellos dorados."],
  aquarium:["Aquarium","Acuario"],tackleBox:["Tackle box","Caja de pesca"],expedition:["Legend hunt","Busca la leyenda"],diveCam:["Dive cam","Cámara submarina"],surface:["Surface","Superficie"],shutter:["Take photo","Tomar foto"],beneath:["UNDERWATER","BAJO EL AGUA"],diveAim:["Tap a fish to photograph it","Toca un pez para fotografiarlo"],
  perfect:["On the ring!","¡En el anillo!"],tracked:["Legend on the line!","¡Picó la leyenda!"],photo:["Photo logged","Foto guardada"],photographed:["Photographed","Fotografiado"],firstCast:["Watch your lure","Observa tu señuelo"],underWait:["Watch the fish approach. Set the hook when it takes the lure.","Mira cómo se acerca. Engancha cuando muerda el señuelo."],underBite:["It took the lure. Set the hook now!","Mordió el señuelo. ¡Engancha ahora!"],
  clues:["clues","pistas"],nextCast:["Choose a lure for your next cast.","Elige un señuelo para tu siguiente lance."],equipped:["Equipped","En uso"],completed:["Expedition complete","Expedición completa"],huntIntro:["Follow the three clues to find this water’s legendary fish.","Sigue las tres pistas para encontrar al pez legendario de este lugar."],
  huntTitle:["Legend trail","Tras la leyenda"],clue1:["Catch three different species here","Atrapa tres especies distintas aquí"],clue2:["Land a fish from a golden ring","Atrapa un pez lanzando al anillo dorado"],clue3:["Catch a fish with","Atrapa un pez con"],legendReady:["The trail is open! Cast into the golden ring to meet the legend.","¡Ya tienes las pistas! Lanza al anillo dorado para encontrar a la leyenda."],markRing:["Aim at the ring","Apuntar al anillo"],clueEarn:["New legend clue","Nueva pista"],aquariumIntro:["Each of your six aquariums holds 24 fish.","Cada uno de tus seis acuarios tiene espacio para 24 peces."],tankEmpty:["Catch or photograph a fish to add its likeness here.","Atrapa o fotografía un pez para exhibir una copia animada aquí."],tankAdd:["Display in aquarium","Exhibir en el acuario"],tankRemove:["Remove from aquarium","Quitar del acuario"],tankFull:["Aquarium full · change display","Acuario lleno · cambiar exhibición"],tankSaved:["On display","En exhibición"],available:["Your discoveries","Tus descubrimientos"],setTank:["Aquarium habitat","Hábitat del acuario"],fresh:["Riverbed","Río"],reefHab:["Coral reef","Arrecife"],ice:["Ice cavern","Cueva de hielo"],photoOnly:["Camera discovery","Hallazgo con cámara"],startDiving:["Explore with dive cam","Explorar con la cámara"],photos:["photos","fotos"],reelWindow:["Reel now","Recoge ahora"],fishRun:["Fish is running","El pez se aleja"],speciesClue:["Species logged","Especies registradas"],gearHint:["Lure for this water","Señuelo de este sitio"],underHelp:["Switch to Dive cam to watch fish approach your lure. Before casting, tap a swimmer to photograph it. Your aquarium can display fish you’ve photographed or caught.","Usa la cámara submarina para ver cómo se acercan al señuelo. Antes de lanzar, toca un pez para tomarle una foto. Puedes exhibir en tu acuario los peces que fotografíes o atrapes."]
 });
 Object.assign(strings,{
  cupTitle:["Lantern Cup","Copa Farol"],cupMode:["2 players · 1 phone","2 jugadores · 1 teléfono"],otter:["Otter","Nutria"],heron:["Heron","Garza"],round:["Round","Ronda"],points:["pts","pts"],cupTie:["A tie! Share the cup.","¡Empate! Compartan la copa."],cupWins:["wins the cup!","gana la copa"],rematch:["Play a rematch","Jugar la revancha"],startCup:["Start the cup","Empezar la copa"],resumeCup:["Resume cup","Continuar copa"],pauseCup:["Pause cup","Pausar la copa"],pauseHint:["Completed turns are saved. You can replay an unfinished cast.","Se guardan los turnos terminados. Puedes repetir un lance pendiente."],sharedGentle:["Gentle fishing for both players","Pesca tranquila para ambos"],results:["See final scores","Ver resultados"],scorecard:["Final scores","Resultados"],playTurn:["Take the rod","Tomar la caña"],backLake:["Back to fishing","Volver a pescar"],backCast:["Continue this cast","Seguir con este lance"],passPhone:["Pass the phone to","Pásale el teléfono a"],
  cupRules:["Pick Otter or Heron. Each gets one cast per round for three rounds. Both players face the same fish, weight, lure and bite delay in each round.","Elijan Nutria o Garza. Cada quien tiene un lance por ronda durante tres rondas. En cada ronda, el pez, su peso, el señuelo y la espera son iguales para ambos."],pointRules:["Land a fish for 100 points. Earn up to 80 more for hitting the feeding ring, a well-timed power cast, a quick hook and two rod counters.","Atrapar un pez vale 100 puntos. Suma hasta 80 más por acertar al anillo, lanzar en la franja dorada, enganchar rápido y guiar la caña dos veces."],
  basePoints:["Fish landed","Pez atrapado"],aimPoints:["Feeding ring","Anillo dorado"],waitRun:["Watch for its next run","Espera su siguiente carrera"],quickHook:["Quick hook","Enganche rápido"],counterPoints:["Rod counters","Giros de caña"],powerCast:["Power cast","Lance preciso"],chargeHint:["Release in the gold band.","Suelta en la franja dorada."],releaseCast:["Release cast","Soltar lance"],chargeTitle:["Feel the rod load","Prepara el lance"],chargeTip:["Release in gold (61–81%). Arrow keys fine-tune power.","Suelta en dorado (61–81%). Las flechas ajustan la potencia."],sweet:["Perfect release!","¡Lance perfecto!"],shortCast:["Short cast","Lance corto"],longCast:["Deep cast","Lance profundo"],rodLeft:["Rod left","Caña a la izquierda"],rodRight:["Rod right","Caña a la derecha"],cueLeft:["Fish runs right · pull left","El pez va a la derecha · jala a la izquierda"],cueRight:["Fish runs left · pull right","El pez va a la izquierda · jala a la derecha"],turned:["Nice turn!","¡Buen giro!"],slipped:["It slipped past","Se te adelantó"],
  skillHelp:["Power cast starts a timing meter. Release in the gold band for a clean landing. During a run, pull the rod against the fish’s direction to gain line and lower tension. Left and right arrow keys also steer.","Lance preciso abre un medidor. Suelta en la franja dorada para acertar. Cuando el pez corra, mueve la caña al lado contrario para acercarlo y aflojar el hilo. También puedes usar las flechas del teclado."],keepsake:["Catch postcard","Postal de captura"],downloadCard:["Download postcard","Descargar postal"],cardTip:["On iPhone, you can also press and hold the picture to save it.","En iPhone también puedes mantener presionada la imagen para guardarla."],cardRetry:["The postcard didn’t load. Tap to try again.","La postal no cargó. Toca para volver a intentarlo."],cupGear:["Both players use the same tackle for this cup.","Los dos usan el mismo equipo durante la copa."]
 });
 Object.assign(strings,{
  guestShoal:["Resident shoal","Cardumen residente"],collectionTank:["Your exhibit","Tu exhibición"],
  waterwheel:["Waterwheel River","Río del Molino"],shipwreck:["Shipwreck Reef","Arrecife del Naufragio"],crystal:["Aurora Cavern","Caverna Boreal"],
  feedFish:["Feed fish","Dar comida"],watchFish:["Watch a fish","Observar un pez"],lights:["Lights","Luces"],motion:["Swimming","Movimiento"],
  residentHint:["These resident fish live here. Add a catch or a dive photo to exhibit your own discoveries.","Estos peces viven aquí. Agrega una captura o una foto submarina para exhibir tus propios hallazgos."],
  tankTouch:["Tap a fish to identify it, or tap the water to drop food.","Toca un pez para identificarlo o toca el agua para darle comida."],
  foodDrop:["Food in the water","Comida en el agua"],foodGone:["Feeding time is over","Terminó la comida"],keeper:["Choose your fish","Elegir tus peces"],
  personalTank:["Living aquarium","Acuario vivo"],visitTank:["Visit the aquarium","Visitar el acuario"],pausedTank:["Swimming paused","Movimiento en pausa"],
  swipeTip:["Swipe up on the water to set the hook. During a run, swipe against the fish or use the rod buttons.","Desliza hacia arriba en el agua para enganchar. Cuando el pez corra, desliza al lado contrario o usa los botones de la caña."]
 });
 Object.assign(strings,{
  fishNotes:["Field notes","Notas de campo"],gateOpen:["Gate open","Compuerta abierta"],selectHint:["Tap a swimmer or choose its portrait.","Toca un pez o elige su retrato."],selectAnimal:["Select fish","Elegir pez"],handFeed:["Hand-feed","Dar un bocado"],follow:["Follow me","Sígueme"],releaseOne:["Release","Soltar"],nameOne:["Name fish","Poner nombre"],meal:["treat eaten","bocado comido"],meals:["treats eaten","bocados comidos"],
  nickname:["Fish’s name","Nombre del pez"],saveName:["Save name","Guardar nombre"],cancelCare:["Cancel","Cancelar"],openGate:["Open the gate","Abrir la compuerta"],keepHere:["Keep here","Dejar aquí"],keepGuide:["Your field guide keeps the discovery.","Tu guía conserva el descubrimiento."],undoRelease:["Undo release","Deshacer liberación"],
  stockFish:["Add fish to your exhibit","Agregar peces a tu exhibición"],inviteResidents:["Invite released residents back","Invitar de vuelta a los residentes"],invite:["Add to tank","Agregar al acuario"],allResidents:["All residents are here.","Todos los residentes están aquí."],allExhibited:["All your discoveries are on display.","Ya exhibes todos tus hallazgos."],emptyResidents:["The residents have swum home. You can invite them back below.","Los residentes volvieron a casa. Puedes invitarlos de vuelta abajo."],emptyPersonal:["Your exhibit is empty. Add a discovery below or visit the resident shoal.","Tu exhibición está vacía. Agrega un hallazgo abajo o visita al cardumen residente."],
  feedShoal:["Feed the shoal","Alimentar al cardumen"],followHint:["Trace a path on the glass or use the arrow keys.","Traza una ruta en el cristal o usa las flechas del teclado."]
 });
 Object.assign(strings,{
  oceanFishing:["Ocean fishing","Pesca en el mar"],groundTitle:["Fishing ground","Zona de pesca"],freshRoute:["Freshwater","Agua dulce"],saltRoute:["Saltwater","Agua salada"],watersLabel:["Water type","Tipo de agua"],destination:["Destination","Destino"],
  saltRig:["Saltwater rig","Equipo de mar"],troll:["Troll from boat","Trolear desde la lancha"],trolling:["Trolling the wake","Troleando en la estela"],trollingHint:["Watch the lure behind the boat. Set the hook when the fish strikes.","Observa el señuelo detrás de la lancha. Engancha cuando pique el pez."],
  surfaceRig:["Surface","Superficie"],midRig:["Midwater","Media agua"],deepRig:["Deep","Profundo"],depthLabel:["Lure depth","Profundidad del señuelo"],
  flood:["Incoming tide","Marea entrante"],slack:["Slack tide","Marea en calma"],ebb:["Outgoing tide","Marea saliente"],
  saltReady:["Cast toward a feeding ring, or trail your lure behind the boat.","Lanza hacia un anillo dorado o arrastra el señuelo detrás de la lancha."],
  seaHelp:["At sea, pick a lure depth to target different fish. Match the active layer for faster bites. The game tide changes every two ocean catches. Cast at a golden ring to hunt a legend. Trolling improves your odds of finding roaming fish such as sierra and wahoo.","En el mar, elige la profundidad del señuelo para buscar distintos peces. Pican más rápido en la capa activa. La marea del juego cambia cada dos capturas marinas. Lanza al anillo para buscar una leyenda. Al trolear tienes más posibilidades de encontrar peces que recorren el mar, como la sierra y el peto."],
  mangroveLagoon:["Mangrove Lagoon","Laguna del Manglar"],lanternTrench:["Lantern Trench","Fosa de los Faroles"],
  bluePass:["Bluewater Pass","Paso de Altamar"],seaSpots:["Ocean fishing spots","Sitios de pesca en el mar"],inlandSpots:["Freshwater spots","Sitios de agua dulce"]
 });
 Object.assign(strings,{
  captain:["Captain Nico’s boat","La lancha del capitán Nico"],takeHelm:["Take the helm","Tomar el timón"],wildLog:["Wildlife journal","Cuaderno de fauna"],sighting:["Follow the legend","Seguir a la leyenda"],
  atAnchor:["At anchor","Anclado"],sailFrom:["Set sail from","Zarpar desde"],wildHint:["Steer toward a sign at sea. When an animal comes into view, open the wildlife camera and take a photo.","Navega hacia una señal en el mar. Cuando veas un animal, abre la cámara de fauna y toma una foto."]
 });
 save.voyage=Voyage.clean(raw?.voyage,Waters);
 save.cup=Lantern.restore(raw?.cup,Waters);
 let cupGentle=save.calm,cupPlaying=false,cupIndex=-1,challenge=null,powerLevel=0,powerOverride=null,shownSide="";
 let castSkills={ring:false,power:false,quick:false,counters:0};
 const discoveries=()=>fish.filter(f=>save.records[f.id]||save.photos[f.id]);
 const hintTier=[
 ["Look in the near-shore water below the golden rings.","Busca cerca de la orilla, debajo de las ondas doradas."],
 ["Try casting a little farther from the shore.","Lanza un poco más lejos de la orilla."],
 ["Aim for the deep water near the far bank.","Apunta al agua profunda cerca de la orilla de enfrente."],
 ["Land a cast inside the golden feeding rings for your best chance.","Lanza dentro de las ondas doradas para tener más posibilidades."]
 ];
 const rank=i=>tr(["common","uncommon","rare","legend"][i]);
 const weight=v=>new Intl.NumberFormat(save.lang?"es-MX":"en",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v)+" kg";
 const lockedText=n=>save.lang?"Se abre con "+n+" capturas":"Opens at "+n+" catches";
 const layerKeys=["surfaceRig","midRig","deepRig"],tideKeys=["flood","slack","ebb"];
 const lastWater={fresh:0,salt:places.findIndex(p=>p.id==="faro")};
 let seaPass=null,castSea=null;
 function ports(){
  const list=places.map((p,i)=>({p,i})).filter(({p})=>!!p.salt===!!here().salt);
  return list.sort((a,b)=>a.p.unlock-b.p.unlock);
 }
 function renderRoute(){
  lastWater[here().salt?"salt":"fresh"]=save.place;
  $("freshRoute").setAttribute("aria-pressed",String(!here().salt));$("saltRoute").setAttribute("aria-pressed",String(!!here().salt));
  $("waterTypes").setAttribute("aria-label",tr("watersLabel"));
  $("spotPicker").replaceChildren(...ports().map(({p,i})=>{const o=el("option","",pick(p.name)+(total()<p.unlock?" · "+lockedText(p.unlock):""));o.value=i;o.selected=i===save.place;return o;}));
 }
 function currentGround(){
  return here().grounds?.[save.grounds[here().id]||0];
 }
 function coastalRing(fallback){
  const ground=currentGround();
  return Voyage.anchorRing(save.voyage,here().id,ground?{...ground.ring}:fallback);
 }
 function renderGrounds(adjust){
  const block=$("groundPicker"),ground=currentGround();
  block.hidden=!ground;if(!ground)return;
  for(const [index,b] of Array.from($("groundOptions").children).entries()){
   const option=here().grounds[index];
   b.textContent=pick(option.name);b.setAttribute("aria-pressed",String(option===ground));b.disabled=!adjust;
  }
 }
 function renderSea(){
  $("seaConsole").hidden=!here().salt||cupPlaying;
  if($("seaConsole").hidden)return;
  const tide=Waters.seaTide(save.records),adjust=["ready","released","escape"].includes(phase);
  $("seaConsole").classList.toggle("line-out",!adjust);
  showText("tideState",tr(tideKeys[tide]));$("seaDepths").setAttribute("aria-label",tr("depthLabel"));
  for(const b of $("seaDepths").children){b.setAttribute("aria-pressed",String(Number(b.dataset.layer)===save.seaDepth));b.setAttribute("aria-label",tr("depthLabel")+" · "+tr(layerKeys[Number(b.dataset.layer)]));b.disabled=!adjust;}
  const mooring=Voyage.nearest(here().id,save.voyage.anchors[here().id]);
  const nearBite=mooring?(save.lang?" · En el ancla pican más en ":" · At anchor, try ")+tr(layerKeys[mooring.layer]):"";
  showText("tideHint",(save.lang?"Marea favorable · ":"Tide favors · ")+tr(layerKeys[tide])+nearBite);
  renderGrounds(adjust);
  const ground=currentGround();
  const c=Voyage.conditions(save.voyage,here().id);
  const targets=Waters.pools[save.place].filter(f=>Voyage.layer(f,Waters.layerOf(f.id),c)===save.seaDepth);
  const favorite=ground&&targets.find(f=>ground.fish.includes(f.id));
  $("seaTargetImg").hidden=!targets.length;
  if(targets.length)$("seaTargetImg").src="assets/"+(favorite||targets[0]).id+".png";
  showText("seaTargetText",!targets.length?(save.lang?"Prueba otra profundidad con este clima.":"Try another depth in these conditions."):favorite?
   (save.lang?"Pez objetivo · ":"Target fish · ")+pick(favorite.name):
   (save.lang?"A esta profundidad · ":"At this depth · ")+targets.slice(0,2).map(f=>pick(f.name)).join(" / "));
  $("troll").disabled=!adjust;
 }

 function el(tag,cls,value){const o=document.createElement(tag);if(cls)o.className=cls;if(value!=null)o.textContent=value;return o;}
 function iconSet(node,id){node.dataset.i=id;node.style.setProperty("--src",'url("assets/i-'+id+'.png")');}
 function icon(id){const o=el("i","ico");o.setAttribute("aria-hidden","true");iconSet(o,id);return o;}
 function actButton(word,fn,cls="primary"){const b=el("button",cls,word);b.type="button";b.addEventListener("click",fn);return b;}
 function showText(id,value){$(id).textContent=value;}
 const dialog=$("modal"),content=$("dialogContent"),scene=$("scene"),canvas=$("water"),action=$("action");
 let ctx=canvas.getContext("2d"),phase="ready",phaseTime=0,target={x:.49,y:.74},hot=coastalRing({x:.43,y:.72}),runningFish=null,fight=null,held=false,latched=false,pressStarted=null,catchInfo=null,loss="escMiss",modalKind="",returnedFocus=null,soundCtx=null,saveOK=true;
 let t=0,lastFrame=0,lastPaint=0,viewport={w:1,h:1,rodW:0,rodH:0,scale:1},announcement="",lastUi="",biteAfter=2.6,castAccuracy=1,renderedFight="",reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 let spool=0;
 let diving=false,castLure=save.lure,legendOn=false,replayLegend=false,toastTime=0;
 const getLure=id=>Waters.tackle.find(v=>v.id===id);
 const currentLegend=()=>Waters.legend(save.place,save.voyage.hunts[here().id]);
 const surveyed=()=>Waters.clues(save,save.place);
 let castPower={};
 const livePower=()=>cupPlaying?{}:(AnglerLog.equipped(save)?.effects||{});
 const ringScale=()=>["ready","released","escape","power"].includes(phase)?livePower().ring||1:castPower.ring||1;
 const onRing=()=>Math.hypot((target.x-hot.x)/.039,(target.y-hot.y)/.021)<=(castPower.ring||1);
 const sprites=new Map();
 function sprite(id){
  if(!sprites.has(id)){const img=new Image();img.src="assets/"+id+".png";sprites.set(id,img);}
  return sprites.get(id);
 }
 const isOpen=()=>dialog.open;
 function persist(){try{localStorage.setItem(key,JSON.stringify({...save,lang:save.lang?"es":"en"}));saveOK=true;}catch{saveOK=false;}return saveOK;}
 function say(s){if(s!==announcement){announcement=s;showText("announce",s);}}
 function beep(notes,duration=.08,shape="sine"){
  if(!save.sound)return;
  try{soundCtx||=new (window.AudioContext||window.webkitAudioContext)();if(soundCtx.state==="suspended")soundCtx.resume().catch(()=>{});
   for(let i=0;i<notes.length;i++){const start=soundCtx.currentTime+.012+i*duration,osc=soundCtx.createOscillator(),gain=soundCtx.createGain();osc.type=shape;osc.frequency.value=notes[i];gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.07,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+duration);osc.connect(gain);gain.connect(soundCtx.destination);osc.start(start);osc.stop(start+duration+.02);}
  }catch{}
 }
 let foamBuffer=null,nextAmbient=3,nextClick=0;
 function waterSound(duration,volume,frequency){
  if(!save.sound||!soundCtx||soundCtx.state!=="running")return;
  try{
   if(!foamBuffer){foamBuffer=soundCtx.createBuffer(1,soundCtx.sampleRate*2,soundCtx.sampleRate);const data=foamBuffer.getChannelData(0);let prev=0;
    for(let i=0;i<data.length;i++){prev=(prev+.15*(Math.random()*2-1))/.99;prev=Math.max(-.8,Math.min(.8,prev*.91));data[i]=prev;}}
   const src=soundCtx.createBufferSource(),filter=soundCtx.createBiquadFilter(),gain=soundCtx.createGain(),start=soundCtx.currentTime;
   src.buffer=foamBuffer;filter.type="lowpass";filter.frequency.setValueAtTime(frequency,start);filter.frequency.exponentialRampToValueAtTime(Math.max(150,frequency*.32),start+duration);
   gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(volume,start+duration*.12);gain.gain.exponentialRampToValueAtTime(.001,start+duration);
   src.connect(filter);filter.connect(gain);gain.connect(soundCtx.destination);src.start(start,Math.random()*.25);src.stop(start+duration+.01);
  }catch{}
 }
 function soundscape(){
  if(!save.sound||!soundCtx||soundCtx.state!=="running")return;
  if(t>=nextAmbient){
   nextAmbient=t+4.4+Math.random()*3.6;
   waterSound(diving?.66:1.3,diving?.055:.075,diving?650:1300+save.place*130);
  }
  if(phase==="fight"&&held&&t>=nextClick){nextClick=t+(fight.pulling?.13:.22);waterSound(.046,.19,2300);}
 }
 function vibrate(pattern){if(navigator.vibrate&&save.sound)navigator.vibrate(pattern);}
 function clearHold(){held=false;latched=false;pressStarted=null;action.classList.remove("held");}
 function setPhase(p){scene.classList.toggle("rod-gesture",p==="fight"||p==="bite");phase=p;phaseTime=0;lastUi="";renderState();}
 function stateText(){
  if(phase==="charge")return["chargeTitle","chargeTip","releaseCast","lure"];
  if(phase==="released")return["returning","returned","again","wave"];
  if(phase==="flight")return["flying","descFlying","flying","lure"];
  if(phase==="wait"&&seaPass)return["trolling","trollingHint","waitBtn","wave"];
  if(phase==="wait"&&diving)return["firstCast","underWait","waitBtn","bobber"];
  if(phase==="wait")return[phaseTime>biteAfter-.82?"nibble":"waiting","descWaiting","waitBtn","bobber"];
  if(phase==="bite")return["bite",diving?"underBite":"descBite","hook","fish"];
  if(phase==="fight"&&fight.burstLeft>0)return["legendaryDive","surgeHint",held?"giveSlack":"reel","wave"];
  if(phase==="fight"){const high=fight.tension>.68;return[high?"run":fight.pulling?"fishRun":"reelWindow",high?"runHint":"fightHint",high&&held?"release":latched?"reeling":"reel","fish"];}
  if(phase==="escape")return["escaped",loss,"again","wave"];
  if(phase==="catch")return["catchTitle","catchHint","again","fish"];
  return["statusReady",diving?"underReady":here().salt?"saltReady":"descReady","cast","bobber"];
 }
 function renderState(){
  const [title,desc,button,ic]=stateText(),signature=[save.lang,phase,title,button,held,latched,diving].join("|");
  if(signature!==lastUi){
   bwControls();if(phase!=="fight")$("speciesCue").hidden=true;
   $("openHelm").disabled=cupPlaying||!["ready","escape","released"].includes(phase);
   lastUi=signature;renderSea();showText("statusTitle",tr(title));showText("statusText",tr(desc));showText("actionText",tr(button));iconSet($("statusIcon"),ic);
   iconSet(action.querySelector(".ico"),phase==="fight"?"fish":phase==="bite"?"bobber":"lure");
   action.disabled=phase==="flight"||phase==="wait";if(phase==="fight")action.setAttribute("aria-pressed",String(held));else action.removeAttribute("aria-pressed");action.classList.toggle("held",held);
   $("aimHint").hidden=phase!=="ready"&&phase!=="escape";$("aimPad").disabled=$("aimHint").hidden;
   $("shutter").hidden=!diving||$("aimHint").hidden;
   $("fightHud").hidden=phase!=="fight";$("signal").hidden=phase!=="bite";
   if(phase==="bite")showText("signal",tr("bite"));
   scene.classList.toggle("surge",phase==="fight"&&fight?.burstLeft>0);
   say(tr(title).replace(/([^.?!…])$/, "$1.")+" "+tr(desc));
  }
  renderActionTools();
  if(phase==="fight"){
   const a=Math.round(fight.progress*100),b=Math.round(fight.tension*100),key=a+"/"+b;
   if(renderedFight!==key){renderedFight=key;showText("progressText",a+"%");showText("tensionText",b+"%");$("progressBar").style.width=a+"%";$("tensionBar").style.width=b+"%";$("tensionBar").style.background=b>68?"#ff987b":"#ffd477";}
  }
 }
 function redrawMap(){
  const root=$("mapCards");root.replaceChildren();
  const destinations=ports();destinations.forEach(({p,i})=>{
   const active=i===save.place,locked=p.unlock>total(),b=actButton("",()=>selectSpot(i),"spotcard"+(active?" current":""));
   if(active)b.setAttribute("aria-current","location");b.classList.toggle("locked",locked);
   const img=el("img","thumb");img.src="assets/map-"+p.id+".png";img.loading="lazy";img.decoding="async";img.alt="";
   const txt=el("span"),label=el("span","cardline");label.append(icon(active?"pin":locked?"lock":"wave"),document.createTextNode(active?tr("here"):locked?lockedText(p.unlock):tr("visit")));
   txt.append(el("strong","",pick(p.name)),label);if(!locked){const complete=Waters.clues(save,i).count===3&&Waters.legends(i).every(f=>save.records[f.id]);txt.append(el("small","map-progress",complete?"★ "+tr("completed"):discoveries().filter(f=>f.place===i).length+"/"+Waters.pools[i].length+" "+tr("found")));}b.append(img,txt);root.append(b);
  });showText("spotsTitle",tr(here().salt?"seaSpots":"inlandSpots"));showText("openCount",destinations.filter(({p})=>p.unlock<=total()).length+(save.lang?" de ":" of ")+destinations.length+(save.lang?" abiertos":" open"));
 }
 function renderCharm(){
  const active=AnglerLog.equipped(save),badge=$("activeCharm");
  badge.hidden=!active;badge.textContent=active?tr("equipped")+" · "+pick(active.name):"";
 }
 function renderAll(){
  renderCharm();
  document.documentElement.lang=save.lang?"es-MX":"en";document.querySelectorAll("[data-msg]").forEach(v=>v.textContent=tr(v.dataset.msg));
  document.querySelectorAll(".ico[data-i]").forEach(v=>iconSet(v,v.dataset.i));
  const title=pick(here().name);showText("locationName",title);showText("weather",pick(here().weather));iconSet($("weatherIcon"),here().icon);
  const c=here().salt?Voyage.conditions(save.voyage,here().id):null;
  const photo=diving?"assets/dive-"+Waters.habitats[save.place]+".png":c?Voyage.backdrop(here(),c):"assets/"+here().id+".png";if($("panorama").getAttribute("src")!==photo)$("panorama").src=photo;
  scene.className="scene "+here().id+(diving?" submerged":"")+(phase==="bite"||phase==="fight"?" rod-gesture":"");showText("statTotal",total());showText("statSpecies",discoveries().length+"/"+fish.length);
  if(c){
   scene.dataset.light=String(c.time);scene.classList.toggle("rainy",c.rain);
   showText("weather",pick(Voyage.times[c.time])+" · "+pick(Voyage.weather[+c.rain]));
   iconSet($("weatherIcon"),c.rain?"wave":c.time===2?"moon":"sun");
  }else delete scene.dataset.light;
  const port=here().salt?here():places[lastWater.salt];
  const mooring=save.voyage.anchors[port.id],mark=Voyage.nearest(port.id,mooring);
  showText("portReport",(mooring?tr("atAnchor"):tr("sailFrom"))+" · "+pick(port.name)+(mark?" · "+pick(mark.sign):""));
  $("lang").textContent=save.lang?"EN":"ES";$("lang").setAttribute("aria-label",save.lang?"Switch to English":"Cambiar a español");
  $("statTotal").nextElementSibling.textContent=save.lang&&total()===1?"captura":tr("caught");document.querySelector("nav.tabs").setAttribute("aria-label",save.lang?"Juego":"Game");
  const soundLabel=tr(save.sound?"soundOff":"soundOn");$("sound").title=soundLabel;$("sound").setAttribute("aria-label",soundLabel);$("sound").setAttribute("aria-pressed",String(save.sound));iconSet($("sound").firstElementChild,save.sound?"sound":"mute");
  $("help").title=tr("help");$("help").setAttribute("aria-label",tr("help"));$("closeModal").setAttribute("aria-label",tr("close"));$("tabGuide").setAttribute("aria-label",tr("guide"));$("aimPad").setAttribute("aria-label",tr("swapAim"));$("game").setAttribute("aria-label",tr("fishing"));
  const lure=equippedLure();$("powerMeter").setAttribute("aria-label",tr("powerCast"));
  showText("rigName",pick(getLure(lure).name));$("rigImg").src="assets/"+lure+".png";$("legendIcon").src="assets/"+currentLegend().id+".png";
  showText("expName",pick(currentLegend().name));showText("expCount",surveyed().count+"/3 "+tr("clues"));
  $("dive").setAttribute("aria-pressed",String(diving));$("dive").lastElementChild.textContent=tr(diving?"surface":"diveCam");
  $("aimHint").lastElementChild.textContent=tr(diving?"diveAim":"aim");scene.querySelector(".loc-label span").textContent=tr(diving?"beneath":"nowFishing");
  renderRoute();renderCupHud();$("tabTank").setAttribute("aria-label",tr("aquarium"));redrawMap();lastUi="";renderState();

 }
 function openModal(kind){
  if(!isOpen()){returnedFocus=document.activeElement;dialog.showModal();}
  clearHold();modalFrame=null;dialog.classList.remove("tank-expanded");dialog.classList.toggle("gallery-dialog",["tank","helm","wildlife","legend","hunting"].includes(kind));modalKind=kind;content.replaceChildren();dialog.scrollTop=0;
  $("tabGuide").classList.toggle("active",["guide","entry","album"].includes(kind));
  $("tabHunt").classList.toggle("active",kind==="hunting");
  $("tabTank").classList.toggle("active",kind==="tank");$("tabFish").classList.toggle("active",!["guide","entry","album","tank","hunting"].includes(kind));
  $("closeModal").focus({preventScroll:true});
 }
 function dismiss(){if(isOpen())dialog.close();}
 dialog.addEventListener("close",()=>{
  content.querySelector(".catch-film video")?.pause();
  $("tabHunt").classList.remove("active");
  if(location.hash==="#hunting")history.replaceState(history.state,"",location.pathname+location.search);
  if(modalKind==="net"&&catchInfo){setPhase("released");}
  if(modalKind==="catch"){suppressClick=false;hot=coastalRing({x:.19+Math.random()*.52,y:.62+Math.random()*.20});setPhase("released");}
  if(["cupResult","cup"].includes(modalKind)&&!cupPlaying&&["catch","escape"].includes(phase))resetReady();
  modalFrame=null;dialog.classList.remove("gallery-dialog","tank-expanded");modalKind="";$("tabTank").classList.remove("active");$("tabGuide").classList.remove("active");$("tabFish").classList.add("active");lastFrame=0;
  const focus=returnedFocus&&returnedFocus.isConnected&&!returnedFocus.disabled?returnedFocus:action;focus?.focus({preventScroll:true});
 });
 $("closeModal").onclick=dismiss;
 dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
 function heading(parent,title,kicker){if(kicker)parent.append(el("div","kicker",kicker));const h=el("h2","",title);h.id="modalTitle";parent.append(h);}
 // A landed legend earns its species film. The field guide uses the existing
 // catch record, so earlier catches and repeated plays need no extra save data.
 function catchFilm(f, onLanding=false){
  const group=el("figure","catch-film");
  const video=el("video");
  const title=pick(["Legendary catch clip","Video de la captura legendaria"]);
  video.setAttribute("aria-label",title+" · "+pick(f.name));
  video.width=512;
  video.height=288;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.autoplay=onLanding&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  video.preload=video.autoplay?"auto":"none";
  video.poster="clips/"+f.id+".webp";
  video.src="clips/"+f.id+".mp4";
  const bar=el("figcaption","film-bar");
  const label=el("span","film-label",title);
  const play=actButton("",()=>{
   if(!video.paused&&!video.ended){video.pause();return;}
   if(video.ended)video.currentTime=0;
   video.play().catch(()=>{if(!video.error)sync();});
  },"film-play");
  function sync(){
   const words=video.ended?["Replay clip","Repetir video"]:video.paused?["Play clip","Ver video"]:["Pause clip","Pausar video"];
   play.textContent=pick(words);
  }
  for(const event of ["play","pause","ended"])video.addEventListener(event,sync);
  video.addEventListener("error",()=>{
   label.textContent=pick(["Catch clip unavailable","Video de la captura no disponible"]);
   play.hidden=true;
  });
  sync();
  bar.append(label,play);
  group.append(video,bar);
  return group;
 }
 function portrait(f,masked){const frame=el("div","portrait"+(masked?" mystery":"")),img=el("img");img.alt="";img.src="assets/"+f.id+".png";frame.append(img);return frame;}
 function chips(values){const row=el("div","chips");for(const value of values)row.append(el("span","chip",value));return row;}
 function openBook(sharksOnly=false){
  openModal("log");heading(content,sharksOnly?tr("sharkBook"):tr("recordBook"),sharksOnly?tr("oceanFishing"):pick(["Personal best by species","Récord personal por especie"]));
  const go=(!cupPlaying&&["ready","released","escape"].includes(phase))?f=>{
   if(f.tier===3)save.voyage.hunts[places[f.place].id]=f.id;
   save.seaDepth=Waters.layerOf(f.id);
   const grounds=places[f.place].grounds,idx=grounds?.findIndex(g=>g.fish.includes(f.id))??-1;
   if(idx>=0)save.grounds[places[f.place].id]=idx;
   moveSpot(f.place);
  }:null;
  AnglerLog.fillBook({root:content,sharksOnly,save,pick,el,button:actButton,weight,depth:f=>tr(layerKeys[Waters.layerOf(f.id)]),go});
 }
 function giftCard(f,fresh){
  const gift=AnglerLog.gifts[f.id],card=el("section","legend-gift");
  card.append(el("small","",fresh?pick(["Gift unlocked","Regalo desbloqueado"]):tr("legendGift")),el("strong","",pick(gift.name)),el("p","",AnglerLog.describe(gift,save.lang)));
  const wear=actButton("",()=>{
   save.charm=save.charm===f.id?null:f.id;persist();renderCharm();
   if(modalKind==="gifts")showGifts(f.id);else syncButton();
   say(save.charm?pick(gift.name)+" · "+tr("equipped"):tr("noCharm"));
  },"theme");
  wear.dataset.gift=f.id;
  function syncButton(){
   const active=save.charm===f.id;
   wear.textContent=active?pick(["Unequip charm","Quitar amuleto"]):pick(["Equip charm","Equipar amuleto"]);
   wear.setAttribute("aria-pressed",String(active));
  }
  syncButton();card.append(wear);return card;
 }
 function showGifts(focusId){
  openModal("gifts");const earned=fish.filter(f=>f.tier===3&&save.records[f.id]);
  heading(content,tr("legendGifts"),earned.length+" / "+Object.keys(AnglerLog.gifts).length);
  content.append(el("p","",pick(["Equip one charm for your next cast. You keep gifts after releasing a fish. Lantern Cup uses its own tournament rules.","Equipa un amuleto para tu siguiente lance. Conservas los regalos al liberar un pez. La Copa Farol tiene sus propias reglas."])));
  if(!earned.length)content.append(el("p","reward",pick(["Land a legendary fish to unlock its charm.","Captura un pez legendario para desbloquear su amuleto."])));
  for(const f of earned){const card=giftCard(f,false);card.prepend(el("small","",pick(f.name)));content.append(card);}
  if(typeof focusId==="string")content.querySelector('[data-gift="'+focusId+'"]')?.focus({preventScroll:true});
 }
 function openGuide(){
  openModal("guide");const n=discoveries().length;
  heading(content,tr("guide"),n+"/"+fish.length+" "+tr("found"));content.append(el("p","",tr(n===fish.length?"guideDone":"journalIntro")));
  content.append(actButton(tr("recordBook"),()=>openBook(false),"display-button"),actButton(tr("sharkBook"),()=>openBook(true),"display-button"));
  content.append(actButton(tr("wildLog")+" · "+Object.keys(save.voyage.album).length+"/3",()=>showWildlife(openGuide),"display-button"));
  content.append(actButton(tr("album")+" · "+Object.keys(save.album).length,showAlbum,"display-button"));
  places.forEach((place,idx)=>{content.append(el("h3","guide-group",pick(place.name)));const grid=el("div","entries");
   fish.filter(f=>f.place===idx).forEach(f=>{const r=save.records[f.id],seen=r||save.photos[f.id],btn=actButton("",()=>showEntry(f),"entry"+(seen?"":" unknown"));
    const img=el("img");img.src="assets/"+f.id+".png";img.alt="";
    btn.append(img,el("span","",seen?pick(f.name):tr("unknown")),el("small","",r?weight(r.best):seen?tr("photographed"):rank(f.tier)));grid.append(btn);
   });content.append(grid);
  });
 }
 function showEntry(f){
  openModal("entry");const row=el("div","catch"),r=save.records[f.id],seen=r||save.photos[f.id];heading(row,seen?pick(f.name):tr("mystery"),pick(places[f.place].name));
  row.append(r&&f.tier===3?catchFilm(f):portrait(f,!seen),chips(r?[rank(f.tier),r.n+" "+(save.lang&&r.n===1?"captura":tr("caught")),pick(["Personal best","Récord personal"])+" · "+weight(r.best)]:seen?[rank(f.tier),tr("photographed")]:[rank(f.tier)]),el("p","",seen?pick(f.note):pick(hintTier[f.tier])));if(places[f.place].salt)row.append(chips([tr("saltRoute"),tr(layerKeys[Waters.layerOf(f.id)])]));if(save.album[f.id]){const image=el("img","journal-photo");image.src=save.album[f.id];image.alt=pick(f.name)+" · "+pick(places[f.place].name);row.append(image);}
  if(f.tier===3&&r)row.append(giftCard(f,false));
  if(seen)row.append(displayButton(f));if(r)row.append(postcardButton(f,r.best));row.append(actButton(tr("backGuide"),openGuide));content.append(row);
 }
 function showHelp(){
  openModal("help");heading(content,tr("help"),"Starfall Anglers");const ol=el("ol","help-steps");
  for(let i=1;i<=3;i++){const li=el("li");li.append(el("strong","",tr("help"+i)+". "),document.createTextNode(tr("how"+i)));ol.append(li);}
  content.append(ol,el("p","",tr("skillHelp")),el("p","",tr("swipeTip")),el("p","",tr("underHelp")),el("p","",tr("seaHelp")),el("p","",tr("keys")));const l=el("label","assist"),check=el("input");check.type="checkbox";check.checked=save.calm;check.onchange=()=>{save.calm=check.checked;persist();};
  l.append(check,el("strong","",tr("calm")));content.append(l,el("p","",tr("calmHint")),actButton(tr("go"),dismiss));
 }
 function moveSpot(i){upgrades.active=null;seaPass=null;castSea=null;fight=null;runningFish=null;replayLegend=false;save.place=i;persist();clearHold();target={x:.49,y:.75};hot=coastalRing({x:.38+.17*Math.random(),y:.61+.2*Math.random()});setPhase("ready");renderAll();if(isOpen())dismiss();scene.scrollIntoView({block:"nearest",behavior:reduced?"instant":"smooth"});beep([330,440],.095);}
 function selectSpot(i){
  if(cupPlaying){showCup();return;}
  if(i===save.place){if(phase==="ready")action.focus({preventScroll:true});return;}
  if(total()<places[i].unlock){
   openModal("locked");heading(content,pick(places[i].name),tr("locked"));const im=el("img","preview-lake");im.src="assets/"+places[i].id+".png";im.alt="";content.append(im,el("p","",lockedText(places[i].unlock)+". "+(save.lang?"Llevas ":"You have ")+total()+(save.lang?" capturas.":" catches.")),actButton(tr("keep"),dismiss));return;
  }
  if(["charge","flight","wait","bite","fight"].includes(phase)){
   openModal("travel");heading(content,tr("leaveCast"),pick(places[i].name));content.append(el("p","",tr("moveHint")),actButton(tr("travel"),()=>moveSpot(i)),actButton(tr("keep"),dismiss,"secondary"));return;
  }
  moveSpot(i);
 }
 function resetReady(){
  clearHold();runningFish=null;fight=null;seaPass=null;castSea=null;
  setPhase("ready");
 }
 function startCast(power=null,troll=false){
  castPower=livePower();netResult=null;scanSpent=false;
  castSea=here().salt&&!cupPlaying?Waters.seaRig(save.seaDepth,Waters.seaTide(save.records),troll,currentGround()):null;
  Voyage.applyRig(castSea,save.voyage,here());
  seaPass=troll&&castSea?{origin:{...target},direction:target.x<.50?1:-1}:null;
  const placement=Lantern.placement(power);
  if(power!==null)target={x:target.x,y:Math.max(.55,Math.min(.92,target.y+placement.drift))};
  castSkills={ring:!seaPass&&onRing(),power:placement.sweet,quick:false,counters:0};

  clearHold();castAccuracy=seaPass ? .09 : Math.hypot((target.x-hot.x)*1.25,target.y-hot.y);
  castLure=equippedLure();legendOn=!cupPlaying&&!seaPass&&onRing()&&((replayLegend&&save.voyage.legends[currentLegend().id])||(surveyed().count===3&&(replayLegend||!save.records[currentLegend().id])));replayLegend=false;
  runningFish=cupPlaying?Waters.cupFish(save.place,challenge):legendOn?currentLegend():Waters.choose(save.place,save.records,placement.sweet?castAccuracy*.55:castAccuracy,Math.min(1,Math.max(0,(.94-target.y)/.38)),Math.random,castLure,castSea,castPower);
  if(!cupPlaying&&!legendOn)runningFish=Bluewater.visitCandidate(runningFish,save.place,upgrades,lureWorked);
  lureWorked=false;
  if(legendOn||placement.sweet||castSkills.ring)toast(tr(legendOn?"tracked":placement.sweet?"sweet":"perfect"));
  else if(power!==null)toast(tr(placement.drift>0?"shortCast":"longCast"));
  biteAfter=cupPlaying?challenge.wait:(1.85+Math.random()*1.9+(castAccuracy>.18?.35:0))*getLure(castLure).bite*(castSea?.wait||1)*(seaPass?1.18:1)*(castPower.bite||1);setPhase("flight");beep([392,523],.075);
 }
 function strike(){if(phase!=="bite")return;castSkills.quick=phaseTime<=1.0;clearHold();fight={progress:castSkills.quick?.14:.08,tension:.16,age:0,tier:runningFish.tier,legend:!cupPlaying&&runningFish.tier===3?runningFish.id:null,pattern:(runningFish.tier+runningFish.place)%4,speed:getLure(castLure).speed*(castPower.reel||1),pull:getLure(castLure).pull*(castPower.pull||1)};renderedFight="";setPhase("fight");if(!cupPlaying&&save.charm)charmEffect(({greatwhite:"🦷",eclipseangler:"☾",crown:"♛",phoenix:"🔥",narwhal:"❄"})[save.charm]||"✦");if(castSkills.quick)toast(tr("quickHook"));beep([440,660,740],.055);vibrate(25);if(!cupPlaying&&runningFish.tier===3&&!save.voyage.legends[runningFish.id])showSighting(true);}
 function gotAway(why){loss=why;clearHold();const result=cupTurnResult(false);setPhase("escape");beep([330,220],.12);
  if(result){persist();renderAll();showTurnResult(result);}
 }
 function landed(){
  const f=runningFish,old=save.records[f.id],before=total(),kg=Math.round((f.min+(cupPlaying?challenge.size:AnglerLog.sizeRoll(Math.random(),castPower))*(f.max-f.min))*100)/100;
  const clueBefore=surveyed().count;
  const flags=save.surveys[here().id]||{ring:false,gear:false};
  if(castSkills.ring)flags.ring=true;if(castLure===Waters.rigs[save.place])flags.gear=true;save.surveys[here().id]=flags;
  const cupResult=cupTurnResult(true);
  const personal=AnglerLog.updateRecord(save.records,f,kg);persist();clearHold();setPhase("catch");renderAll();
  catchInfo={f,kg,personal,newFish:!old&&!save.photos[f.id],clue:surveyed().count>clueBefore,record:old&&kg>old.best,unlock:places.find(p=>p.unlock>before&&p.unlock<=before+1)};
  if(cupResult)showTurnResult(cupResult);else if(upgrades.crew.length===2)netGame();else showCatch();beep(f.tier===3?[392,494,587,740,784,988]:[392,494,587,784],.095);vibrate([20,35,35]);
 }
 function showCatch(){
  const {f,kg,newFish,record,unlock}=catchInfo;openModal("catch");const box=el("div","catch"+(f.tier===3?" legendary-catch":""));
  heading(box,pick(f.name),f.tier===3?tr("legend")+" · "+pick(here().name):tr(newFish?"newSpecies":"repeat"));box.append(f.tier===3?catchFilm(f,true):portrait(f,false),chips([rank(f.tier),weight(kg),pick(here().name),...(castSea?[tr("saltRoute"),tr(layerKeys[castSea.depth])]:[])]),el("p","",pick(f.note)));
  if(catchInfo.clue)box.append(el("p","reward",tr("clueEarn")+" · "+surveyed().count+"/3"));
  if(catchInfo.personal.first)box.append(el("p","reward",pick(["First personal best","Primer récord personal"])+" · "+weight(kg)));
  if(record)box.append(el("p","reward",pick(["New personal best","Nuevo récord personal"])+" · "+weight(catchInfo.personal.previous)+" → "+weight(kg)));
  recordReward(box,f,kg);
  if(f.tier===3)box.append(giftCard(f,catchInfo.personal.first));
  if(unlock)box.append(el("p","reward",(save.lang?"¡Nuevo sitio · ":"New fishing spot · ")+pick(unlock.name)+"!"));
  if(newFish&&discoveries().length===fish.length)box.append(el("p","reward",tr("allGuide")));
  if(!saveOK)box.append(el("p","",tr("notSaved")));
  box.append(displayButton(f),postcardButton(f,kg),actButton(tr("releaseFish"),dismiss));content.append(box);
 }
 function toast(message){showText("castGrade",message);$("castGrade").hidden=false;toastTime=2.1;say(message);}
 function nearestFish(x,y){
  const list=Dive.school(save.place,reduced?0:t,here().salt?Voyage.conditions(save.voyage,here().id):null).map(s=>({s,distance:Math.hypot((s.x-x)/(s.size*.55), (s.y-y)/(s.size*.8))}));
  return list.sort((a,b)=>a.distance-b.distance)[0];
 }
 function showAlbum(){
  openModal("album");const items=fish.filter(f=>save.album[f.id]);heading(content,tr("album"),items.length+" "+tr(items.length===1?"photoSingular":"photos"));
  if(!items.length)content.append(el("p","",tr("noPhotos")));
  const cards=el("div","album-grid");for(const f of items){
   const card=actButton("",()=>showEntry(f),"album-card");const img=el("img");img.src=save.album[f.id];img.alt="";
   card.append(img,el("strong","",pick(f.name)),el("small","",pick(places[f.place].name)));cards.append(card);
  }content.append(cards,actButton(tr("backGuide"),openGuide));
 }
 function captureFrame(s){
  const back=$("panorama");if(!back.complete||!back.naturalWidth||!sprite(s.f.id).naturalWidth||back.getAttribute("src")!=="assets/dive-"+Waters.habitats[save.place]+".png")return null;
  const {w,h}=viewport;
  const width=Math.min(w*.78,Math.max(w*.36,h*.73)),height=width*9/16;
  const x=Math.max(0,Math.min(w-width,s.x*w-width/2)),y=Math.max(0,Math.min(h-height,s.y*h-height/2));
  const result=document.createElement("canvas");result.width=256;result.height=144;const c=result.getContext("2d");c.imageSmoothingEnabled=false;
  c.drawImage(back,x/w*back.naturalWidth,y/h*back.naturalHeight,width/w*back.naturalWidth,height/h*back.naturalHeight,0,0,256,144);
  // Paint at the exact shutter time so the journal keeps the fish that was framed.
  const layer=document.createElement("canvas");layer.width=w;layer.height=h;const pen=layer.getContext("2d");pen.imageSmoothingEnabled=false;
  Dive.paint(pen,{w,h,t:reduced?0:t,phase:"ready",place:save.place,target,hot,sprite,clock:0,conditions:here().salt?Voyage.conditions(save.voyage,here().id):null});
  c.drawImage(layer,x,y,width,height,0,0,256,144);return result.toDataURL("image/jpeg",.76);
 }
 function takePhoto(s){
  if(!diving||!["ready","escape"].includes(phase))return;
  const photo=captureFrame(s);if(!photo){toast(tr("focusing"));return;}
  target={x:s.x,y:Dive.surfaceY(s.y)};
  const marked=save.photos[s.f.id];save.photos[s.f.id]=true;
  if(!Voyage.storePhoto(save.album,s.f.id,photo,persist)){
   if(!marked)delete save.photos[s.f.id];
   toast(pick(["Couldn’t save this photo. Check device storage.","No se pudo guardar la foto. Revisa el almacenamiento."]));return;
  }
  renderAll();toast(tr("photo")+" · "+pick(s.f.name));beep([660,990],.045);
  if(!reduced){scene.classList.remove("snap");void scene.offsetWidth;scene.classList.add("snap");}
 }
 function toggleCam(){diving=!diving;toastTime=0;$("castGrade").hidden=true;renderAll();draw();beep(diving?[520,330]:[330,520],.06);}
 function showTackle(){
  if(cupPlaying){showCup();return;}
  openModal("rig");heading(content,tr("tackleBox"),pick(here().name));content.append(el("p","",tr("nextCast")));
  const wrap=el("div","rig-list");
  for(const rig of Waters.tackle){const b=actButton("",()=>{save.lure=rig.id;persist();renderAll();beep([460,620],.05);dismiss();},"rig-choice"+(rig.id===save.lure?" selected":""));
   b.setAttribute("aria-pressed",String(rig.id===save.lure));const img=el("img");img.alt="";img.src="assets/"+rig.id+".png";
   const words=el("span");words.append(el("strong","",pick(rig.name)),el("small","",pick(rig.desc)));b.append(img,words);if(rig.id===save.lure)b.append(icon("check"));wrap.append(b);}
  content.append(wrap,actButton(tr("legendGifts"),showGifts,"display-button"));
 }
 function showHunt(){
  if(cupPlaying){showCup();return;}
  openModal("hunt");const clue=surveyed(),legend=currentLegend(),complete=clue.count===3&&!!save.records[legend.id];
  heading(content,pick(legend.name),tr("expedition")+" · "+pick(here().name));const box=el("div","hunt-intro");box.append(portrait(legend,false),el("p","",tr(complete?"completed":clue.count===3?"legendReady":"huntIntro")));content.append(box);
  const label=el("label","hunt-selector",pick(["Legend to track","Leyenda para rastrear"]));
  const select=el("select");
  for(const f of Waters.legends(save.place)){const option=el("option","",pick(f.name));option.value=f.id;select.append(option);}
  select.value=legend.id;
  select.onchange=()=>{save.voyage.hunts[here().id]=select.value;replayLegend=false;persist();renderAll();showHunt();content.querySelector("select")?.focus({preventScroll:true});};
  label.append(select);content.insertBefore(label,box);
  const previewGift=AnglerLog.gifts[legend.id];content.append(el("p","hunt-gift",tr("legendGift")+" · "+pick(previewGift.name)+". "+AnglerLog.describe(previewGift,save.lang)));
  const rig=getLure(Waters.rigs[save.place]),objectives=[
   [clue.found>=3,tr("clue1"),Math.min(3,clue.found)+"/3"],
   [clue.ring,tr("clue2"),""],[clue.gear,tr("clue3")+" "+pick(rig.name),""]
  ];
  const list=el("ul","clues");for(const [done,label,progress] of objectives){const li=el("li",done?"done":"");li.append(el("span","checkmark",done?"✓":"○"),el("span","",label),el("b","",progress));list.append(li);}
  content.append(list);if(["ready","escape","released"].includes(phase)){
   content.append(actButton(tr("sighting"),()=>showSighting(false),"primary"));
   content.append(actButton(tr(complete?"trackAgain":"markRing"),()=>{replayLegend=complete;target={...hot};dismiss();action.focus({preventScroll:true});}));
  }
 }
 function showSighting(hooked){
  const f=hooked?runningFish:currentLegend();openModal("legend");heading(content,pick(f.name),tr("sighting"));
  modalFrame=Legends.open({root:content,f,lang:save.lang,el,button:actButton,sprite,reduced,backdrop:"assets/dive-"+Waters.habitats[save.place]+".png",onComplete:()=>{
   save.voyage.legends[f.id]=true;persist();
   if(!hooked){resetReady();replayLegend=true;target={...hot};}
   dismiss();toast(hooked?(save.lang?"¡Ya picó!":"Fish on!"):(save.lang?"Leyenda a la vista. Lanza al anillo.":"Legend in sight. Cast into the ring."));
  }});
 }
 function showHelm(initialBoat){
  if(cupPlaying||!["ready","released","escape"].includes(phase))return;
  if(!here().salt)moveSpot(lastWater.salt);
  openModal("helm");heading(content,tr("captain"),pick(here().name));
  content.append(actButton(bwText("Captain’s chart","Carta del capitán"),()=>sail(false),"secondary"));
  modalFrame=Helm.open({root:content,save,place:here(),el,button:actButton,pick,sprite,persist,say,reduced,initialBoat,
   onAnchor:mark=>{
    const a=save.voyage.anchors[here().id];
    if(here().grounds)save.grounds[here().id]=Math.abs(here().grounds[0].ring.x-a.x)<=Math.abs(here().grounds[1].ring.x-a.x)?0:1;
    resetReady();hot=coastalRing(hot);target={...hot};persist();renderAll();dismiss();toast(tr("atAnchor")+" · "+pick(mark?.sign||here().name));
   },
   onLog:boat=>showWildlife(()=>showHelm(boat))});
 }
 function showWildlife(back){
  openModal("wildlife");const entries=Voyage.wildlife.filter(a=>save.voyage.album[a.id]);
  heading(content,tr("wildLog"),entries.length+" / "+Voyage.wildlife.length);
  if(!entries.length){content.append(el("p","",tr("wildHint")));const list=el("div","wildlife-wanted");
   for(const a of Voyage.wildlife){const figure=el("figure"),im=el("img");im.src="assets/"+a.id+".png";im.alt="";figure.append(im,el("figcaption","",pick(a.name)));list.append(figure);}content.append(list);
  }else for(const a of entries){
   const shot=save.voyage.album[a.id],spread=el("article","wildlife-spread"),photo=el("img"),notes=el("div");
   photo.src=shot.photo;photo.alt=pick(a.name);const p=places.find(x=>x.id===shot.port);
   notes.append(el("h3","",pick(a.name)),el("strong","",pick(p.name)+" · "+pick(Voyage.times[shot.time])),el("p","",pick(a.note)));spread.append(photo,notes);content.append(spread);
  }
  content.append(actButton(save.lang?"Volver":"Back",back,"theme"));
 }
 function displayButton(f){
  const keys=Waters.specimens(f.id,save.records,save.photos);
  const next=()=>keys.find(k=>!save.display.includes(k));
  let lastAdded;
  const b=actButton("",()=>{
   const key=next(),destination=Waters.nextTank(save);
   if(key&&destination&&Waters.setExhibited(save,key,false,true,destination)){
    lastAdded=key;save.tank=destination;persist();update();beep([440,554],.06);return;
   }
   const home=save.fishHomes[lastAdded]||save.fishHomes[keys.find(k=>save.fishHomes[k]===save.tank)]||save.fishHomes[keys[0]];
   if(home){save.tank=home;persist();}
   if(modalKind==="catch"){dismiss();dialog.addEventListener("close",showTank,{once:true});}else showTank();
  },"display-button");
  function update(){
   const destination=Waters.nextTank(save);
   if(!next())b.textContent=tr("visitTank");
   else if(!destination)b.textContent=tr("tankFull");
   else b.textContent=(save.lang?"Agregar a ":"Add to ")+tr(Waters.tankNames[destination]);
  }
  update();return b;
 }
 let modalFrame=null,tankMoving=!reduced,tankLit=true;
 function showTank(){
  openModal("tank");heading(content,tr("aquarium"));
  modalFrame=FishKeeper.open({root:content,save,pick,tr,el,button:actButton,persist,say,beep,sprite,found:discoveries(),
   studio:(model,label,edit,meal)=>{
    const keeperFrame=modalFrame,keeper=document.createDocumentFragment(),scroll=dialog.scrollTop;
    const expanded=dialog.classList.contains("tank-expanded"),focus=document.activeElement;
    keeper.append(...Array.from(content.childNodes));
    openModal("tankStudio");
    heading(content,edit?bwText("Design your tank","Diseña tu acuario"):bwText("Dive into tank","Bucear en el acuario"),tr(Waters.tankNames[save.tank]));
    const back=()=>{
     openModal("tank");content.append(keeper);modalFrame=keeperFrame;
     dialog.classList.toggle("tank-expanded",expanded);focus?.focus({preventScroll:true});dialog.scrollTop=scroll;
    };
    modalFrame=ReefStudio.open({root:content,model,save,el,button:actButton,pick,persist,sprite,label,meal,moving:tankMoving,back},edit);
   },
   goDiving:()=>{if(!diving)toggleCam();dismiss();},moving:tankMoving,lit:tankLit,
   setMoving:value=>{tankMoving=value;},setLit:value=>{tankLit=value;}});
 }
 $("dive").onclick=toggleCam;$("shutter").onclick=()=>takePhoto(nearestFish(target.x,Dive.depthY(target.y)).s);
 $("tabTank").onclick=$("exhibitOpen").onclick=showTank;$("rigOpen").onclick=showTackle;$("expOpen").onclick=showHunt;

 function teamName(i){return tr(i===0?"otter":"heron");}
 function token(i){const im=el("img","cup-token");im.src="assets/"+(i===0?"otter":"heron")+".png";im.alt="";return im;}
 function scoreLine(match){
  const row=el("div","cup-scores"),scores=Lantern.scores(match);
  for(let i=0;i<2;i++){const item=el("div","cup-team");item.append(token(i),el("span","",teamName(i)),el("b","",scores[i]));row.append(item);}
  return row;
 }
 function cupBanner(){
  const im=el("img","cup-banner");im.src="assets/lantern-cup.png";im.alt="";return im;
 }
 function roundLabel(round){return tr("round")+" "+round+"/"+Lantern.rounds;}
 function showCup(){
  const match=save.cup;
  openModal("cup");content.append(cupBanner());
  heading(content,tr("cupTitle"),tr("cupMode"));
  if(match){content.append(scoreLine(match));}
  if(match?.turns.length===Lantern.maxTurns){
   const scores=Lantern.scores(match),w=scores[0]===scores[1]?-1:Number(scores[1]>scores[0]);
   content.append(el("h3","cup-win",w<0?tr("cupTie"):teamName(w)+" "+tr("cupWins")));
   const table=el("table","round-table");const head=el("tr");for(const word of [tr("round"),teamName(0),teamName(1)])head.append(el("th","",word));table.append(head);
   for(let n=0;n<Lantern.rounds;n++){const row=el("tr");row.append(el("th","",n+1),el("td","",Lantern.points(match.turns[n*2])),el("td","",Lantern.points(match.turns[n*2+1])));table.append(row);}
   content.append(table,actButton(tr("rematch"),newCup),actButton(tr("backLake"),dismiss,"secondary"));return;
  }
  if(cupPlaying){
   content.append(el("p","",teamName(challenge.team)+" · "+roundLabel(challenge.number)),el("p","",tr("pauseHint")),
    actButton(tr("backCast"),dismiss),actButton(tr("pauseCup"),pauseCup,"secondary"));return;
  }
  content.append(el("p","cup-rules",tr("cupRules")),el("p","cup-points",tr("pointRules")));
  if(match){
   const next=Lantern.round(match);
   content.append(el("p","cup-up",pick(places[match.lake].name)+" · "+roundLabel(next.number)),
    actButton(teamName(next.team)+" · "+tr("playTurn"),beginTurn),actButton(tr("backLake"),dismiss,"secondary"));
  }else{
   const label=el("label","cup-assist"),check=el("input");check.type="checkbox";check.checked=cupGentle;check.onchange=()=>{cupGentle=check.checked;};label.append(check,document.createTextNode(tr("sharedGentle")));
   content.append(el("p","cup-up",pick(here().name)+" · "+pick(getLure(save.lure).name)),label,actButton(tr("startCup"),newCup));}
 }
 function equippedLure(){return cupPlaying?save.cup.lure:save.lure;}
 function newCup(){
  save.cup=Lantern.create(save.place,save.lure,cupGentle,Math.floor(Math.random()*4294967296));
  persist();beginTurn();
 }
 function beginTurn(){
  const match=save.cup;if(!match||match.turns.length>=Lantern.maxTurns)return;
  cupIndex=match.turns.length;challenge=Lantern.round(match);cupPlaying=true;
  save.place=match.lake;castLure=match.lure;target={x:.49,y:.75};hot={...challenge.hot};
  replayLegend=false;catchInfo=null;suppressClick=false;resetReady();renderAll();
  modalKind="cupLaunch";dismiss();action.focus({preventScroll:true});scene.scrollIntoView({block:"nearest",behavior:"instant"});
 }
 function pauseCup(){
  cupPlaying=false;challenge=null;cupIndex=-1;hot=coastalRing(hot);clearHold();resetReady();renderAll();showCup();
 }
 function cupTurnResult(landed){
  if(!cupPlaying||!challenge)return null;
  const turn={landed,ring:castSkills.ring,power:castSkills.power,quick:castSkills.quick,counters:castSkills.counters};
  if(!Lantern.record(save.cup,cupIndex,turn))return null;
  const result={turn,team:challenge.team,round:challenge.number};
  cupPlaying=false;challenge=null;cupIndex=-1;hot=coastalRing(hot);return result;
 }
 function showTurnResult(result){
  const match=save.cup,turn=result.turn;
  openModal("cupResult");heading(content,teamName(result.team)+" · "+Lantern.points(turn)+" "+tr("points"),tr("cupTitle")+" · "+roundLabel(result.round));
  if(turn.landed){const f=catchInfo.f;content.append(f.tier===3?catchFilm(f,true):portrait(f,false),el("p","cup-up",pick(f.name)+" · "+weight(catchInfo.kg)));}
  else content.append(el("p","cup-up",tr(loss)));
  const list=el("ul","score-detail");
  for(const [key,score] of [["basePoints",turn.landed?100:0],["aimPoints",turn.ring?25:0],["powerCast",turn.power?20:0],["quickHook",turn.quick?15:0],["counterPoints",turn.counters*10]]){
   const row=el("li");row.append(el("span","",tr(key)),el("b","",String(score)));list.append(row);
  }
  content.append(list,scoreLine(match));
  if(match.turns.length===Lantern.maxTurns)content.append(actButton(tr("results"),showCup));
  else{const next=Lantern.round(match);content.append(el("p","cup-up",tr("passPhone")+" "+teamName(next.team)),actButton(teamName(next.team)+" · "+tr("playTurn"),beginTurn));}
 }
 function renderCupHud(){
  const match=save.cup;showText("cupTag",cupPlaying?teamName(challenge.team):!match?tr("cupMode"):match.turns.length===Lantern.maxTurns?tr("scorecard"):tr("resumeCup"));
  $("turnFlag").hidden=!cupPlaying;if(cupPlaying){$("turnToken").src="assets/"+(challenge.team?"heron":"otter")+".png";showText("turnText",teamName(challenge.team)+" · "+roundLabel(challenge.number));}
 }
 function beginPower(){
  if(isOpen()||!["ready","escape","released"].includes(phase))return;
  powerOverride=null;setPower(0);setPhase("charge");action.focus({preventScroll:true});beep([294],.05);
 }
 function renderActionTools(){
  const ready=["ready","escape","released"].includes(phase);
  $("powerCast").hidden=!ready;$("chargeHud").hidden=phase!=="charge";
  const info=activeCounter(),available=info&&fight.usedCounter!==info.window;
  $("counterDock").hidden=phase!=="fight";
  $("steerLeft").disabled=!available;$("steerRight").disabled=!available;
  if(available){const key=info.side+save.lang;if(key!==shownSide){shownSide=key;const cue=tr(info.side==="left"?"cueLeft":"cueRight");showText("counterCue",cue);say(cue);}}
  else{shownSide="";if(phase==="fight")showText("counterCue",tr(fight.turnAge!=null&&fight.age-fight.turnAge<.75?"turned":"waitRun"));}
 }
 function activeCounter(){
  if(phase!=="fight"||!fight||fight.burstLeft>0)return null;
  const cue=Lantern.counterWindow(fight.age,fight.pattern);
  return cue.window>=0?cue:null;
 }
 function steer(side){
  const cue=activeCounter();if(!cue||isOpen()||fight.usedCounter===cue.window)return;
  fight.usedCounter=cue.window;const success=cue.side===side;
  if(success){fight.turnAge=fight.age;fight.turnSide=side;castSkills.counters++;fight.progress=Math.min(.985,fight.progress+.085);fight.tension=Math.max(.06,fight.tension-.18);beep([494,659],.06);}
  else{beep([247],.07);}
  toast(tr(success?"turned":"slipped"));renderActionTools();renderState();
 }
 function postcardButton(f,kg){
  const wrap=el("div","card-control"),panel=el("div","postcard-panel");panel.hidden=true;
  const btn=actButton(tr("keepsake"),async()=>{
   if(panel.childElementCount){panel.hidden=!panel.hidden;btn.setAttribute("aria-expanded",String(!panel.hidden));return;}
   btn.disabled=true;panel.replaceChildren();
   try{
    const data=await CatchPostcard.make({fish:f,place:places[f.place],weight:weight(kg),rarity:rank(f.tier),language:save.lang,crew:catchInfo?.f.id===f.id&&catchInfo.kg===kg?netResult:null});
    const image=el("img","postcard-image");image.src=data;image.alt=pick(f.name)+" · "+weight(kg);
    const link=el("a","card-download",tr("downloadCard"));link.href=data;link.download="Starfall-"+f.id+"-"+kg.toFixed(2)+"kg.png";
    panel.append(image,link,el("p","",tr("cardTip")));panel.hidden=false;btn.setAttribute("aria-expanded","true");
   }catch{panel.textContent=tr("cardRetry");panel.hidden=false;}
   finally{btn.disabled=false;}
  },"display-button");
  btn.setAttribute("aria-expanded","false");wrap.append(btn,panel);return wrap;
 }
 $("openHelm").onclick=()=>showHelm();
 $("freshRoute").onclick=()=>selectSpot(lastWater.fresh);
 $("saltRoute").onclick=()=>selectSpot(lastWater.salt);
 $("spotPicker").onchange=e=>{const i=Number(e.target.value);e.target.value=String(save.place);selectSpot(i);};
 for(const b of $("seaDepths").children)b.onclick=()=>{if(!here().salt||cupPlaying||isOpen()||!["ready","escape","released"].includes(phase))return;save.seaDepth=Number(b.dataset.layer);persist();renderSea();};
 for(const [i,b] of Array.from($("groundOptions").children).entries()){
  b.onclick=()=>{
   if(!here().grounds||cupPlaying||isOpen()||!["ready","escape","released"].includes(phase))return;
   save.grounds[here().id]=i;delete save.voyage.anchors[here().id];hot=coastalRing(hot);persist();renderAll();draw();
   say(pick(currentGround().name)+". "+$("seaTargetText").textContent);
  };
 }
 $("troll").onclick=()=>{if(!here().salt||cupPlaying||isOpen()||!["ready","escape","released"].includes(phase))return;startCast(null,true);};
 $("cupOpen").onclick=showCup;$("powerCast").onclick=beginPower;
 $("steerLeft").onclick=()=>steer("left");$("steerRight").onclick=()=>steer("right");

 function pressAction(){
  if(isOpen())return;
  if(phase==="charge"){startCast(powerLevel);return;}
  if(["ready","escape","catch","released"].includes(phase)){startCast();return;}
  if(phase==="bite"){strike();return;}
 }
 function beginReel(){if(phase!=="fight")return;pressStarted=performance.now();held=!latched;action.classList.toggle("held",held);if(held)beep([275],.04);}
 function endReel(cancel=false){if(pressStarted===null)return;const quick=!cancel&&performance.now()-pressStarted<230;latched=quick?held:false;held=latched;pressStarted=null;renderState();}
 let suppressClick=false;
 action.addEventListener("pointerdown",e=>{if(phase==="fight"&&e.button===0){e.preventDefault();action.setPointerCapture?.(e.pointerId);suppressClick=true;beginReel();}});
 action.addEventListener("pointerup",()=>endReel());action.addEventListener("pointercancel",()=>{endReel(true);clearHold();});
 action.addEventListener("click",e=>{if(suppressClick){suppressClick=false;return;}if(phase==="fight"){latched=!latched;held=latched;renderState();}else pressAction();});
 action.addEventListener("lostpointercapture",()=>{if(pressStarted!==null)endReel(true);});
 let rodTouch=null;
 scene.addEventListener("pointerdown",e=>{
  if(!e.isPrimary||e.button!==0||e.target.closest("button")||!["bite","fight"].includes(phase))return;
  rodTouch={id:e.pointerId,x:e.clientX,y:e.clientY,phase};scene.setPointerCapture(e.pointerId);
 });
 scene.addEventListener("pointerup",e=>{
  if(!rodTouch||e.pointerId!==rodTouch.id)return;
  const start=rodTouch;rodTouch=null;if(start.phase!==phase||isOpen())return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(phase==="bite"&&dy< -22&&-dy>Math.abs(dx)*.8)strike();
  else if(phase==="fight"&&Math.abs(dx)>22&&Math.abs(dx)>Math.abs(dy)*.85)steer(dx<0?"left":"right");
 });
 scene.addEventListener("lostpointercapture",()=>{rodTouch=null;});
 scene.addEventListener("pointerdown",e=>{if(e.target.closest("button")||!["ready","escape"].includes(phase))return;const r=scene.getBoundingClientRect();const screenY=(e.clientY-r.top)/r.height;
  if(diving){const hit=nearestFish((e.clientX-r.left)/r.width,screenY);if(hit.distance<1){takePhoto(hit.s);return;}}
  const y=diving?Dive.surfaceY(screenY):screenY;if(y<.55)return;target={x:Math.max(.07,Math.min(.93,(e.clientX-r.left)/r.width)),y:Math.min(.92,y)};beep([560],.04);});
 $("aimPad").onclick=()=>{target={...hot};say(tr("aim")+" ✓");};
 $("recordOpen").onclick=()=>openBook(false);$("sharkOpen").onclick=()=>openBook(true);$("giftOpen").onclick=showGifts;
 function openHunting(){
  if(isOpen())return;
  openModal("hunting");
  history.replaceState(history.state,"","#hunting");
  modalFrame=TrailHunt.open({root:content,data:save.trails,pick,el,button:actButton,persist,beep,reduced,calm:save.calm,
   changeLanguage:()=>{save.lang=1-save.lang;persist();renderAll();}});
 }
 $("tabHunt").onclick=openHunting;
 window.addEventListener("hashchange",()=>{if(location.hash==="#hunting")openHunting();else if(modalKind==="hunting")dismiss();});
 $("tabGuide").onclick=$("guideStat").onclick=openGuide;$("tabFish").onclick=()=>{dismiss();action.focus({preventScroll:true});};
 $("help").onclick=showHelp;$("lang").onclick=()=>{save.lang=1-save.lang;persist();renderAll();};
 $("sound").onclick=()=>{save.sound=!save.sound;persist();renderAll();if(save.sound)beep([392,523],.08);};
 let spaceHeld=false;
 window.addEventListener("keydown",e=>{
  if(isOpen()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest("input,select,textarea"))return;
  if(phase==="fight"&&["ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();if(!e.repeat)steer(e.key==="ArrowLeft"?"left":"right");return;}
  if(phase==="charge"&&["ArrowLeft","ArrowRight"].includes(e.key)){e.preventDefault();powerOverride=Math.max(0,Math.min(1,powerLevel+(e.key==="ArrowLeft"?-.05:.05)));setPower(powerOverride);return;}
  if(e.code==="Space"&&(e.target===action||e.target===document.body||e.target===scene||e.target===$("aimPad"))){
   e.preventDefault();if(spaceHeld||e.repeat)return;spaceHeld=true;suppressClick=false;if(phase==="fight")beginReel();else pressAction();
  }else if(["ready","escape"].includes(phase)&&e.key.startsWith("Arrow")){
   e.preventDefault();if(e.key==="ArrowLeft")target.x=Math.max(.07,target.x-.035);if(e.key==="ArrowRight")target.x=Math.min(.93,target.x+.035);if(e.key==="ArrowUp")target.y=Math.max(.56,target.y-.025);if(e.key==="ArrowDown")target.y=Math.min(.92,target.y+.025);
  }
 });
 window.addEventListener("keyup",e=>{if(e.code==="Space"&&spaceHeld){e.preventDefault();spaceHeld=false;endReel();}});
 function pause(){clearHold();spaceHeld=false;suppressClick=false;lastFrame=0;}
 window.addEventListener("blur",pause);document.addEventListener("visibilitychange",pause);
 function setPower(level){
  powerLevel=level;const percent=Math.round(level*100);$("chargeNeedle").style.left=percent+"%";
  $("powerMeter").setAttribute("aria-valuenow",String(percent));showText("powerNumber",percent+"%");
 }
 let climateCheck=0,lastClimate="";
 function tick(dt){
  if(here().salt&&(climateCheck-=dt)<=0){
   climateCheck=1;const c=Voyage.conditions(save.voyage,here().id),signature=here().id+c.time+c.rain;
   if(signature!==lastClimate){lastClimate=signature;renderAll();}
  }
  phaseTime+=dt;t+=dt;if(!reduced)spool+=dt*(phase==="flight"?18:phase==="fight"?(held?10:fight.pulling?-5:0):0);soundscape();if(toastTime>0){toastTime-=dt;if(toastTime<=0)$("castGrade").hidden=true;}
  if(phase==="wait"&&seaPass)target=Waters.trail(seaPass.origin,castSea.depth,seaPass.direction,phaseTime);
  if(phase==="charge"){
   setPower(powerOverride??Lantern.powerAt(phaseTime,cupPlaying?save.cup.gentle:save.calm));
  }
  if(phase==="released"&&phaseTime>=1.25){resetReady();}
  else if(phase==="flight"&&phaseTime>=.68){setPhase("wait");waterSound(.32,.46,2200);beep([220,168],.05);}
  else if(phase==="wait"&&phaseTime>=biteAfter){setPhase("bite");beep([780,990],.08);vibrate([18,40,18]);}
  else if(phase==="bite"&&!(cupPlaying?save.cup.gentle:save.calm)&&phaseTime>=5.5+(castPower.hook||0))gotAway("escMiss");
  else if(phase==="fight"){
   if(!cupPlaying)signatureTick();
   const outcome=Waters.tensionStep(fight,held,dt,cupPlaying?save.cup.gentle:save.calm);
   if(outcome==="surge"&&!fight.warned){fight.warned=true;beep([392,294,220],.08);vibrate([30,35,30]);}
   if(outcome!=="surge")fight.warned=false;
   if(outcome==="landed")landed();else if(outcome==="escaped"){
    if(AnglerLog.rescue(fight,castPower)){charmEffect("🦷");clearHold();toast(pick(["Breaker Tooth saved your line!","¡El Diente Rompeolas salvó tu sedal!"]));}
    else gotAway("escLine");
   }
  }
  if(phase==="wait"||phase==="fight")renderState();
 }
 function fit(){
  const width=scene.clientWidth,height=scene.clientHeight,scale=width>=650?2:1.5;
  viewport={w:Math.round(width/scale),h:Math.round(height/scale),rodW:$("rod").clientWidth/scale,rodH:$("rod").clientWidth*.875/scale,scale};
  canvas.width=viewport.w;canvas.height=viewport.h;ctx.imageSmoothingEnabled=false;draw();
 }
 function draw(){
  const {w,h,rodW,rodH}=viewport;ctx.clearRect(0,0,w,h);
  const tm=reduced?0:t,osc=Math.sin(tm*2.2);
  if(diving){Dive.paint(ctx,{w,h,t:tm,phase,place:save.place,target,hot,fight,active:runningFish,catchInfo,lure:castLure,sprite,clock:phaseTime,biteAfter,conditions:here().salt?Voyage.conditions(save.voyage,here().id):null,seaLayer:castSea?.depth,trolling:!!seaPass});return;}
  const dots=(color,x,y,ww,hh)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(ww)),Math.max(1,Math.round(hh)));};
  function ring(x,y,r,color){ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),Math.max(1,r),Math.max(1,r*.27),0,0,Math.PI*2);ctx.stroke();}
  if(here().salt){
   ctx.save();ctx.lineWidth=1;
   for(let i=0;i<13;i++){
    const x=((i*.327+tm*.011)%1)*w,y=(.55+((i*.183)% .4))*h;
    ctx.strokeStyle=i%3?"#c5f6e251":"#e2fff095";ctx.beginPath();ctx.moveTo(x-5,y);ctx.quadraticCurveTo(x,y-1.6,x+8+i%5,y);ctx.stroke();
   }
   if(seaPass&&["wait","bite","fight"].includes(phase)){
    const x=target.x*w,y=target.y*h;
    for(let i=0;i<5;i++){const k=((tm*.65+i/5)%1),back=-seaPass.direction*k*w*.15;
     ctx.globalAlpha=.76*(1-k);ctx.strokeStyle="#c8fff0";ctx.beginPath();ctx.moveTo(x+back,y+2+k*h*.026);ctx.lineTo(x+back-seaPass.direction*5,y+1+k*h*.014);ctx.lineTo(x+back,y-1-k*h*.012);ctx.stroke();}
   }
   if(scene.classList.contains("rainy")){
    ctx.strokeStyle="#edffff77";ctx.beginPath();for(let i=0;i<30;i++){
     const x=((i*.618+tm*.16)%1)*w,y=((i*.283+tm*.78)%1)*h;ctx.moveTo(x,y);ctx.lineTo(x-2,y+5);
    }ctx.stroke();
   }
   ctx.restore();
  }
  // Slow glints stay on the water, and the feeding ring is distinct from the aim marker.
  for(let i=0;i<14;i++){const f=(i*.618034+.04)%1,s=(i*.381967+.21)%1,bright=Math.sin(tm*1.2+i*3);if(bright>.4)dots("rgba(224,251,218,.55)",w*(.12+.76*f),h*(.56+.38*s),2+3*bright,1);}
  function drawFish(f,x,y,length,alpha,angle,flip=false){
   const img=sprite(f.id);
   if(!img.complete||!img.naturalWidth)return;
   const height=length*img.naturalHeight/img.naturalWidth;
   ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(angle);ctx.scale(flip?-1:1,1);ctx.globalAlpha=alpha;ctx.drawImage(img,-length/2,-height/2,length,height);ctx.restore();
  }
  // A school feeding near shore occasionally breaks the surface.
  if(!reduced&&phase==="ready"){
   const leap=t%9.3;if(leap<.82){const u=leap/.82,x=w*(hot.x-.095+.11*u),y=h*(hot.y-.035)-Math.sin(u*Math.PI)*h*.11;
    drawFish(Waters.pools[save.place][1],x,y,Math.max(16,w*.045),.9,(u-.45)*1.2);
    if(u>.75)ring(x,hot.y*h,2+12*(u-.75)*4,"#d5fae0");
   }
  }
  const hx=hot.x*w,hy=hot.y*h,rx=Math.max(9,Math.min(w*.037,20))*ringScale();
  ring(hx,hy,rx*(1.05+.12*osc),"#ffe49a");ring(hx+1,hy,rx*(.59+.13*osc),"#ffe8a4");
  for(let i=0;i<2;i++){const xx=hx+(i?1:-1)*(rx+3),yy=hy-3-(i?1:4);dots("#ffe39b",xx-2,yy,5,1);dots("#fff3c9",xx,yy-2,1,5);}
  if(phase==="ready"||phase==="escape"){
   // A school circles beneath the feeding rings.
   for(let i=0;i<2;i++){const cycle=tm*.54+i*2.2,fx=hx+Math.sin(cycle)*rx*1.8,fy=hy+7+i*5+Math.cos(cycle)*2;
    ctx.save();ctx.translate(fx,fy);ctx.scale(Math.cos(cycle)>=0?1:-1,1);ctx.fillStyle="#0c4a4e63";ctx.beginPath();ctx.ellipse(0,0,7+i*1.7,2+i*.45,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(-11,-2);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();ctx.restore();}
  }
  if(seaPass&&["flight","wait","bite","fight"].includes(phase)){
   // The stern and its moving wake put the player aboard the panga during a trolling pass.
   const bob=reduced?0:Math.sin(tm*1.7)*h*.003;
   ctx.save();ctx.translate(0,bob);
   for(let i=0;i<5;i++){
    const u=(i*.19+tm*.19)%1,x=w*(.70-.17*u),y=h*(.989-.095*u);
    ctx.strokeStyle="rgba(225,255,243,"+(1-u)*.65+")";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x-5,y-2);ctx.quadraticCurveTo(x+1,y+2,x+9,y);ctx.stroke();
   }
   ctx.beginPath();ctx.moveTo(w*.68,h+2);ctx.quadraticCurveTo(w*.88,h*.973,w+2,h*.878);ctx.lineTo(w+2,h+3);ctx.closePath();ctx.fillStyle="#36798a";ctx.fill();
   ctx.beginPath();ctx.moveTo(w*.68,h);ctx.quadraticCurveTo(w*.88,h*.973,w+2,h*.878);ctx.strokeStyle="#203f48";ctx.lineWidth=5;ctx.stroke();
   ctx.strokeStyle="#efd5a4";ctx.lineWidth=2.2;ctx.stroke();ctx.restore();
  }
  const tip=FishingRod.draw(ctx,$("rod"),viewport,{phase,clock:phaseTime,time:tm,power:powerLevel,fight,held,reduced,biteAfter},spool);
  const tipX=tip.x,tipY=tip.y;
  let bx=target.x*w,by=target.y*h,size=Math.max(1,Math.round(w/430));
  if(phase==="ready"||phase==="escape"||phase==="charge"){
   const a=bx,b=by,rr=Math.max(7,w*.017);ring(a,b,rr,"#f6f5ce");dots("#faf5d3",a-2,b,5,1);dots("#faf5d3",a,b-2,1,5);
   bx=tipX+4+osc*1.4;by=tipY+20+rodH*.13;
  }else if(phase==="flight"){
   const u=Math.min(1,phaseTime/.68);bx=tipX+(bx-tipX)*u;by=tipY+(by-tipY)*u-Math.sin(Math.PI*u)*h*.34;
  }else if(phase==="fight"){
   bx+=Lantern.pullOffset(fight)*w;
   const closer=fight.progress*.23;bx+=Math.sin(t*3)*w*.023+w*closer*.4;by+=h*closer*.28+Math.cos(t*4)*1.8;
   const surge=Math.sin(tm*5);
   const breach=here().salt&&["marlin","sail","dorado","rooster","goldrooster","flyer"].includes(runningFish.id)&&!reduced?Math.max(0,1-Math.abs(fight.age-1.65)/.61):0;
   drawFish(runningFish,bx-7,by+2+surge*2-breach*h*.12,Math.max(22,w*.048)*(1+fight.progress*.55),.34+fight.progress*.45+breach*.2,surge*.14-breach*.38);
   ring(bx,by+3,8+(1+surge)*4,"#d9ffe2");
  }else if(phase==="wait"){
   const nibble=phaseTime>biteAfter-.82;
   const approach=Math.min(1,phaseTime/biteAfter);drawFish(runningFish,bx-10-(1-approach)*w*.14,by+6+Math.sin(tm*3),Math.max(17,w*.044),.13+approach*.13,0);
   by+=Math.sin(tm*(nibble?17:3.3))*(nibble?2.5:1);
   const radii=phaseTime<.45?2+phaseTime*32:7+(1+osc)*2;ring(bx,by+3,radii,"#d3e7be");
  }else if(phase==="bite"){by+=2+Math.abs(Math.sin(tm*6))*4;ring(bx,by-1,8+(1+osc)*3,"#fff5ba");}
  if(phase==="released"&&catchInfo){
   const u=Math.min(1,phaseTime/1.25),x=w*(.68-.28*u),y=h*(.81-.40*Math.sin(Math.PI*u));
   if(!reduced)drawFish(catchInfo.f,x,y,w*(.11-.035*u),1-Math.max(0,u-.85)*4,(u-.45)*1.1,true);
   if(u>.80){const a=(u-.8)*5;ring(x,h*.81,2+18*a,"#eaffd7");}
  }
  if(!reduced){
   const age=phase==="wait"||phase==="bite"?phaseTime:phase==="fight"?Math.min(fight.age,fight.age-(fight.turnAge??-10)):1;
   FishingRod.splash(ctx,bx,by+3,age,phase==="fight"?w*.061:w*.044);
  }
  if(phase!=="catch"&&phase!=="released"){
   const slack=phase==="fight"?Math.max(0,1-fight.tension*1.7)*(held?2:11):Math.min(13,Math.abs(bx-tipX)*.07);
   ctx.strokeStyle=here().id==="moon"?"#e5e0c8bd":"#f9edd0da";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.quadraticCurveTo((tipX+bx)/2,(tipY+by)/2+slack,bx,by);ctx.stroke();
   const artLure=["ready","charge","escape","released"].includes(phase)?equippedLure():castLure;
   if(artLure!=="float"){const img=sprite(artLure);if(img.naturalWidth)ctx.drawImage(img,bx-7*size,by-5*size,14*size,14*size);return;}
   const k=size;dots("#283b3d",bx-1*k,by-7*k,2*k,10*k);dots("#394247",bx-3*k,by-3*k,6*k,6*k);dots("#ffae6a",bx-1*k,by-7*k,2*k,3*k);dots("#fff2d2",bx-2*k,by-3*k,4*k,3*k);dots("#f16d53",bx-2*k,by,4*k,2*k);
  }
 }
 function frame(now){
  if(modalFrame&&isOpen()&&!document.hidden)modalFrame(now);
  if(!lastFrame)lastFrame=now;
  if(!document.hidden&&!isOpen()&&now-lastPaint>=30){
   const dt=Math.min(.65,(now-lastFrame)/1000);lastFrame=now;lastPaint=now;
   const steps=Math.max(1,Math.ceil(dt/.045));for(let i=0;i<steps&&!isOpen();i++)tick(dt/steps);draw();drawExtras();
  }else if(document.hidden||isOpen())lastFrame=now;
  requestAnimationFrame(frame);
 }
 const bwText=(en,es)=>pick([en,es]);
 const upgrades=save.adventures=Bluewater.clean(raw?.adventures);
 let lureWorked=false,workedAt=-100,scanUntil=-1,scanSpent=false,flare=null,netResult=null;
 function homePort(){openModal("boathouse");heading(content,bwText("Boathouse","Casa del pescador"));
  const nav=el("div","bw-actions");
  nav.append(actButton(bwText("Captain’s chart","Carta del capitán"),()=>sail(false)),actButton(bwText("The Lights Beneath Cabo","Las luces bajo Cabo"),()=>sail(true)),actButton(bwText("Family crew","Tripulación familiar"),crewSetup),actButton(bwText("Trophy wall","Muro de trofeos"),trophyWall));content.append(nav);
 }
 function sail(story){openModal("chart");heading(content,story?bwText("The Lights Beneath Cabo","Las luces bajo Cabo"):bwText("Captain’s chart","Carta del capitán"));
  modalFrame=Bluewater.openChart({root:content,save,data:upgrades,el,btn:actButton,pick,persist,sprite,anchor:i=>{
   const site=Bluewater.sites[i];moveSpot(site.port);upgrades.active=i;persist();renderAll();toast(pick(site.name));
  }},story);
 }
 function crewSetup(){openModal("crew");heading(content,bwText("Family crew","Tripulación familiar"));
  content.append(el("p","",bwText("The angler fights the fish. The spotter calls its run and scoops it at the boat.","Una persona pesca. La otra avisa cuando el pez gira y lo recoge con la red.")));
  const names=[bwText("Angler","Pescador"),bwText("Spotter","Vigía")].map((name,i)=>{const l=el("label","bw-label",name),field=el("input");field.maxLength=18;field.value=upgrades.crew[i]||"";field.placeholder=name;l.append(field);content.append(l);return field;});
  content.append(actButton(bwText("Start crew","Formar equipo"),()=>{upgrades.crew=names.map((n,i)=>n.value.trim()||n.placeholder);persist();dismiss();renderAll();}),actButton(bwText("Fish solo","Pescar a solas"),()=>{upgrades.crew=[];persist();dismiss();renderAll();},"secondary"));
 }
 function netGame(){
  openModal("net");const crew=upgrades.crew;
  heading(content,bwText("Pass the net to ","Pasa la red a ")+crew[1]);content.append(el("p","",bwText("Scoop when the float is in the gold zone.","Recoge cuando el flotador entre en la zona dorada.")));
  const meter=el("div","bw-net"),float=el("i"),msg=el("p","bw-note");meter.append(float);content.append(meter,msg);
  let at=0;modalFrame=now=>{at=.5+.46*Math.sin(now/(save.calm?850:570));float.style.left=at*100+"%";};
  content.append(actButton(bwText("Scoop!","¡Recoger!"),()=>{if(at<.32||at>.68){msg.textContent=bwText("Just missed. Try the next pass!","¡Casi! Intenta en la siguiente pasada.");return;}
   netResult=crew.slice();showCatch();
  }),actButton(bwText("Finish without net bonus","Terminar sin bono de red"),showCatch,"secondary"));
 }
 function trophyEntry(f,r){
  const row=el("article","bw-plaque"),im=el("img");im.src="assets/"+f.id+".png";im.alt="";row.append(im,el("strong","",pick(f.name)+" · "+weight(r.kg)),el("small","",[pick(places[f.place].name),pick(getLure(r.lure).name),new Date(r.at).toLocaleDateString(save.lang?"es-MX":"en-US"),...(r.crew||[])].join(" · ")));return row;
 }
 function trophyWall(){openModal("trophies");heading(content,bwText("Trophy wall","Muro de trofeos"));const rows=Object.entries(upgrades.plaques).filter(([id])=>fish.some(f=>f.id===id));
  if(!rows.length)content.append(el("p","",bwText("Hang a plaque from a personal-best catch to start your wall.","Cuelga una placa desde una captura récord para empezar tu colección.")));
  for(const [id,r] of rows.sort((a,b)=>b[1].at-a[1].at))content.append(trophyEntry(fish.find(f=>f.id===id),r));
 }
 function recordReward(box,f,kg){
  if(netResult)box.append(el("p","reward",netResult.join(" + ")+" · "+bwText("Crew catch","Captura en equipo")));
  if(!catchInfo.personal.improved)return;
  if(catchInfo.personal.previous){const comparison=el("div","bw-compare");for(const n of [catchInfo.personal.previous,kg]){const fig=el("figure"),im=el("img");im.src="assets/"+f.id+".png";im.alt="";im.style.width=Math.cbrt(n/kg)*95+"%";fig.append(im,el("figcaption","",weight(n)));comparison.append(fig);}box.append(comparison);}
  const hang=actButton(bwText("Hang record plaque","Colgar placa del récord"),()=>{upgrades.plaques[f.id]={kg,at:save.records[f.id].bestAt||Date.now(),lure:castLure,crew:netResult||[]};persist();hang.replaceWith(trophyEntry(f,upgrades.plaques[f.id]));},"secondary");box.append(hang);
 }
 function bwControls(){
  $("boathouse").textContent=bwText("Boathouse","Casa del pescador");$("boathouse").disabled=cupPlaying||!["ready","escape","released"].includes(phase);
  $("lureWork").textContent=pick(Bluewater.styles[upgrades.gear])+" · "+bwText("work lure","mover señuelo");
  $("lureWork").disabled=cupPlaying||!["ready","wait","released","escape"].includes(phase);
  $("lureMode").disabled=$("lureWork").disabled;$("lureMode").textContent=bwText("Change retrieve","Cambiar movimiento");
  $("lanternScan").hidden=save.charm!=="eclipseangler"||cupPlaying;$("lanternScan").disabled=scanSpent;
  $("lanternScan").textContent=bwText("Light the Eclipse Lantern","Encender la Linterna del Eclipse");
  const mark=Bluewater.sites[upgrades.active];if(!cupPlaying&&mark&&mark.port===save.place){$("locationName").textContent=pick(mark.name);scene.classList.toggle("bw-night",upgrades.active===2);}
 }
 function charmEffect(symbol){flare={symbol,until:t+2};}
 function workLure(){if($("lureWork").disabled)return;lureWorked=true;workedAt=t;
  if(phase==="wait"&&!legendOn&&!seaPass){runningFish=Bluewater.visitCandidate(runningFish,save.place,upgrades,true);biteAfter=Math.min(biteAfter,phaseTime+1.3);}
  toast(pick(Bluewater.styles[upgrades.gear]));}
 function signatureTick(){
  const cue=Bluewater.manoeuvres[Bluewater.signature(runningFish)],round=Math.floor(fight.age/7),position=fight.age%7;
  if(position>=1&&position<3.8&&fight.bwRound!==round){fight.bwRound=round;fight.bwDone=false;
   $("speciesCue").hidden=false;$("speciesHint").textContent=(upgrades.crew.length?upgrades.crew[1]+" · ":"")+pick(cue.cue);$("speciesAction").textContent=cue.icon+" "+pick(cue.action);say(pick(cue.cue));}
  if(position>=3.8&&!fight.bwDone&&fight.bwRound===round){fight.bwDone=true;fight.tension=Math.min(.92,fight.tension+(save.calm?.015:.07));$("speciesCue").hidden=true;}
 }
 function drawExtras(){
  const {w,h}=viewport;if(!w)return;
  if(t-workedAt<2.8&&!cupPlaying){
   const q=t-workedAt,wx=(target.x+Math.sin(q*6)*.025)*w,wy=(diving?Dive.depthY(target.y):target.y)*h+(upgrades.gear===2?q*5:Math.sin(q*8)*4);
   ctx.fillStyle="#ffce70";ctx.fillRect(wx-4,wy-2,9,4);if(diving){const f=runningFish||Waters.pools[save.place].find(f=>Bluewater.technique(f)===upgrades.gear);if(f)Dive.swim(ctx,sprite(f.id),wx-w*(.18-.045*q),wy+5,w*.12,false,0,t);}
  }
  if(phase==="fight"&&!cupPlaying&&!$("speciesCue").hidden&&runningFish){
   const mode=Bluewater.signature(runningFish),u=Math.max(0,Math.min(1,(fight.age%7-1)/2.8));
   const px=mode===2?.5+.19*Math.cos(u*6.28):.46+.18*u,py=mode===0?.66-.33*Math.sin(Math.PI*u):mode===1?.51+.27*u:.64+.09*Math.sin(u*6.28);
   ctx.save();ctx.globalAlpha=.86;Dive.swim(ctx,sprite(runningFish.id),w*px,h*py,w*.16,mode===2&&u<.5,mode===0?-.6*Math.cos(Math.PI*u):mode===1?.45:0,t);ctx.restore();
  }
  if(scanUntil>t){const pool=Waters.pools[save.place];for(let i=0;i<4;i++){const f=pool[(i*2)%pool.length];ctx.save();ctx.globalAlpha=.65;ctx.shadowColor="#95ffed";ctx.shadowBlur=10;Dive.swim(ctx,sprite(f.id),w*(.17+.22*i+.025*Math.sin(t)),h*(.60+.06*(i%3)),w*.12,false,0,t);ctx.restore();}}
  if(flare&&flare.until>t){ctx.save();ctx.font="bold "+Math.round(w*.075)+"px serif";ctx.fillStyle="#fff2a5";ctx.shadowBlur=15;ctx.shadowColor="#ffd376";ctx.textAlign="center";ctx.fillText(flare.symbol,w*.5,h*.42);ctx.restore();}
 }
 $("boathouse").onclick=homePort;$("lureMode").onclick=()=>{upgrades.gear=(upgrades.gear+1)%3;persist();bwControls();};$("lureWork").onclick=workLure;
 $("lanternScan").onclick=()=>{if(scanSpent||save.charm!=="eclipseangler")return;scanSpent=true;scanUntil=t+5;charmEffect("☾");bwControls();};
 $("speciesAction").onclick=()=>{if(phase!=="fight"||fight.bwDone||$("speciesCue").hidden)return;fight.bwDone=true;const move=Bluewater.signature(runningFish);if(move===2)clearHold();fight.tension=Math.max(.05,fight.tension-[.14,.10,.28][move]);fight.progress=Math.min(.99,fight.progress+[.10,.14,.065][move]);$("speciesCue").hidden=true;toast(bwText("Clean counter!","¡Buena maniobra!"));};

 if(navigator.serviceWorker&&location.pathname.startsWith("/games/starfall-anglers/"))navigator.serviceWorker.register("/sw.js").catch(()=>{});
 renderAll();fit();new ResizeObserver(fit).observe(scene);requestAnimationFrame(frame);
 if(location.hash==="#hunting")openHunting();
})();
