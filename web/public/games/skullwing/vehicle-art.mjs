// Each atlas cell has an intact vehicle and a separately painted crushed shell.
// Coordinates for wheels and lights are in the original four-pixels-per-unit art.
const atlas = typeof Image === 'function' ? new Image() : null;
if (atlas) atlas.src = new URL('./vehicles.webp', import.meta.url).href;

const models = [
  { w: 168, h: 63, wreckH: 50, wheels: [39, 134], axle: 47, lamp: [159, 29], color: '#ec7021' },
  { w: 180, h: 89, wreckH: 70, wheels: [40, 138], axle: 73, lamp: [172, 54], color: '#43cbb6' },
  { w: 176, h: 71, wreckH: 63, wheels: [42, 138], axle: 55, lamp: [162, 40], color: '#ffb72a' },
  { w: 184, h: 80, wreckH: 61, wheels: [40, 146], axle: 60, lamp: [174, 39], color: '#a53d9b' },
  { w: 184, h: 75, wreckH: 66, wheels: [45, 140], axle: 59, lamp: [161, 42], color: '#344879' },
  { w: 248, h: 116, wreckH: 99, wheels: [33, 65, 96, 128, 159, 191], axle: 93, lamp: [214, 65], color: '#7f903d' },
];
const roadOffset = 2;
const tau = Math.PI * 2;

function polygon(ctx, fill, vertices) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(vertices[0][0], vertices[0][1]);
  for (let i = 1; i < vertices.length; i++) ctx.lineTo(vertices[i][0], vertices[i][1]);
  ctx.closePath();
  ctx.fill();
}

function oval(ctx, fill, x, y, rx, ry) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, tau);
  ctx.fill();
}

// A lightweight silhouette keeps every vehicle recognizable while the sheet loads.
function fallback(ctx, model, index, wreck, h) {
  const w = model.w, tank = index === 5, cop = index === 4;
  const body = wreck ? '#554d52' : model.color;
  if (tank) {
    polygon(ctx, '#242232', [[7,h-35],[29,h-51],[204,h-51],[225,h-29],[210,h-5],[30,h-5]]);
    polygon(ctx, body, [[0,h-39],[33,h-65],[177,h-70],[222,h-48],[220,h-36]]);
    polygon(ctx, wreck ? '#49444a' : '#9ca346', [[51,h-66],[74,h-99],[127,h-101],[152,h-72]]);
    polygon(ctx, '#545d35', [[120,h-90],[w-5,h-94],[w-3,h-80],[127,h-78]]);
  } else {
    const van = index === 1, pickup = index === 3;
    const roof = wreck ? h*.35 : 4;
    const contour = van
      ? [[2,h-15],[6,roof+16],[15,roof],[w-35,roof],[w-14,h*.5],[w-4,h*.62],[w-3,h-16]]
      : [[1,h-17],[4,h*.48],[pickup?w*.41:w*.21,h*.43],[pickup?w*.46:w*.32,roof],[w*.59,roof],[w*.72,h*.42],[w*.93,h*.52],[w-4,h*.62],[w-2,h-15]];
    polygon(ctx, body, contour);
    polygon(ctx, wreck ? '#343847' : '#89bdd2', [[w*.43,roof+4],[w*.58,roof+4],[w*.67,h*.41],[w*.43,h*.41]]);
    if (cop) {
      polygon(ctx, wreck ? '#837c78' : '#e4e3d8', [[w*.29,h*.43],[w*.63,h*.43],[w*.59,h-15],[w*.33,h-15]]);
      ctx.fillStyle = '#b8344e'; ctx.fillRect(80,1,17,7);
      ctx.fillStyle = '#4e9ce1'; ctx.fillRect(64,1,16,7);
    }
    ctx.fillStyle = '#27283a'; ctx.fillRect(4,h-18,w-8,8);
  }
  const y = wreck ? h-12 : model.axle;
  for (const x of model.wheels) {
    oval(ctx, '#1a1d2b', x,y,tank?15:14,wreck?8:14);
    oval(ctx, tank?'#a28b42':'#788599', x,y,7,wreck?4:7);
  }
  if (wreck) polygon(ctx, '#252632', [[w*.26,h*.27],[w*.38,h*.53],[w*.5,h*.38],[w*.66,h*.71],[w*.48,h*.52],[w*.39,h*.69]]);
}

function wheels(ctx, model, phase, tank) {
  ctx.lineWidth = tank ? 2 : 1.6;
  ctx.strokeStyle = tank ? 'rgba(250,204,104,.64)' : 'rgba(220,232,240,.65)';
  ctx.beginPath();
  for (const x of model.wheels) {
    for (let spoke = 0; spoke < 3; spoke++) {
      const a = phase + spoke * tau / 3;
      const dx = Math.cos(a), dy = Math.sin(a);
      ctx.moveTo(x+dx*3, model.axle+dy*3);
      ctx.lineTo(x+dx*7, model.axle+dy*7);
    }
  }
  ctx.stroke();
  if (tank) {
    ctx.fillStyle = '#939298';
    const offset = (phase*3)%11;
    for (let x=33+offset; x<202; x+=11) ctx.fillRect(x, model.h-4, 4, 1.5);
  }
}

function lights(ctx, model, index, time, reduced) {
  const [x,y] = model.lamp;
  const tank = index===5;
  polygon(ctx, tank ? 'rgba(253,198,108,.10)' : 'rgba(255,228,155,.13)',
    [[x,y-2],[x+(tank?19:29),y-1],[x+(tank?22:34),y+7],[x,y+2]]);
  oval(ctx,'#ffe5a0',x,y,tank?2.7:3,1.8);
  if (index !== 4) return;
  const wave = reduced ? .5 : (1+Math.sin(time*3.1))*.5;
  for (const [lx,rgb,intensity] of [[73,'87,175,255',1-wave],[93,'255,79,87',wave]]) {
    oval(ctx,'rgba('+rgb+','+(.04+intensity*.18)+')',lx,5,14,8);
    oval(ctx,'rgba('+rgb+','+(.4+intensity*.6)+')',lx,5,6,2.8);
  }
}

function smoke(ctx,x,y,time,reduced,strength) {
  for(let i=0;i<(reduced?2:4);i++) {
    const life = reduced ? .21+i*.29 : (time*.54+i*.25)%1;
    const r=(2+life*9)*strength;
    oval(ctx,'rgba(52,49,62,'+((1-life)*.48)+')',x-life*(12+strength*8)+Math.sin(life*5+i)*2,
      y-life*(22+16*strength),r,r*.84);
  }
}

export function drawVehicle(ctx,v,time,reduced=false) {
  const index = v.type === 'tank' ? 5 : v.type === 'police' ? 4 : (v.variant??0) & 3;
  const model = models[index], wreck = v.state==='wreck';
  const h = wreck ? model.wreckH : model.h;
  const w = model.w, dir = v.dir===-1 ? -1 : 1;
  const height = Math.max(0,v.y||0);
  const driving = v.state==='driving', moving = driving && Math.abs(v.vx||0)>1;
  const hit = Math.max(0,Math.min(1,v.hit||0));
  const damaged = (v.hp??1) < (v.maxHp??1);

  ctx.save();
  ctx.translate(v.x, roadOffset);
  oval(ctx,'rgba(21,18,37,'+Math.max(.07,.34-height*.0024)+')',0,.3,
    Math.max(4,w*.112-height*.07),index===5?3.1:2.1);
  ctx.translate(0,-height-h/8);
  ctx.rotate(v.angle||0);
  ctx.scale(dir*.25,.25);
  ctx.translate(-w/2,-h/2);
  if (atlas?.complete && atlas.naturalWidth) {
    const sx = (index%3)*256+4, sy = (Math.floor(index/3)+(wreck?2:0))*128+4;
    ctx.drawImage(atlas,sx,sy,w,h,0,0,w,h);
  } else {
    fallback(ctx,model,index,wreck,h);
  }
  if (!wreck) {
    if (moving && !reduced) wheels(ctx,model,v.x*dir*.28,index===5);
    lights(ctx,model,index,time,reduced);
    if (hit>0) {
      ctx.globalAlpha=hit*.75;
      polygon(ctx,'#fff1bc',[[w*.61,h*.58],[w*.69,h*.40],[w*.64,h*.57],[w*.71,h*.50],[w*.63,h*.66]]);
      ctx.globalAlpha=1;
    }
    if (damaged) {
      polygon(ctx,'#342d39',[[w*.75,h*.48],[w*.81,h*.53],[w*.78,h*.60],[w*.84,h*.63],[w*.75,h*.59]]);
      smoke(ctx,w*.79,h*.49,time,reduced,.78);
    }
  } else if ((v.wreckAge||0)<5) {
    smoke(ctx,w*.59,h*.40,time,reduced,Math.min(1,(5-(v.wreckAge||0))*.5));
  }
  ctx.restore();
}
