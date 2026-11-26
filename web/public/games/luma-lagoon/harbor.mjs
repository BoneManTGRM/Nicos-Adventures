import {destinations, outfits, journey, discoveries, canVisit, completeTrip, dress, moveHome} from './expeditions.mjs';
import {expeditionTrial} from './trials.mjs';
import {advance} from './pet.mjs';

function element(tag,cls,text){
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=text;
  return node;
}
function control(cls,text,act){
  const b=element('button',cls,text);b.type='button';b.onclick=act;return b;
}
const $=id=>document.getElementById(id);
export function mountHarbor({current,language,update,tone,leaveFireflies}){
  let view='lagoon', cache='', trialOpen=false;
  function switchView(target){
    if(trialOpen)return;
    leaveFireflies();
    view=target;cache='';refresh();
  }
  function refresh() {
    const p=current(), j=journey(p), lang=language(), idx=lang==='es-MX'?1:0;
    const w=(en,es)=>idx?es:en;
    const sleeping=p && advance(p,Date.now()).sleeping;
    const key=JSON.stringify([view,lang,p?.name,j,Boolean(sleeping)]);
    if(key===cache)return;
    cache=key;
    const count=discoveries(j);
    if(!p)view='lagoon';
    const home=$('habitat'), panel=$('port'), tabs=$('harborNav');
    const bg=destinations[j.home-1]?.art || 'lagoon.webp';
    home.style.backgroundImage='url('+bg+')';
    $('placeName').textContent=j.home ? destinations[j.home-1].name[idx] : w('Moonwater Cove','Bahía de la Luna');
    $('wallet').textContent='◈ '+j.pearls+' '+w(j.pearls===1?'pearl':'pearls',j.pearls===1?'perla':'perlas');
    $('wallet').hidden=!p;
    tabs.hidden=!p;panel.hidden=!p||view==='lagoon';
    home.hidden=!!p && view!=='lagoon';
    $('home').hidden=!p||view!=='lagoon';
    $('postcards').hidden=!!p;
    $('postcardsTitle').textContent=w('Waiting beyond the lagoon','Más allá de la laguna');
    const tabNames={lagoon:w('Lagoon','Laguna'),map:w('Expeditions','Expediciones'),journal:w('Treasures','Tesoros'),studio:w('Dress up','Vestidor')};
    for (const b of tabs.children){
      b.lastElementChild.textContent=tabNames[b.dataset.view];
      b.setAttribute('aria-pressed',String(view===b.dataset.view));
    }
    for(const [i,label] of [...$('postcardRow').querySelectorAll('b')].entries())label.textContent=destinations[i].name[idx];
    if(!p)return;
    $('petTouch').setAttribute('aria-label',w('Pet ','Acariciar a ')+p.name);
    if(view==='lagoon')return;
    const oldFocus=document.activeElement?.id;
    panel.replaceChildren();
    const heading=element('div','portHeading');
    const title=view==='map'?w('Expedition map','Mapa de expediciones'):view==='journal'?w('Treasure journal','Diario de tesoros'):w('Lagoon studio','Estudio de la laguna');
    const counter=view==='studio'?'◈ '+j.pearls:count+'/12';
    heading.append(element('h2',null,title),element('b','counter',counter));panel.append(heading);

    if(view==='map'){
      const grid=element('div','routeGrid');
      for(const [i,r] of destinations.entries()){
        const open=canVisit(j,i), found=Math.min(j.wins[i],3);
        const card=element('article','routeCard'+(open?'':' locked'));
        const pic=element('div','routeArt');
        pic.style.backgroundImage='url('+r.art+')';pic.append(element('b','routeStamp',open?'✦ '+found+'/3':'◇'));
        const copy=element('div','routeCopy'), b=control('trailButton',w('Play','Jugar')+' · '+r.game[idx],()=>launch(i));
        b.id='route-'+i;b.disabled=!open||sleeping;
        if(!open)b.textContent=w('Find ','Encuentra ')+r.threshold+' '+w(r.threshold===1?'treasure':'treasures',r.threshold===1?'tesoro':'tesoros');
        else if(sleeping)b.textContent=w('Wake your pet first','Primero despierta a tu ajolote');
        copy.append(element('h3',null,r.name[idx]),element('p',null,r.mission[idx]),b);
        card.append(pic,copy);grid.append(card);
      }
      panel.append(grid);
    }
    if(view==='journal'){
      const intro=element('p','portIntro',count===12?w('The Aurora Halo is yours. Wear it in the lagoon!','¡El halo de aurora es tuyo y brilla en la laguna!'):
        w('Win an expedition to uncover its next treasure.','Completa una expedición para descubrir su siguiente tesoro.'));
      panel.append(intro);
      for(const [i,r] of destinations.entries()){
        const section=element('section','journalGroup'), row=element('div','relicRow');
        section.append(element('h3',null,r.name[idx]));
        for(const [n,relic] of r.relics.entries()){
          const found=j.wins[i]>n, box=element('details','relic'+(found?'':' unseen'));
          const summary=element('summary',null);
          summary.append(element('b','relicGlyph',found?relic[0]:'◇'),element('strong',null,found?relic[1+idx]:w('Undiscovered','Por descubrir')));
          box.append(summary,element('p',null,found?relic[3+idx]:w('Complete trip ','Completa el viaje ')+(n+1)+w(' here to reveal it.',' aquí para descubrirlo.')));
          row.append(box);
        }
        section.append(row);panel.append(section);
      }
    }
    if(view==='studio'){
      const pieces=element('div','shopGrid');
      panel.append(element('h3','subHead',w('Accessories','Accesorios')));
      for(const [id,item] of outfits.entries()){
        const bought=!!(j.owned & (1<<id)), wearing=j.wear===id;
        const b=control('shopItem','',()=>changeOutfit(id));b.id='outfit-'+id;
        b.setAttribute('aria-pressed',String(wearing));b.disabled=wearing||(!bought&&j.pearls<item.cost);
        const icon=element('span','itemGlyph');icon.dataset.item=id;
        if(!id)icon.textContent='♡';
        b.append(icon,element('b',null,item.name[idx]),element('small',null,
          wearing?w('Wearing','En uso'):bought?w('Wear','Usar'):'◈ '+item.cost));pieces.append(b);
      }
      panel.append(pieces,element('h3','subHead',w('Where to live','Dónde vivir')),
        element('p','portIntro',w('Finish a trip to bring its scenery home.','Completa un viaje para vivir en ese paisaje.')));
      const homes=element('div','homesGrid');
      for(let n=0;n<=4;n++){
        const r=destinations[n-1], active=j.home===n, unlocked=n===0||j.wins[n-1]>0;
        const b=control('homeChoice','',()=>changeHome(n));b.id='home-'+n;
        b.style.backgroundImage='linear-gradient(0deg,#0c1028ef,transparent),url('+(r?.art||'lagoon.webp')+')';
        b.setAttribute('aria-pressed',String(active));b.disabled=active||!unlocked;
        b.append(element('b',null,r?r.name[idx]:w('Moonwater Cove','Bahía de la Luna')),element('small',null,active?w('Home','Hogar'):unlocked?w('Move here','Vivir aquí'):w('Visit to unlock','Visita para obtener')));
        homes.append(b);
      }
      panel.append(homes);
    }
    if(oldFocus){const target=$(oldFocus);if(target && panel.contains(target)&&!target.disabled)target.focus({preventScroll:true});}
  }
  async function changeOutfit(id){
    await update(p=>{const next=p&&dress(p,id);return next && {pet:next,note:'wave'};});
    tone(659);
  }
  async function changeHome(n){
    await update(p=>{const next=p&&moveHome(p,n);return next && {pet:next,note:'wave'};});
    switchView('lagoon');tone(784);
  }
  function launch(route){
    const pet=current(), lang=language();
    if(!pet||trialOpen||advance(pet,Date.now()).sleeping||!canVisit(journey(pet),route))return;
    trialOpen=true;
    expeditionTrial({route,lang,pet,tone,finish: async()=>{
      let reward;
      const ok=await update(p=>{
        if(!p || p.born!==pet.born)return null;
        const old=journey(p), next=completeTrip(p,route,Date.now());
        if(!next)return null;
        reward={relic:destinations[route].relics[old.wins[route]],mastered:discoveries(old)<12&&discoveries(journey(next))===12};
        return {pet:next,note:'travel'};
      },'trip');
      return ok && reward;
    },afterClose:()=>{trialOpen=false;refresh();$('route-'+route)?.focus({preventScroll:true});}});
  }
  for(const b of $('harborNav').children)b.onclick=()=>switchView(b.dataset.view);
  return {refresh,view:()=>view};
}
