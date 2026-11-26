// Small, reusable painted cloud cells. The animation, shadows, fragments and their
// trajectories stay in world space, so each strike takes the shape of its impact.
const PI = Math.PI;
const TAU = PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = values => values[Math.floor(Math.random() * values.length)];
const sign = v => v < 0 ? -1 : 1;
const fade = (a, b, t) => clamp((t - a) / (b - a));

const palette = {
  flame: ['#51252e', '#a43829', '#ed5421', '#ff9b25', '#ffdb53', '#fff1ab'],
  coal:  ['#442b34', '#603338', '#99422e', '#d15b2b', '#ed8135', '#ffac56'],
  smoke: ['#27303e', '#38404b', '#4e545e', '#696a70', '#858185', '#a8988c'],
  dust:  ['#51494e', '#675c5c', '#8d7770', '#ac9281', '#c9af95', '#e1c8a8'],
  mist:  ['#425666', '#526776', '#687f8a', '#8599a0', '#a4b6b2', '#c7d0c3']
};
const glass = [
  ['#497a92','#a7e8e5'], ['#5a9cb0','#c4f2e9'], ['#6985a2','#d2def4']
];
const masonry = [
  ['#5d5660','#b49a8d'], ['#66545a','#ca9c83'], ['#625e71','#a9a3ac']
];
const paint = [
  ['#9f442d','#f39b57'], ['#28647d','#79bdcd'], ['#be872b','#ffe096']
];
const cachedCells = new Map();

function cellPath(ctx, n, squash, twist) {
  // Alternating rounded peaks and valleys keep the negative space between lobes.
  const peaks = [], valleys = [];
  for (let j = 0; j < n; j++) {
    let a = TAU*j/n + twist;
    const r = .82 + .11*Math.sin(j*4.97 + twist*8);
    peaks.push([Math.cos(a)*r, Math.sin(a)*r*squash]);
    a += PI/n;
    const inner = .64 + .09*Math.cos(j*3.62 + twist*7);
    valleys.push([Math.cos(a)*inner, Math.sin(a)*inner*squash]);
  }
  ctx.beginPath();
  ctx.moveTo(...valleys[n-1]);
  for (let j = 0; j < n; j++) {
    const a = TAU*j/n + twist;
    const [x,y] = peaks[j];
    const tx = -Math.sin(a)*.29, ty = Math.cos(a)*.29*squash;
    ctx.bezierCurveTo(x-tx, y-ty, x+tx, y+ty, ...valleys[j]);
  }
  ctx.closePath();
}

function paintCell(ctx, kind, variant) {
  const c = palette[kind];
  const hot = kind === 'flame' || kind === 'coal';
  const twist = variant === 0 ? .18 : .52;
  const n = variant === 0 ? 7 : 8;
  cellPath(ctx, n, .91, twist);
  const body = ctx.createLinearGradient(-.32, -.88, .35, .86);
  body.addColorStop(0, c[4]); body.addColorStop(.3, c[3]);
  body.addColorStop(.66, c[2]); body.addColorStop(.87, c[1]); body.addColorStop(1,c[0]);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.save();
  ctx.clip();
  // Scalloped banks block light at their base. The upper lip stays lit.
  for (let j = 0; j < n; j++) {
    const a = TAU*j/n + twist;
    const x = Math.cos(a)*.56, y = Math.sin(a)*.52;
    const radius = .31 + .055*Math.sin(j*3.2 + twist);
    const grad = ctx.createRadialGradient(x-radius*.24,y-radius*.55,.01, x,y,radius);
    grad.addColorStop(0,c[4]); grad.addColorStop(.48,c[3]);
    grad.addColorStop(.82,c[2]); grad.addColorStop(1,c[1]);
    ctx.fillStyle = grad;
    ctx.globalAlpha = hot ? .83 : .56;
    ctx.beginPath();
    ctx.ellipse(x,y,radius,radius*.8,a*.32,0,TAU);
    ctx.fill();
  }
  ctx.globalAlpha = hot ? .98 : .65;
  ctx.beginPath();
  ctx.moveTo(-.67,.05);
  ctx.bezierCurveTo(-.63,-.23,-.42,-.47,-.22,-.33);
  ctx.bezierCurveTo(-.06,-.58,.26,-.48,.31,-.25);
  ctx.bezierCurveTo(.51,-.3,.53,-.06,.44,.08);
  ctx.bezierCurveTo(.32,-.08,.17,-.11,.06,.05);
  ctx.bezierCurveTo(-.05,-.06,-.21,-.08,-.29,.11);
  ctx.bezierCurveTo(-.45,-.02,-.53,-.05,-.67,.05);
  ctx.fillStyle = c[hot ? 5 : 4]; ctx.fill();
  ctx.restore();
}

function getCell(ctx, kind, variant) {
  const key = kind+variant;
  if (cachedCells.has(key)) return cachedCells.get(key);
  const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(96,96)
    : ctx.canvas?.ownerDocument?.createElement('canvas');
  if (!canvas) return null;
  canvas.width=96; canvas.height=96;
  const art = canvas.getContext('2d');
  if (!art) return null;
  art.translate(48,48); art.scale(47,47);
  paintCell(art,kind,variant);
  cachedCells.set(key,canvas);
  return canvas;
}

function cloud(ctx,kind,variant,x,height,rx,ry,angle,alpha) {
  if (rx < .3 || alpha < .015) return;
  const img = getCell(ctx,kind,variant);
  ctx.save(); ctx.translate(x,-height); ctx.rotate(angle); ctx.globalAlpha*=clamp(alpha);
  if (img) ctx.drawImage(img,-rx,-ry,rx*2,ry*2);
  else {
    ctx.scale(rx,ry);
    paintCell(ctx,kind,variant);
  }
  ctx.restore();
}

function tongue(ctx,x,y,angle,width,length,alpha) {
  ctx.save();ctx.translate(x,-y);ctx.rotate(angle);ctx.scale(width,length);
  ctx.globalAlpha*=alpha;ctx.beginPath();
  ctx.moveTo(-.72,.11);
  ctx.bezierCurveTo(-.92,-.22,.02,-.43,-.18,-.66);
  ctx.quadraticCurveTo(-.23,-.87,-.04,-1);
  ctx.quadraticCurveTo(-.06,-.72,.31,-.61);
  ctx.quadraticCurveTo(.66,-.44,.25,-.28);
  ctx.quadraticCurveTo(.76,-.45,.81,-.54);
  ctx.quadraticCurveTo(.93,-.14,.55,.1);
  ctx.closePath();ctx.fillStyle='#e85e24';ctx.fill();
  ctx.beginPath();ctx.moveTo(-.45,.04);
  ctx.quadraticCurveTo(-.6,-.16,-.08,-.33);
  ctx.quadraticCurveTo(.17,-.45,-.08,-.68);
  ctx.quadraticCurveTo(.34,-.48,.26,-.29);
  ctx.quadraticCurveTo(.15,-.16,.56,-.22);
  ctx.quadraticCurveTo(.45,.12,-.45,.04);
  ctx.fillStyle='#ffbf3f';ctx.fill();ctx.restore();
}

function polygon(ctx,points,fill,stroke) {
  ctx.beginPath(); ctx.moveTo(points[0],points[1]);
  for(let j=2;j<points.length;j+=2) ctx.lineTo(points[j],points[j+1]);
  ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
  if(stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=.14; ctx.stroke(); }
}

function partArt(ctx,p) {
  ctx.lineCap='round'; ctx.lineJoin='round';
  const [body,light] = p.colors;
  if (p.kind==='wheel') {
    ctx.fillStyle='#20232b'; ctx.beginPath(); ctx.ellipse(0,0,.91,.99,0,0,TAU); ctx.fill();
    ctx.strokeStyle='#686972'; ctx.lineWidth=.13; ctx.stroke();
    ctx.fillStyle='#9799a0'; ctx.beginPath(); ctx.ellipse(-.04,-.02,.56,.57,0,0,TAU); ctx.fill();
    ctx.fillStyle='#3e4854'; ctx.fillRect(-.37,-.11,.68,.2); ctx.fillRect(-.14,-.38,.18,.7);
    ctx.fillStyle='#d2d1bf'; ctx.fillRect(-.12,-.15,.17,.17);
  } else if (p.kind==='door') {
    polygon(ctx,[-.98,-.17,-.55,-.92,.47,-.81,.83,-.16,.72,.69,-.9,.81],body,'#3c3540');
    polygon(ctx,[-.71,-.17,-.44,-.68,.38,-.64,.64,-.19],'#81b2bc');
    ctx.fillStyle=light; ctx.fillRect(-.78,-.04,1.49,.1);
    ctx.fillStyle='#323540'; ctx.fillRect(.31,.15,.26,.11);
  } else if (p.kind==='hatch') {
    polygon(ctx,[-1,-.22,-.55,-.62,.47,-.66,1,-.26,.87,.42,-.42,.68,-.96,.24],body,'#32343a');
    polygon(ctx,[-.77,-.22,-.46,-.47,.49,-.51,.75,-.3,.37,-.16,-.39,-.1],light);
    ctx.fillStyle='#383c38';ctx.fillRect(-.22,-.14,.47,.23);
  } else if (p.kind==='beacon') {
    polygon(ctx,[-1,-.32,.88,-.43,1,.19,.88,.38,-1,.45],'#414653');
    ctx.fillStyle='#fa6667';ctx.fillRect(-.84,-.27,.65,.43);
    ctx.fillStyle='#75c4fd';ctx.fillRect(.02,-.31,.69,.43);
  } else if (p.kind==='glass') {
    polygon(ctx,[-.84,.59,-.22,-1,.72,-.4,.45,.24],body);
    polygon(ctx,[-.84,.59,-.23,-1,-.04,-.71],light);
  } else if (p.kind==='spark') {
    ctx.strokeStyle=body; ctx.lineWidth=.5;
    ctx.beginPath(); ctx.moveTo(-p.trail,0); ctx.lineTo(.8,0); ctx.stroke();
    ctx.strokeStyle=light; ctx.lineWidth=.39;
    ctx.beginPath(); ctx.moveTo(-.36,0);ctx.lineTo(.86,0);ctx.stroke();
  } else {
    polygon(ctx,[-.96,.34,-.59,-.56,.21,-.79,.91,-.27,.53,.56,-.13,.79],body);
    polygon(ctx,[-.59,-.56,.21,-.79,.91,-.27,.06,-.28,-.96,.34],light);
  }
}

export class SmashFX {
  constructor(reduced=false) {
    this.reduced=!!reduced;
    this.clear();
  }
  clear() { this.blasts=[]; this.puffs=[]; this.parts=[]; }
  add(list,item,limit) {
    if (list.length>=limit) list.shift();
    list.push(item);
  }
  fragment(kind,x,y,colors,dir,energy=1) {
    const s = this.reduced ? .78 : 1;
    const large = ['wheel','door','hatch','beacon'].includes(kind);
    const spark = kind==='spark';
    const speed = rand(large ? 25 : 14,spark ? 151 : 94)*energy*s;
    this.add(this.parts,{
      kind,x,y:Math.max(0,y),colors,
      vx:dir*speed,vy:rand(large?70:28,spark?133:128)*energy*s,
      angle:rand(0,TAU), spin:rand(-7,7), age:0, bounced:0,
      size:large ? (kind==='beacon'?2.45:rand(3.1,4.7)) : (kind==='brick'?rand(1.5,3.5):rand(.8,2.15)),
      trail:rand(1.3,3.5),life:large?rand(1.6,2.45):(spark?rand(.3,.74):rand(.55,1.25))
    },this.reduced?50:128);
  }
  puff(kind,x,y,dir,size,speed,duration) {
    this.add(this.puffs,{
      kind,x,y:Math.max(0,y),size,vel:dir*speed,age:0,life:duration, rise:rand(6,15),
      angle:rand(-.45,.45),spin:rand(-.35,.35),variant:Math.random()<.5?0:1
    },this.reduced?21:56);
  }
  demolition(x,y,width,dir,weight,icy) {
    const n = this.reduced ? 2 : weight>1 ? 7 : 4;
    const spread=Math.min(width*.4,36)*weight;
    for(let j=0;j<n;j++) {
      const d=j%2===0?dir:-dir;
      const offset=rand(0,spread)*d;
      this.puff(icy?'mist':'dust',x+offset,y+rand(0,3),d,rand(8,15)*weight,rand(12,32)*weight,rand(.57,1.18));
    }
    for(let j=0;j<(this.reduced?2:Math.ceil(weight*4));j++)
      this.fragment(j%3===0?'glass':'brick',x+rand(-spread,spread),y+rand(1,5),pick(j%3===0?glass:masonry),j%2?dir:-dir,.49*weight);
  }
  event(e) {
    if (!e) return;
    const kind=e.kind || e.event || e.type;
    const b=e.b || {};
    const dir=sign(e.direction ?? e.dir ?? 1);
    const x=Number.isFinite(e.x)?e.x:(b.x ?? 0);
    const y=Math.max(0,Number.isFinite(e.y)?e.y:(b.hitY ?? (b.h || 0)*.48));
    const w=e.width || e.w || b.w || 45;
    const icy=e.district===2 || e.district==='frostline' || b.district===2;
    if(kind==='vehicleExplosion') {
      const tank=e.type==='tank', police=e.type==='police';
      const scale=(tank?39:police?30:27)*(1+Math.min(3,Math.max(0,(e.chain || 1)-1))*.035);
      const count=this.reduced?5:tank?10:8;
      const lobes=[];
      for(let j=0;j<count;j++) {
        // The scalloped crest grows up and out. Stagger front and rear ignition.
        const a=(j+.5)/count*PI + rand(-.105,.105);
        lobes.push({
          dx:Math.cos(a)*rand(.55,.95),dy:Math.sin(a)*rand(.65,1.28),
          r:rand(.45,.65),delay:rand(0,.14),rot:rand(-.65,.65),variant:j%2
        });
      }
      this.add(this.blasts,{x,y:Math.max(y,5),dir,scale,lobes,age:0,life:tank?1.84:1.65},this.reduced?4:8);
      const coating=tank?['#566144','#b9ba77']:police?['#c8c5b8','#f0f1db']:pick(paint);
      this.fragment(tank?'hatch':'door',x+dir*3,y+5,coating,dir,1.08);
      this.fragment('wheel',x-dir*4,y+1,coating,-dir,.9);
      if(police) this.fragment('beacon',x,y+7,coating,-dir,1.25);
      else if(tank) this.fragment('brick',x,y+3,coating,-dir,1.2);
      for(let j=0;j<(this.reduced?4:tank?15:11);j++)
        this.fragment('spark',x+rand(-4,4),y+rand(0,7),['#ec753a','#ffe8a0'],j%2?dir:-dir,rand(.69,1.2));
    } else if(kind==='vehicleHit') {
      for(let j=0;j<(this.reduced?2:5);j++)
        this.fragment(j%2?'glass':'spark',x,y+2,j%2?pick(glass):['#dc813c','#ffeaa5'],j===4?-dir:dir,.73);
    } else if(kind==='hit') {
      this.puff(icy?'mist':'dust',x,y,dir,rand(7,10),12,.51);
      for(let j=0;j<(this.reduced?3:10);j++)
        this.fragment(j%3===0?'brick':'glass',x+rand(-4,4),y+rand(-7,6),
          pick(j%3===0?masonry:glass),j%4===3?-dir:dir,rand(.5,.91));
    } else if(kind==='collapse') {
      const floor=(b.h || 70)*.54;
      for(let j=0;j<(this.reduced?4:14);j++)
        this.fragment(j%3?'glass':'brick',x+rand(-w*.37,w*.37),floor*rand(.4,1.45),
          pick(j%3?glass:masonry),j%2?-dir:dir,rand(.4,.8));
      this.demolition(x,0,w,dir,1.06,icy);
    } else if(kind==='floorImpact') this.demolition(x,y,w,dir,.84,icy);
    else if(kind==='settle') this.demolition(x,0,w,dir,.63,icy);
  }
  blast(ctx,b) {
    const t=b.age, s=b.scale, origin=b.x, base=b.y;
    // A low pressure ripple goes over the asphalt, never over the whole screen.
    if(t<.39 && base<24 && !this.reduced) {
      const u=clamp(t/.39);
      ctx.save();ctx.globalAlpha*=.48*(1-u);
      ctx.strokeStyle='#ffca78';ctx.lineWidth=2*(1-u)+.3;ctx.beginPath();
      ctx.ellipse(origin,-1.2,s*(.28+u*1.85),1+5*u,0,0,TAU);ctx.stroke();ctx.restore();
    }
    const heat=1-fade(.55,1.04,t);
    const smoke=fade(.18,.51,t)*(1-fade(b.life*.61,b.life,t));
    if(smoke>.01) {
      const lift=Math.max(0,t-.23);
      cloud(ctx,'smoke',1,origin+b.dir*lift*6,base+s*(.18+.48*lift),
        s*(.32+.39*lift),s*(.33+.21*lift),-.28+b.dir*lift*.14,smoke*.92);
    }
    if(smoke>.01) for(const l of b.lobes) {
      const u=clamp((t-l.delay)*1.36);
      const rise=Math.max(0,t-.28);
      const spread=.08+u*.84;
      cloud(ctx,'smoke',l.variant,origin+s*l.dx*spread+b.dir*rise*5,
        base+s*l.dy*spread+rise*13,s*l.r*(.72+u*.79),s*l.r*(.64+u*.87),
        l.rot+rise*.3,smoke*.92);
    }
    if(heat>.01) {
      if(t<.53 && !this.reduced) {
        const u=clamp(t/.20);
        const a=(1-fade(.22,.53,t))*.93;
        for(const i of [-1,1]) {
          tongue(ctx,origin+i*s*.14*u,base+s*.14*u,
            i*(1.02+(.10*i*b.dir)),s*.17*u,s*(.42+.79*u),a);
          tongue(ctx,origin+i*s*.22*u,base+s*.10*u,
            i*.48,s*.22*u,s*(.50+.84*u),a*.85);
        }
      }
      for(const l of b.lobes) {
        const elapsed=t-l.delay;
        if(elapsed<0) continue;
        const u=1-Math.exp(-elapsed*5.4);
        const radius=Math.max(.10,Math.sin(clamp(elapsed/1.05)*PI)**.48);
        const spread=.06+u*.92;
        const x=origin+s*l.dx*spread, y=base+s*l.dy*spread+t*2.5;
        cloud(ctx,t>.71+l.delay*1.4?'coal':'flame',l.variant,x,y,s*l.r*radius,s*l.r*radius*(.8+.24*u),
          l.rot-u*.11,heat);
      }
      // A rising gold heart makes the burst read against both light and dark facades.
      const u=clamp(t/.19);
      const radius=s*(.17+.58*u)*(1-.50*fade(.28,.86,t));
      cloud(ctx,'flame',1,origin+b.dir*t*1.9,base+s*(.18+t*.45),radius*1.15,radius,.18,heat);
      if(t>.26 && t<.99) {
        const v=fade(.26,.46,t)*(1-fade(.76,.99,t));
        const rise=fade(.26,.86,t);
        tongue(ctx,origin-s*(.23+.08*rise),base+s*.13,-.16+rise*.24,
          s*.18,s*(.47+.39*rise),v*.93);
        tongue(ctx,origin+s*.14,base+s*.12,.24-rise*.23,
          s*.21,s*(.48+.28*rise),v);
      }
      if(t<.55) {
        const a=(1-fade(.15,.55,t))*.92;
        ctx.save();ctx.translate(origin,-base-s*.14);ctx.scale(radius*.77,radius*.75);
        ctx.globalAlpha*=a; ctx.fillStyle='#ffe69a';ctx.beginPath();
        ctx.moveTo(-.84,.25);ctx.quadraticCurveTo(-.64,-.23,-.38,-.1);
        ctx.quadraticCurveTo(-.53,-.54,-.35,-.78);ctx.quadraticCurveTo(-.28,-.46,-.06,-.39);
        ctx.quadraticCurveTo(.05,-.70,.24,-.92);ctx.quadraticCurveTo(.11,-.40,.36,-.21);
        ctx.quadraticCurveTo(.71,-.49,.86,-.43);ctx.quadraticCurveTo(.53,-.15,.69,.26);
        ctx.quadraticCurveTo(-.02,.58,-.84,.25);ctx.fill();ctx.restore();
      }
    }
  }
  draw(ctx,dt,view={}) {
    dt=clamp(Number.isFinite(dt)?dt:0,0,.12);
    this.reduced=view.reduced ?? this.reduced;
    const left=(view.camera ?? 0)-100,right=(view.camera ?? 0)+(view.width ?? Infinity)+100;
    for(let i=this.puffs.length-1;i>=0;i--) {
      const p=this.puffs[i]; p.age+=dt;
      if(p.age>=p.life) {this.puffs.splice(i,1);continue;}
      p.x+=p.vel*dt;p.vel*=Math.exp(-dt*1.65);
      if(p.x<left || p.x>right) continue;
      const u=p.age/p.life;const sz=p.size*(.3+u*1.38);
      cloud(ctx,p.kind,p.variant,p.x,p.y+sz*.26+p.rise*p.age,sz*1.35,sz*.85,
        p.angle+p.spin*u,Math.min(1,u*9+.25)*(1-u)*.72);
    }
    for(let i=this.blasts.length-1;i>=0;i--) {
      const b=this.blasts[i];b.age+=dt;
      if(b.age>=b.life) {this.blasts.splice(i,1);continue;}
      if(b.x>=left && b.x<=right) this.blast(ctx,b);
    }
    for(let i=this.parts.length-1;i>=0;i--) {
      const p=this.parts[i];p.age+=dt;
      if(p.age>=p.life) {this.parts.splice(i,1);continue;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy-=dt*(p.kind==='glass'?210:262);
      if(p.y<p.size*.28) {
        p.y=p.size*.28;
        if(p.vy<0) {
          p.vy=p.bounced<2?-p.vy*.30:0;p.vx*=p.bounced<2?.58:.80;
          p.spin*=.57;p.bounced++;
        }
      }
      p.angle+=p.spin*dt;
      if(p.x<left || p.x>right) continue;
      ctx.save();ctx.globalAlpha*=1-fade(p.life*.72,p.life,p.age);
      ctx.translate(p.x,-p.y);ctx.rotate(p.kind==='spark'?Math.atan2(-p.vy,p.vx):p.angle);
      ctx.scale(p.size,p.size);partArt(ctx,p);ctx.restore();
    }
  }
}
