"use strict";
const FishKeeper=(()=>{
 function open({root,save,pick,tr,el,button,persist,say,beep,sprite,found,goDiving,moving,lit,setMoving,setLit,studio}){
  const fromId=id=>Waters.fish.find(f=>f.id===id);
  const names=Waters.tankNames;
  let guests=!save.display.length,model,selected=null,following=false,lastRelease=null,last=0,dirty=true;
  let stockPage=0,expanded=false;
  const room=el("section","aquarium-room"),audience=el("div","exhibit-audience"),stage=el("div","exhibit-glass");
  const glass=el("canvas","exhibit-water"),plaque=el("div","exhibit-plaque"),habitat=el("strong"),population=el("span");
  const status=el("div","exhibit-status");status.setAttribute("role","status");plaque.append(population,habitat);const tag=el("span","keeper-name-tag");tag.setAttribute("aria-hidden","true");stage.append(glass,plaque,tag,status);
  glass.setAttribute("role","img");glass.setAttribute("aria-label",tr("personalTank"));
  const row=el("div","keeper-fish-row");row.setAttribute("role","group");row.setAttribute("aria-label",tr("selectAnimal"));
  const card=el("section","keeper-card"),portrait=el("img","keeper-portrait"),identity=el("div","keeper-identity"),title=el("h3"),meta=el("p"),snacks=el("span","meal-count");
  const personalityNote=el("p","keeper-personality");
  const facts=el("details","keeper-facts"),factsText=el("p");facts.append(el("summary","",tr("fishNotes")),factsText);
  const head=el("div","keeper-head");portrait.alt="";identity.append(title,meta);head.append(portrait,identity,snacks);
  const actions=el("div","keeper-actions"),forms=el("div","keeper-forms"),feedback=el("div","keeper-feedback");feedback.setAttribute("role","status");
  const themes=el("div","exhibit-themes"),tools=el("div","exhibit-controls"),keeper=el("details","exhibit-keeper"),summary=el("summary"),stockList=el("div","display-list");
  const totals=el("div","exhibit-totals"),overview=el("span"),meter=el("meter");
  meter.min=0;meter.max=Waters.aquariumLimit;meter.setAttribute("aria-label",textLine("Total fish on display","Total de peces en exhibición"));totals.append(overview,meter);
  const note=el("p","keeper-empty");keeper.append(summary,stockList);
  const ownButton=button(tr("collectionTank"),()=>changeView(false),"theme"),guestButton=button(tr("guestShoal"),()=>changeView(true),"theme");
  audience.setAttribute("role","group");audience.setAttribute("aria-label",tr("aquarium"));audience.append(ownButton,guestButton);
  const expandButton=button("",()=>{
   expanded=!expanded;root.closest("dialog").classList.toggle("tank-expanded",expanded);
   updateViewButton();stage.scrollIntoView({block:"nearest"});dirty=true;
  },"theme expand-view");audience.append(expandButton);
  audience.append(button(textLine("Dive into tank","Bucear en el acuario"),()=>studio(model,label,false,mealTaken),"theme"),button(textLine("Design your tank","Diseña tu acuario"),()=>studio(model,label,true,mealTaken),"theme"));
  function updateViewButton(){
   expandButton.textContent=expanded?textLine("Standard view","Vista normal"):textLine("Expand view","Ampliar vista");
   expandButton.setAttribute("aria-pressed",String(expanded));
  }
  updateViewButton();
  function label(key){
   if(save.care[key]?.name)return save.care[key].name;
   const f=fromId(Waters.speciesId(key)),n=key.split("~")[1];
   const numbered=!key.includes(":")&&(save.records[f.id]?.n||0)>1;
   return pick(f.name)+(numbered?" #"+(n||1):"");
  }
  function announce(text){status.textContent=text;say(text);}
  function speciesFor(key){return fromId(Waters.speciesId(key));}
  function info(key){return save.care[key]??={name:"",meals:0};}
  function textLine(en,es){return pick([en,es]);}
  function action(word,fn){const b=button(tr(word),fn,"keeper-action");actions.append(b);return b;}
  const feedButton=action("handFeed",handFeed),followButton=action("follow",toggleFollowing),releaseButton=action("releaseOne",offerRelease),renameButton=action("nameOne",rename);
  const moveButton=button(textLine("Move fish","Mover pez"),offerMove,"keeper-action");
  actions.append(moveButton);
  function offerMove(){
   if(guests||!selected)return;
   setFollowing(false);
   const key=selected,box=el("div","release-prompt");
   box.append(el("strong","",textLine("Move "+label(key)+" to…","Mover a "+label(key)+" a…")));
   for(const home of Waters.tankIds.filter(id=>id!==save.tank)){
    const choice=button(tr(names[home])+" · "+countLabel(home),()=>{
     if(!Waters.moveFish(save,key,home))return;
     save.tank=home;persist();setup();select(key);
     announce(textLine(label(key)+" is now in "+tr(names[home])+".",label(key)+" ahora vive en "+tr(names[home])+"."));
     moveButton.focus({preventScroll:true});
    },"theme");
    choice.disabled=!Waters.hasRoom(save,home);box.append(choice);
   }
   box.append(button(tr("cancelCare"),()=>{forms.replaceChildren();moveButton.focus();},"theme"));
   forms.replaceChildren(box);box.querySelector("button:enabled").focus({preventScroll:true});
  }
  function countLabel(home){return Waters.fishInTank(save,home).length+"/"+Waters.tankLimit;}
  const greetButton=button(textLine("Greet at glass","Saludar en el cristal"),()=>greetSelected(.50,.46),"keeper-action");
  actions.append(greetButton);
  function greetSelected(x,y){
   if(!selected)return;
   const key=selected,trait=Aquarium.personality(key),meals=save.care[key]?.meals||0;
   setFollowing(false);Aquarium.greet(model,key,x,y,meals,!moving);
   const reaction=trait===1&&meals>=3?textLine("Recognizes your hand and swims out.","Reconoce tu mano y sale de su refugio."):pick(Aquarium.traits[trait].note);
   announce(label(key)+" · "+reaction);dirty=true;
  }
  let bellKey=null,bellTime=0;
  const bell=button(textLine("Ring feeding bell","Tocar campana"),()=>{
   const s=model.swimmers.find(s=>s.key===selected);if(!s)return;
   const now=performance.now(),trust=save.care[selected]?.meals||0;
   if(s.trait===1&&trust<3&&(bellKey!==selected||now-bellTime>4000)){bellKey=selected;bellTime=now;announce(textLine("A shy peek. Ring once more.","Se asoma con timidez. Toca otra vez."));return;}
   s.trick=s.f.id==="archerfish"?"jet":s.trait===2?"loop":"come";s.trickTime=3;
   Aquarium.greet(model,selected,.49,.36,trust,!moving);
   announce(s.trick==="jet"?textLine("A jet of water strikes the bell!","¡Un chorro de agua toca la campana!"):label(selected)+" · "+pick(Aquarium.traits[s.trait].note));dirty=true;
  },"keeper-action");actions.append(bell);
  function describeAction(b,word,key){b.setAttribute("aria-label",tr(word)+" · "+label(key));}
  function paintMeals(){
   if(!selected)return;
   const meals=save.care[selected]?.meals||0;
   const trait=Aquarium.traits[Aquarium.personality(selected)];
   personalityNote.textContent=pick(trait.name)+" · "+(meals>=3?textLine("Recognizes your hand.","Reconoce tu mano."):textLine("Getting to know you ("+meals+"/3 hand-fed treats).","Está conociéndote ("+meals+"/3 bocados de tu mano)."));
   if(meals>=1)personalityNote.textContent+=" "+(Waters.speciesId(selected)==="archerfish"?textLine("Try the feeding bell to see its water jet.","Toca la campana para ver su chorro de agua."):pick(trait.note));
   snacks.textContent=meals+" "+tr(meals===1?"meal":"meals");
   feedButton.disabled=model.food.some(p=>p.forKey===selected);
  }
  function mealTaken(key){
   const entry=info(key);entry.meals=Math.min(1000000,entry.meals+1);persist();if(key===selected)paintMeals();
   announce(textLine(label(key)+" ate the treat!",label(key)+" se comió el bocado."));beep([587,784],.045);
  }
  function handFeed(){
   if(!selected||!Aquarium.treat(model,selected,!moving))return;
   setFollowing(false);
   if(!moving)mealTaken(selected);
   else{paintMeals();announce(textLine("A treat for "+label(selected),"Un bocado para "+label(selected)));beep([659],.04);}
   dirty=true;
  }
  function setFollowing(on){
   following=on;followButton.setAttribute("aria-pressed",String(on));stage.classList.toggle("leading-fish",on);
   if(!on)model.lead=null;
  }
  function toggleFollowing(){
   if(!selected||!moving)return;
   forms.replaceChildren();setFollowing(!following);
   if(following){
    Aquarium.guide(model,selected,.50,.43);announce(tr("followHint"));glass.focus({preventScroll:true});
   }else announce("");
  }
  function select(key,explicit=true){
   const s=model.swimmers.find(f=>f.key===key);selected=s?.key||null;model.focused=selected;
   forms.replaceChildren();setFollowing(false);tag.hidden=!selected;card.hidden=!selected;note.hidden=!!selected;
   for(const b of row.children)b.setAttribute("aria-pressed",String(b.dataset.key===selected));
   if(!s){note.textContent=tr(guests?"emptyResidents":"emptyPersonal");return;}
   portrait.src="assets/"+s.f.id+".png";title.textContent=label(key);tag.textContent=label(key);factsText.textContent=pick(s.f.note);
   meta.textContent=(save.care[key]?.name?pick(s.f.name)+" · ":"")+pick(Waters.places[s.f.place].name);
   paintMeals();followButton.disabled=!moving;moveButton.hidden=guests;
   moveButton.setAttribute("aria-label",textLine("Move fish","Mover pez")+" · "+label(key));
   for(const [b,word] of [[feedButton,"handFeed"],[followButton,"follow"],[releaseButton,"releaseOne"],[renameButton,"nameOne"]])describeAction(b,word,key);
   if(explicit){status.textContent="";say(label(key));dirty=true;}
  }
  function rename(){
   if(!selected)return;
   const key=selected,f=speciesFor(key),form=el("form","keeper-form"),input=el("input"),caption=el("label","",tr("nickname"));
   input.type="text";input.maxLength=24;input.autocomplete="off";input.value=save.care[key]?.name||"";input.placeholder=pick(f.name);
   caption.append(input);const submit=el("button","theme",tr("saveName"));submit.type="submit";
   const cancel=button(tr("cancelCare"),()=>{forms.replaceChildren();renameButton.focus();},"theme");
   form.append(caption,submit,cancel);forms.replaceChildren(form);input.focus({preventScroll:true});
   form.onsubmit=e=>{e.preventDefault();if(key!==selected)return;info(key).name=Array.from(input.value.trim()).slice(0,24).join("");persist();refresh();select(key);renameButton.focus({preventScroll:true});};
  }
  function offerRelease(){
   if(!selected)return;
   setFollowing(false);const key=selected,name=label(key),place=Waters.places[speciesFor(key).place],home=pick(place.name);sprite(place.id);
   const box=el("div","release-prompt"),question=el("strong","",textLine("Release "+name+" to "+home+"?","¿Soltar a "+name+" en "+home+"?"));
   const yes=button(tr("openGate"),()=>release(key),"gate-button"),no=button(tr("keepHere"),()=>{forms.replaceChildren();releaseButton.focus();},"theme");
   box.append(question,el("span","",tr("keepGuide")),no,yes);forms.replaceChildren(box);no.focus({preventScroll:true});
  }
  function release(key){
   if(key!==selected||!model.swimmers.some(s=>s.key===key)||!Waters.setExhibited(save,key,guests,false))return;
   const name=label(key),home=pick(Waters.places[speciesFor(key).place].name);
   lastRelease={key,guests,habitat:save.tank};persist();
   Aquarium.release(model,key,moving);refresh();select(model.swimmers[0]?.key,false);
   const text=textLine(name+" swam home to "+home+".",name+" volvió a "+home+".");
   feedback.replaceChildren(el("span","",text));
   const undo=button(tr("undoRelease"),undoRelease,"theme");feedback.append(undo);
   status.textContent=moving?tr("gateOpen"):"";say(text);beep([784,659,523],.07);undo.focus({preventScroll:true});
  }
  function undoRelease(){
   if(!lastRelease)return;
   const {key,guests:wasGuest,habitat:prior}=lastRelease;
   if(!Waters.setExhibited(save,key,wasGuest,true,prior)){announce(tr("tankFull"));return;}
   save.tank=prior;
   persist();lastRelease=null;feedback.replaceChildren();
   if(guests!==wasGuest||model.habitat!==save.tank){guests=wasGuest;setup();}
   else{Aquarium.stock(model,key,fromId);refresh();}
   select(key);feedButton.focus({preventScroll:true});
  }
  function changeView(which){
   if(guests===which)return;guests=which;setup();
  }
  function rebuildRow(){
   row.replaceChildren();
   for(const s of model.swimmers){
    const b=button("",()=>select(s.key),"fish-token"),im=el("img");im.alt="";im.src="assets/"+s.f.id+".png";
    b.dataset.key=s.key;b.setAttribute("aria-label",tr("selectAnimal")+" · "+label(s.key));b.setAttribute("aria-pressed",String(s.key===selected));
    b.title=label(s.key);b.append(im,el("span","",label(s.key)));row.append(b);
   }
  }
  function restock(key){
   if(!Waters.setExhibited(save,key,guests,true))return;
   if(lastRelease?.key===key){lastRelease=null;feedback.replaceChildren();}
   persist();Aquarium.stock(model,key,fromId);refresh();select(key);feedButton.focus({preventScroll:true});
  }
  function manager(){
   stockList.replaceChildren();summary.textContent=guests?tr("inviteResidents"):tr("stockFish")+" · "+countLabel(save.tank);
   if(!keeper.open)return;
   const keys=guests?Waters.residentRoster[save.tank].map(id=>save.tank+":"+id).filter(k=>save.residentAway.includes(k)):
    found.flatMap(f=>Waters.specimens(f.id,save.records,save.photos)).filter(k=>!save.display.includes(k));
   stockPage=Math.min(stockPage,Math.max(0,Math.ceil(keys.length/24)-1));
   for(const key of keys.slice(stockPage*24,(stockPage+1)*24)){
    const b=button("",()=>restock(key),"display-choice"),im=el("img");im.alt="";im.loading="lazy";im.src="assets/"+speciesFor(key).id+".png";
    b.disabled=!guests&&!Waters.hasRoom(save,save.tank);b.setAttribute("aria-label",tr("invite")+" · "+label(key));b.append(im,el("span","",label(key)),el("b","","+"));stockList.append(b);
   }
   if(keys.length>24){
    const pages=el("div","stock-pages");
    for(const [dir,en,es] of [[-1,"Previous","Anterior"],[1,"Next","Siguiente"]]){
     const page=button(textLine(en,es),()=>{stockPage+=dir;manager();stockList.querySelector("button:enabled")?.focus();},"theme");
     page.disabled=(stockPage+dir)*24>=keys.length||stockPage+dir<0;pages.append(page);
    }
    pages.insertBefore(el("span","",(stockPage+1)+" / "+Math.ceil(keys.length/24)),pages.lastChild);stockList.append(pages);
   }
   if(!keys.length){stockList.append(el("p","",tr(guests?"allResidents":found.length?"allExhibited":"residentHint")));
    if(!guests&&!found.length)stockList.append(button(tr("startDiving"),goDiving,"theme"));}
  }
  keeper.addEventListener("toggle",manager);
  function refresh(){
   population.textContent=tr(guests?"guestShoal":"collectionTank")+" · "+(guests?model.swimmers.length:countLabel(save.tank));
   overview.textContent=textLine("Your fish","Tus peces")+" · "+save.display.length+" / "+Waters.aquariumLimit;
   meter.value=save.display.length;
   for(const tab of themes.children){
    const home=tab.dataset.theme;tab.lastChild.textContent=countLabel(home);
    tab.setAttribute("aria-pressed",String(home===save.tank));
   }
   rebuildRow();manager();groupFood.disabled=!moving||!model.swimmers.length;
   if(lastRelease&&!lastRelease.guests&&!Waters.hasRoom(save,lastRelease.habitat)){lastRelease=null;feedback.replaceChildren();}
   dirty=true;
  }
  function setup(){
   stockPage=0;model=Aquarium.create(Waters.fishInTank(save),save.tank,fromId,{visitors:guests,away:save.residentAway});model.lit=lit;model.decor=save.adventures.design[save.tank]||[];
   ownButton.setAttribute("aria-pressed",String(!guests));guestButton.setAttribute("aria-pressed",String(guests));
   for(const s of model.swimmers)sprite(s.f.id);
   stage.style.backgroundImage='url("assets/exhibit-'+save.tank+'.webp")';habitat.textContent=tr(names[save.tank]);
   status.textContent="";refresh();select(model.swimmers[0]?.key,false);
  }
  function groupFeed(x,y){
   if(!moving||!model.swimmers.length)return;
   Aquarium.feed(model,x,y);announce(tr("foodDrop"));beep([510,660],.045);dirty=true;
  }
  function tool(word,fn){const b=button(tr(word),fn,"exhibit-button");tools.append(b);return b;}
  const groupFood=tool("feedShoal",()=>groupFeed(.30+Math.random()*.40,.31));
  const light=tool("lights",()=>{lit=!lit;setLit(lit);model.lit=lit;light.setAttribute("aria-pressed",String(lit));dirty=true;});
  const motion=tool("motion",()=>{moving=!moving;setMoving(moving);motion.setAttribute("aria-pressed",String(moving));setFollowing(false);groupFood.disabled=!moving||!model.swimmers.length;followButton.disabled=!moving;
   if(!moving){
    for(const p of model.food.filter(p=>p.forKey))mealTaken(p.forKey);
    model.food=model.food.filter(p=>!p.forKey);model.departures=[];
   }
   paintMeals();announce(moving?"":tr("pausedTank"));dirty=true;
  });
  light.setAttribute("aria-pressed",String(lit));motion.setAttribute("aria-pressed",String(moving));
  themes.setAttribute("role","group");themes.setAttribute("aria-label",tr("setTank"));
  for(const [theme,word] of Object.entries(names)){
   const b=button("",()=>{if(theme===save.tank)return;save.tank=theme;persist();setup();},"habitat-tab");
   b.dataset.theme=theme;b.style.setProperty("--scene",'url("assets/exhibit-'+theme+'.webp")');
   b.append(el("span","habitat-name",tr(word)),el("span","habitat-count"));themes.append(b);
  }
  function position(e){const rect=glass.getBoundingClientRect();return{x:(e.clientX-rect.left)/rect.width,y:(e.clientY-rect.top)/rect.height,aspect:rect.width/rect.height};}
  let pointer=null;
  glass.tabIndex=0;
  glass.addEventListener("pointerdown",e=>{
   if(!following||!e.isPrimary||e.button!==0)return;
   pointer=e.pointerId;glass.setPointerCapture(pointer);const p=position(e);Aquarium.guide(model,selected,p.x,p.y);
  });
  glass.addEventListener("pointermove",e=>{
   if(e.pointerId!==pointer||!following)return;const p=position(e);Aquarium.guide(model,selected,p.x,p.y);
  });
  glass.addEventListener("pointerup",e=>{
   if(!e.isPrimary||e.button!==0)return;
   const p=position(e);pointer=null;if(following){Aquarium.guide(model,selected,p.x,p.y);return;}
   const hit=Aquarium.nearest(model,p.x,p.y,p.aspect);if(hit){select(hit.key);greetSelected(p.x,p.y);}else groupFeed(p.x,p.y);
  });
  glass.addEventListener("lostpointercapture",()=>{pointer=null;});
  glass.addEventListener("keydown",e=>{
   if(!following)return;
   const directions={ArrowLeft:[-.09,0],ArrowRight:[.09,0],ArrowUp:[0,-.09],ArrowDown:[0,.09]};
   if(!directions[e.key])return;e.preventDefault();const [dx,dy]=directions[e.key];
   const at=model.lead||model.swimmers.find(s=>s.key===selected);if(at)Aquarium.guide(model,selected,at.x+dx,at.y+dy);
  });
  card.append(head,personalityNote,actions,forms,facts);room.append(totals,themes,audience,stage,el("p","pick-hint",tr("selectHint")),row,card,note,feedback,tools,keeper);root.append(room);setup();
  return now=>{
   if(now-last<40&&!dirty)return;
   const dt=last?Math.min(.1,(now-last)/1000):0;last=now;
   const w=Math.round(glass.clientWidth*Math.min(1.5,devicePixelRatio||1)),h=Math.round(glass.clientHeight*Math.min(1.5,devicePixelRatio||1));if(!w||!h)return;
   const ctx=glass.getContext("2d");
   if(glass.width!==w||glass.height!==h){glass.width=w;glass.height=h;ctx.imageSmoothingEnabled=false;}
   if(moving){const exiting=model.departures.length,hadFood=model.food.length;for(const key of Aquarium.advance(model,dt))mealTaken(key);if(hadFood&&!model.food.length&&status.textContent===tr("foodDrop"))status.textContent="";if(exiting&&!model.departures.length&&status.textContent===tr("gateOpen"))status.textContent="";}
   Aquarium.paint(ctx,w,h,model,sprite);
   const watched=model.swimmers.find(s=>s.key===selected);
   if(watched){
    tag.style.left=(Math.max(.18,Math.min(.82,watched.x))*100)+"%";
    tag.style.top=Math.min(90,100*(watched.y+.045)+Math.min(14,Aquarium.drawSize(model,watched)*24*w/h))+"%";
   }
   dirty=false;
  };
 }
 return {open};
})();
