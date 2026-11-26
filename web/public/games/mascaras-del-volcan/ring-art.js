/* Painted action cels, anchored to the same feet and move timings as the bout. */
(() => {
  'use strict';
  const outlineFighter=window.drawLuchador;
  const pictures=new Map();
  const roster=window.volcanPaintedRoster;
  const poses={ready:0,stepA:1,stepB:2,guard:3,chop:4,grab:5,lift:6,fly:7,hit:8,down:9,cover:10,win:11};
  // Standing height (or length for horizontal cels) in local ring units.
  const size=[112,113,113,103,108,87,127,131,109,123,91,128];
  const anchor=[.51,.51,.51,.52,.36,.37,.48,.54,.48,.50,.43,.50];
  const bound=n=>Math.max(0,Math.min(1,n));
  const pulse=n=>Math.sin(Math.PI*bound(n));
  const idlePace=[1,1.16,.91,.78,1.19,.89,1.04,.72];

  function requestArt(id){
    if(pictures.has(id))return pictures.get(id);
    const info=roster[id],image=new Image(),record={image,ready:false};pictures.set(id,record);
    image.onload=()=>{record.ready=true;window.dispatchEvent(new CustomEvent('volcan-art-ready',{detail:id}));};
    image.decoding='async';image.src=info.file;
    return record;
  }
  function gesture(pose,u,time,id,role){
    const t=time*idlePace[id],beat=Math.sin(t*4.4+id*.45),stride=Math.sin(u*Math.PI*2);
    let cel=poses.ready,x=0,y=0,turn=0,squash=1,lean=0,feetFirst=false;
    switch(pose){
      case 'walk':
        cel=Math.abs(stride)<.27?poses.ready:stride>0?poses.stepA:poses.stepB;
        y=-2.5*Math.abs(stride);lean=stride*1.7;turn=.02;break;
      case 'guard':
        cel=poses.guard;squash=.98+beat*.013;lean=-1.2+beat;break;
      case 'strike': case 'counter': {
        const impact=bound((u-.13)/.32),recover=bound((u-.60)/.4);
        cel=u<.15||u>.85?poses.guard:poses.chop;
        x=-2*pulse(u/.18)+6*impact*(1-recover);
        lean=5*impact*(1-recover);turn=.035*pulse(u);
        break;
      }
      case 'throw':case 'combo':
        cel=u<.42?poses.grab:u<.83?poses.lift:poses.chop;
        lean=u<.42?4*pulse(u/.42):-3*pulse((u-.42)/.41);y=-3*pulse((u-.42)/.5);
        x=2*pulse(u);break;
      case 'charge':
        cel=u<.22?poses.guard:u<.78?poses.stepA:poses.chop;
        turn=u<.22?-.07:.13;y=-2.4*Math.abs(Math.sin(u*13));lean=2.8;break;
      case 'dive':case 'spring':{
        const spring=pose==='spring';
        cel=u<(spring?.24:.12)?poses.grab:u>.95?poses.cover:poses.fly;
        if(cel===poses.fly){turn=-.2+.39*u;y=-17*pulse(u);}
        else squash=.97;
        break;
      }
      case 'hit':
        cel=poses.hit;turn=-.12*pulse(u);x=-3*pulse(u);lean=-3*pulse(u);break;
      case 'down':
        cel=poses.down;squash=1+.015*Math.sin(t*3);break;
      case 'pin':
        cel=poses.cover;lean=1.6*Math.sin(t*3.4);squash=.99+.012*beat;break;
      case 'tagOut':
        cel=u<.23?poses.stepB:u<.45?poses.stepA:poses.chop;
        turn=.035*pulse(u);lean=2.5*pulse(u);break;
      case 'tagIn':
        cel=u<.25?poses.chop:u<.55?poses.grab:u<.83?poses.fly:poses.stepA;
        turn=cel===poses.fly?-.32:0;break;
      case 'apron':
        cel=Math.sin(t*2.5+id)>.78?poses.lift:poses.ready;
        lean=1.8*beat;y=-Math.max(0,beat)*1.3;break;
      case 'doubleTeam':
        feetFirst=!!role&&u>=.21&&u<.79;
        cel=u<.21?poses.grab:u<.79?(feetFirst?poses.down:poses.fly):role?poses.cover:poses.stepB;
        if(feetFirst){turn=-.27;y=-11*pulse(u);}
        else if(cel===poses.fly){turn=.15;y=-4*pulse(u);}
        break;
      case 'celebrate':case 'win':case 'entrance':
        cel=poses.win;lean=2.3*beat;y=-Math.max(0,beat)*1.4;break;
      default:
        lean=1.6*beat;squash=1+.016*beat;y=-.8*Math.max(0,beat);
    }
    return {cel,x,y,turn,squash,lean,feetFirst};
  }

  function drawPainted(ctx,options={}){
    const {id=0,x=0,y=0,scale=1,face=1,pose='idle',phase=0,time=0,teamRole=0}=options;
    if(!roster[id])return outlineFighter(ctx,options);
    const art=requestArt(id);
    if(!art.ready)return outlineFighter(ctx,options);
    const g=gesture(pose,bound(phase),time,id,teamRole);
    const frame=roster[id].frames[g.cel], [sx,sy,sw,sh]=frame;
    const flat=g.cel===poses.fly||g.cel===poses.down||g.cel===poses.cover;
    const ratio=size[g.cel]/(flat?sw:sh),width=sw*ratio,height=sh*ratio;
    ctx.save();
    ctx.translate(x,y);ctx.scale((face<0?-1:1)*scale,scale);
    ctx.translate(g.x,g.y);ctx.rotate(g.turn);
    if(g.feetFirst)ctx.scale(-1,1);
    ctx.transform(1,0,-g.lean/height,g.squash,0,0);
    ctx.drawImage(art.image,sx,sy,sw,sh,-width*anchor[g.cel],-height,width,height);
    ctx.restore();
  }
  window.drawLuchador=drawPainted;
  window.prepareLuchadores=ids=>ids.forEach(requestArt);
})();
