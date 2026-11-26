(() => {
  'use strict';

  const ink = '#202034';
  const cream = '#ffedbd';
  const bound = value => Math.max(0, Math.min(1, value));

  function trace(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  }
  function shape(ctx, points, fill, stroke, weight = 1) {
    trace(ctx, points);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.stroke(); }
  }
  function line(ctx, points, color, weight) {
    trace(ctx, points);
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  }
  function ellipse(ctx, x, y, rx, ry, color) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  }
  function stone(ctx, x, y, r, dark, light) {
    shape(ctx, [x, y-r, x+r*.88, y, x, y+r, x-r*.88, y], dark);
    shape(ctx, [x, y-r*.78, x+r*.52, y-.12*r, x-r*.42, y+.2*r], light);
  }
  function sparkle(ctx, x, y, length, color) {
    const n = length;
    shape(ctx,[x,y-n,x+n*.18,y-n*.18,x+n*.72,y,x+n*.18,y+n*.18,
      x,y+n,x-n*.18,y+n*.18,x-n*.72,y,x-n*.18,y-n*.18],color);
  }

  // A corner tab hangs from its y anchor; the crest faces center ring.
  function corner(ctx, hero, time, reduced) {
    const body = hero ? '#207d98' : '#a23e52';
    const edge = hero ? '#64d7ce' : '#f28a75';
    const shadow = hero ? '#304960' : '#643549';
    const flap = reduced ? 0 : Math.sin(time * 2.1 + (hero ? 0 : .8)) * .9;
    ctx.scale(hero ? 1 : -1, 1);
    // Woven pad and the two visible brass rivets securing it to the post.
    shape(ctx, [-11,-5,8,-6,13,-3,11,1,-11,2,-14,0], '#4c4551', ink, 1.1);
    shape(ctx, [-9,0,11,-1,15,4,15+flap,23,6+flap,18,-4+flap,27,-9+flap,22], shadow, ink, 1.4);
    shape(ctx, [-7,1,10,0,11+flap,19,5+flap,15,-3+flap,22,-7+flap,20], body);
    line(ctx, [-5,2,-4+flap,17,-2+flap,19,5+flap,12,9+flap,15], edge, .8);
    shape(ctx, [-4,5,6,3,2,8,6,8,-2,15,0,10,-4,10], cream);
    line(ctx, [-10,-4,9,-5,11,-4], '#a09083', 1.0);
    ellipse(ctx,-9,-2,1.2,1.2,'#d5b374'); ellipse(ctx,8,-3,1.2,1.2,'#d5b374');
  }

  const palettes = {
    clap: ['#fff4c9','#ffd369','#e8a14d','#8de5d6'],
    duo: ['#ffedaf','#f8bd53','#39bbac','#ef785b'],
    save: ['#fff4c9','#70e1cc','#62b6cc','#f6b65e']
  };
  function burst(ctx, kind, p, reduced) {
    const colors=palettes[kind], clap=kind==='clap', save=kind==='save';
    const power=clap ? .65 : (save ? .87 : 1.12);
    const rise = reduced ? .55 : 1-Math.pow(1-p,3);
    // Eased geometry, followed by a fade, keeps the instant of contact visible.
    const alpha = reduced ? Math.min(1,(1-p)*4) : Math.min(1,(1-p)*2.9);
    if(alpha <= 0) return;
    ctx.globalAlpha *= alpha;
    ctx.scale(power,power);
    const total = clap ? 9 : (save ? 9 : 15);
    for(let j=0;j<total;j++){
      const angle=2*Math.PI*j/total+(j%3-1)*.075+(save?-.23:.06);
      const jitter=(j*7%11)/11;
      const start=(save?12:5)+rise*(7+jitter*8);
      const end=start+(10+jitter*21)*(.35+.65*rise)*(1-.26*p);
      const width=(clap?2.3:3.6)*(1-.48*p)*(j%3 ? .76 : 1.18);
      ctx.save(); ctx.rotate(angle);
      shape(ctx,[start,-width*.15,start+5,-width,end,0,start+8,width*.72],
        j%3===0?colors[2]:colors[j%2], j%4===1?ink:null,1);
      if(!clap && j%3===0)shape(ctx,[end+3,0,end+6,-1,end+10,0,end+5,1],colors[3]);
      ctx.restore();
    }
    if(save){
      // Broken protective arc; gaps preserve the silhouettes at center.
      const r=13+rise*15;
      for(let k=0;k<3;k++){
        const a=k*2.1-.6;
        ctx.beginPath();ctx.ellipse(0,0,r,r*.79,-.32,a,a+.75);
        ctx.strokeStyle=colors[k];ctx.lineWidth=1.6*(1-.4*p);ctx.stroke();
      }
      sparkle(ctx,-17-rise*13,-12-rise*9,3.5,cream);
      sparkle(ctx,20+rise*12,9+rise*7,2.8,colors[1]);
    }else if(clap){
      sparkle(ctx,0,0,6*(1-p)+2,cream);
    }else{
      shape(ctx,[-5,-2,4,-8,2,-3,9,-4,-2,5,0,1,-7,3],cream);
    }
  }

  window.drawTagEffects = function(ctx,{kind='clap',progress=0,time=0,x=0,y=0,side='hero',reduced=false}={}) {
    if(kind !== 'corner' && !Object.hasOwn(palettes,kind)) return;
    ctx.save();ctx.translate(x,y);ctx.lineJoin='round';ctx.lineCap='round';
    if(kind==='corner')corner(ctx,side!=='rival',time,reduced);
    else burst(ctx,kind,bound(progress),reduced);
    ctx.restore();
  };

  function goldGradient(ctx) {
    const g=ctx.createLinearGradient(-7,-25,8,25);
    for(const [n,c] of [[0,'#fff0b4'],[.21,'#edc772'],[.4,'#a56637'],[.55,'#f6d485'],[.8,'#d79c51'],[1,'#92603d']])g.addColorStop(n,c);
    return g;
  }
  function sidePlate(ctx,mirror,gold) {
    ctx.save();ctx.scale(mirror,1);
    shape(ctx,[36,-11,57,-9,65,-5,64,7,56,11,36,13,32,8,32,-6],gold,'#402f33',1.5);
    line(ctx,[36,-8,55,-6,60,-3,60,5,54,8,36,10],'#fff0b2',.75);
    shape(ctx,[38,-5,49,-6,55,-2,53,4,41,7,37,3], '#92663e', '#805338', .6);
    shape(ctx,[39,-2,51,-4,47,0,51,1,41,5,43,1,38,2], '#f4cd73');
    stone(ctx,58,1,2.4,'#295c5d','#77c3a6');
    for(const y of [-8.8,9.3])ellipse(ctx,34,y,1.1,1.1,'#9d713f');
    ctx.restore();
  }
  window.drawVictoryBelt = function(ctx,{x=0,y=0,scale=1,time=0,reduced=false}={}) {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineJoin='round';ctx.lineCap='round';
    // The belt is centered on (x,y), 180 units wide and 54 units tall.
    const leather=ctx.createLinearGradient(0,-15,0,18);
    leather.addColorStop(0,'#493b40');leather.addColorStop(.4,'#272b37');leather.addColorStop(1,'#24212d');
    const outline=[-89,-4,-83,-10,-68,-11,-49,-14,-37,-16,-25,-20,0,-16,25,-20,37,-16,52,-13,70,-11,84,-9,90,-4,90,7,83,12,66,12,49,14,35,18,24,20,0,18,-25,20,-38,17,-55,14,-74,13,-85,10,-90,6];
    shape(ctx,outline,leather,ink,2);
    for(const sign of [-1,1]){
      ctx.save();ctx.scale(sign,1);
      line(ctx,[68,-8,80,-7,86,-4,86,6,81,9,68,9],'#77605b',.85);
      for(let j=0;j<3;j++){
        const xx=70+j*5;
        ellipse(ctx,xx,-2,1.15,1,'#ac8866');ellipse(ctx,xx,3,1.15,1,'#ac8866');
      }
      ctx.restore();
    }
    const gold=goldGradient(ctx);
    sidePlate(ctx,1,gold);sidePlate(ctx,-1,gold);
    // Three stepped bezels enclose the cloisonné volcano medallion.
    const plate=[-36,-7,-30,-14,-21,-16,-14,-22,-4,-23,0,-26,5,-23,14,-22,22,-16,30,-14,36,-7,36,8,30,15,17,17,8,22,0,25,-9,22,-17,18,-30,15,-36,8];
    shape(ctx,plate,gold,'#392d32',2);ctx.save();ctx.scale(.89,.85);shape(ctx,plate,'#9b662f','#fff0b4',1.1);ctx.restore();
    ctx.save();ctx.scale(.80,.76);shape(ctx,plate,'#d1a151','#64442d',1.2);ctx.restore();
    ellipse(ctx,0,0,23,15,'#775032');ellipse(ctx,0,-.6,21,13.7,'#2e6e70');
    for(let i=0;i<7;i++){
      const a=Math.PI*(1.1+i*.13);
      line(ctx,[Math.cos(a)*11,Math.sin(a)*8,Math.cos(a)*16,Math.sin(a)*11],'#77a993',.85);
    }
    // Hand engraved ridgelines with a glowing mouth and rising plume.
    shape(ctx,[-19,6,-10,1,-3,-6,1,-5,4,-8,8,-3,13,0,19,6,15,8,-15,8],'#edbc62','#664534',1);
    shape(ctx,[-16,6,-9,3,-2,-4,-5,2,-4,2,-6,6], '#fff0ad');
    shape(ctx,[2,-4,5,-6,7,-2,12,3,17,6,10,5,5,1], '#a66a36');
    line(ctx,[-3,-5,0,-4,3,-7,6,-6],'#ffcf88',1.3);
    line(ctx,[2,-8,1,-10,4,-11,3,-13],'#f0cf8d',1);
    line(ctx,[-12,10,0,11,12,10],'#c7bc75',.8);
    for(const side of [-1,1]){
      stone(ctx,28*side,0,3.4,'#255c60','#81c7a5');stone(ctx,23*side,-9,1.65,'#98693a','#ffdc8e');
      for(let j=0;j<4;j++)ellipse(ctx,side*(12+j*3.2),13-j*.7,.65,.7,'#ffe5a1');
    }
    stone(ctx,0,-20,2.25,'#275f60','#b2d9ac');stone(ctx,0,19,1.9,'#7b4d31','#ffda92');
    if(!reduced){
      const beat=Math.max(0,Math.cos(time*1.83));
      if(beat>.78){ctx.globalAlpha*=Math.min(1,(beat-.78)*3.7);sparkle(ctx,-20,-14,4,cream);}
    }
    ctx.restore();
  };
})();
