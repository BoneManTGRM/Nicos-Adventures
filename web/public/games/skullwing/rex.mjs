// Skullwing is painted in local space, with the street at y = 0 and his nose facing right.
const INK = '#111932';
const pathCache = new Map();

function shape(ctx, d, fill, outline, width = 1) {
  let path = pathCache.get(d);
  if (!path) {
    path = new Path2D(d);
    pathCache.set(d, path);
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill(path);
  }
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = width;
    ctx.stroke(path);
  }
}

function paint(ctx, fill, outline = INK, width = 1.9) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = width; ctx.stroke(); }
}

function wash(ctx, x1, y1, x2, y2, colors) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  return g;
}

function oval(ctx, x, y, rx, ry, fill, angle = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
}

// Wing joints interpolate between a folded and a spread silhouette. Each finger
// terminates at a scallop so the membrane remains attached through the downstroke.
function wing(ctx, far, spread, flap, voice) {
  ctx.save();
  ctx.translate(far?2:-10,far?-90:-82);
  if(far) {ctx.scale(-.9,1.07);ctx.rotate(.06);}
  const w=-19-19*spread, h=-35-13*spread+flap*10;
  const tipX=-51-39*spread, tipY=-10-15*spread+flap*18;
  const f2X=-49-26*spread, f2Y=13-4*spread+flap*11;
  const f3X=-35-22*spread, f3Y=19-2*spread+flap*6;
  const f4X=-20-11*spread, f4Y=19+flap*2;
  ctx.beginPath();ctx.moveTo(1,4);
  ctx.quadraticCurveTo(-8,-13,w,h);
  ctx.bezierCurveTo(w-4,h-3,tipX+7,tipY-19,tipX,tipY);
  ctx.quadraticCurveTo(tipX+9,tipY-3,f2X,f2Y);
  ctx.quadraticCurveTo(f2X+8,f2Y-13,f3X,f3Y);
  ctx.quadraticCurveTo(f3X+9,f3Y-12,f4X,f4Y);
  ctx.quadraticCurveTo(-12,9,1,7);ctx.closePath();
  paint(ctx,wash(ctx,w,h,tipX,f2Y,far?['#564788','#925176','#6e4773']:['#4e437d','#c95a81','#ee8b8e']),INK,2.1);
  for (const [x,y] of [[tipX,tipY],[f2X,f2Y],[f3X,f3Y],[f4X,f4Y]]) {
    ctx.beginPath();ctx.moveTo(w,h+3);
    ctx.bezierCurveTo(w-4,h+10,x+7,y-15,x,y);
    paint(ctx,null,far?'#483a6c':'#804365',2.1);
    ctx.beginPath();ctx.moveTo(w,h+5);
    ctx.quadraticCurveTo((w+x)*.5+1,(h+y)*.5-4,x+1.7,y-3.9);
    paint(ctx,null,far?'#8e658d':'#f2a49e',.8);
  }
  ctx.beginPath();ctx.moveTo(2,5);ctx.quadraticCurveTo(-6,-10,w+2,h+3);
  ctx.quadraticCurveTo(w-6,h+1,tipX,tipY);
  ctx.quadraticCurveTo(tipX+4,tipY-13,w-2,h-2);
  ctx.quadraticCurveTo(w+1,h-7,w+4,h-1);
  ctx.quadraticCurveTo(-3,-16,5,0);ctx.closePath();
  paint(ctx,far?'#294d83':'#3864aa',INK,1.4);
  ctx.beginPath();ctx.moveTo(-1,-5);ctx.quadraticCurveTo(-9,-19,w+2,h);
  ctx.quadraticCurveTo(w-6,h-1,tipX+4,tipY-7);
  paint(ctx,null,voice>.65?'#d9e8ff':far?'#77a7d6':'#94d4ef',1.45);
  ctx.beginPath();ctx.moveTo(w-1,h+1);ctx.quadraticCurveTo(w-7,h-6,w-3,h-12);
  ctx.quadraticCurveTo(w-2,h-7,w+3,h-5);ctx.lineTo(w+4,h);ctx.closePath();
  paint(ctx,far?'#94b1c4':'#d3d9cc','#354267',.95);
  ctx.restore();
}

function hindLeg(ctx, x, hipY, footX, footY, near) {
  const kneeX=x-6+(footX-x)*.5, kneeY=hipY*.48;
  ctx.beginPath();ctx.moveTo(x-10,hipY-8);ctx.quadraticCurveTo(x+4,hipY-14,x+10,hipY-1);
  ctx.quadraticCurveTo(x+10,hipY+9,kneeX+7,kneeY);
  ctx.lineTo(footX+3,footY-8);ctx.lineTo(footX-8,footY-5);
  ctx.lineTo(kneeX-7,kneeY+6);ctx.quadraticCurveTo(kneeX-12,kneeY+1,kneeX-10,kneeY-4);
  ctx.quadraticCurveTo(x-15,hipY+4,x-10,hipY-8);
  paint(ctx,near?wash(ctx,x-9,hipY,x+5,footY,['#3863ae','#284b89','#202b59']):'#27375f');
  ctx.beginPath();ctx.moveTo(x-9,hipY-3);ctx.quadraticCurveTo(x-6,hipY-12,x+2,hipY-6);
  ctx.quadraticCurveTo(x+3,hipY+4,kneeX,kneeY-3);ctx.lineTo(kneeX-6,kneeY+1);
  ctx.lineTo(kneeX-3,kneeY-7);ctx.lineTo(kneeX-7,kneeY-4);ctx.closePath();
  paint(ctx,near?'#4179c9':'#374a74',null);
  ctx.save();ctx.translate(footX,footY);
  shape(ctx,'M -8 -8 Q -3 -13 2 -9 L 4 -5 L 10 -6 L 14 -5 L 17 -2 Q 16 0 11 0 L 4 0 L -4 0 L -10 -1 Z',near?'#464f79':'#343b5d',INK,1.65);
  shape(ctx,'M 2 -5 Q 5 -8 8 -5 M 7 -5 Q 10 -7 13 -4 M -6 -6 L -3 -8',null,near?'#8497ad':'#617088',1);
  shape(ctx,'M 8 -4 L 11 -4 L 13 -2 L 10 -2 Z M 13 -4 L 16 -3 L 17 -2 L 14 -2 Z',near?'#a9bac2':'#8799a8');
  ctx.restore();
}

function body(ctx) {
  shape(ctx,'M -37 -44 L -40 -49 L -38 -50 L -40 -55 L -36 -61 L -36 -70 L -30 -71 Q -28 -85 -19 -90 L -18 -96 L -13 -94 L -10 -99 L -6 -97 L -2 -102 L 3 -99 L 8 -100 Q 23 -95 26 -81 Q 31 -73 27 -65 Q 23 -56 15 -50 L 9 -42 L 2 -42 L -5 -34 L -7 -38 L -16 -32 L -17 -36 L -23 -33 L -28 -37 L -32 -36 L -32 -40 Z',
    wash(ctx,-14,-97,1,-38,['#467dd3','#2c53a3','#20376d']),INK,2.25);
  shape(ctx,'M -36 -63 L -28 -71 L -28 -78 L -19 -84 L -25 -72 L -22 -74 L -25 -64 L -31 -60 L -29 -66 Z','#3f78c7');
  shape(ctx,'M -29 -52 Q -25 -67 -18 -68 L -13 -65 Q -19 -59 -20 -52 L -23 -46 L -23 -52 L -28 -46 Z','#30437d');
  shape(ctx,'M -4 -92 Q 13 -99 24 -85 L 26 -76 Q 23 -66 17 -64 L 9 -63 L 4 -58 L -2 -60 L -6 -66 Q -13 -68 -11 -76 Q -10 -85 -4 -92 Z',
    wash(ctx,-3,-89,22,-61,['#5969aa','#4e5890','#393d6a']),'#354779',1);
  shape(ctx,'M -8 -76 Q 2 -84 13 -81 Q 19 -79 22 -72 Q 16 -77 8 -76 Q -1 -73 -6 -68 Z','#6576ac');
  shape(ctx,'M 1 -69 Q 9 -72 18 -68 L 14 -64 L 6 -63 L 1 -60 L -2 -62 Z','#404777');
  shape(ctx,'M -5 -60 Q 1 -64 8 -61 L 5 -57 L -2 -55 Z M -10 -54 L -2 -57 L 3 -55 L -3 -51 L -8 -49 Z','#4a5989');
  shape(ctx,'M -18 -71 L -14 -76 L -11 -77 L -13 -73 L -11 -74 L -15 -68 Z M -30 -45 L -24 -52 L -26 -45 L -29 -41 Z','#476cb1');
  shape(ctx,'M -3 -98 L -9 -88 L -13 -86 L -12 -91 L -21 -83 L -19 -90 L -25 -84 L -21 -92 L -15 -93 L -12 -97 L -8 -95 Z','#5896e1');
  shape(ctx,'M -31 -73 L -28 -77 M -23 -84 L -19 -88 M -20 -88 L -16 -92 M -5 -90 L -2 -93',null,'#97b9e4',1.1);
  shape(ctx,'M -32 -51 L -29 -57 M -29 -51 L -25 -58 M -28 -63 L -24 -69 M -19 -78 L -14 -83',null,'#748dce',1.05);
}

// These two interlocking muscle shapes follow the shoulder, elbow and wrist
// independently, keeping the whole hand free for a knuckle walk or a long hook.
function arm(ctx, shoulderX, shoulderY, elbowX, elbowY, handX, handY, near) {
  ctx.save();ctx.translate(shoulderX,shoulderY);
  const dx=elbowX-shoulderX,dy=elbowY-shoulderY,upper=Math.max(1,Math.hypot(dx,dy));
  ctx.rotate(-Math.atan2(dx,dy));ctx.scale(near?1:.83,upper/28);
  shape(ctx,'M -10 -6 L -9 -12 L -5 -10 L -1 -14 L 4 -11 L 8 -12 L 13 -8 Q 17 -4 15 4 L 17 6 L 13 12 L 13 16 L 9 17 L 8 24 Q 4 33 -7 30 L -12 25 L -14 26 L -12 19 L -15 18 L -12 12 L -16 12 L -13 6 L -15 6 Z',
    near?wash(ctx,-10,-9,11,27,['#5699ed','#335eb6','#233f82']):'#314577',INK,1.9);
  shape(ctx,'M -10 4 L -8 -4 L -4 -9 L 2 -10 L 6 -8 L 10 -7 L 11 -3 L 5 -4 L 1 -2 L -1 -4 L -6 2 L -5 -2 Z',near?'#75b0f1':'#4b649c');
  shape(ctx,'M -12 11 L -8 3 L -1 -1 L -4 6 L 1 2 L -2 11 L -7 16 L -6 12 L -11 18 Z',near?'#427dcb':'#40578a');
  shape(ctx,'M 4 3 Q 12 1 12 8 L 10 14 L 7 18 L 8 11 L 4 15 Z',near?'#5874b6':'#41578b');
  shape(ctx,'M -7 -4 L -4 -7 M -2 -7 L 1 -9 M 3 -7 L 5 -8',null,near?'#aed7f7':'#6c9ac7',.95);
  shape(ctx,'M -9 7 Q -5 1 -3 0 M -4 9 Q -1 3 1 2 M 2 6 L 4 3 M 6 13 L 8 9',null,near?'#6f93d5':'#4c658e',.63);
  ctx.restore();

  ctx.save();ctx.translate(elbowX,elbowY);
  const fx=handX-elbowX,fy=handY-elbowY,lower=Math.max(1,Math.hypot(fx,fy));
  ctx.rotate(-Math.atan2(fx,fy));ctx.scale(near?1:.84,lower/26);
  shape(ctx,'M -10 1 L -11 -3 L -6 -7 Q 3 -11 9 -4 Q 13 2 12 8 L 12 14 L 9 17 L 9 24 L 3 29 L -6 28 L -10 24 L -9 18 L -13 19 L -11 12 L -14 13 L -11 7 L -13 7 Z',
    near?wash(ctx,-12,-5,9,26,['#427ecc','#2a529c','#253563']):'#2a3b67',INK,1.7);
  shape(ctx,'M -9 4 L -5 -3 L 1 -5 L 6 -3 L 2 -2 L -2 3 L -1 1 L -4 9 L -9 14 L -7 7 L -11 10 Z',near?'#5c94db':'#405886');
  shape(ctx,'M -2 10 L 4 2 L 7 1 L 4 7 L 5 6 L 0 16 L -3 18 Z M 5 14 L 9 8 L 8 17 L 5 21 Z',near?'#465e9d':'#374a7b');
  shape(ctx,'M -7 3 L -4 -1 M -6 7 L -3 3 M 2 2 L 4 0',null,near?'#8dbcf4':'#576fa0',.85);
  shape(ctx,'M -10 12 L -6 6 M -4 15 L -1 10 M -1 18 L 2 13 M 6 16 L 7 13',null,near?'#7497d6':'#50668d',.65);
  ctx.restore();

  ctx.save();ctx.translate(handX,handY);
  ctx.rotate(-Math.atan2(fx,fy)*.58);
  shape(ctx,'M -9 -6 L -4 -10 L 4 -9 L 8 -7 L 9 -3 L 12 0 L 12 5 L 9 7 L 6 6 L 3 8 L -1 8 L -4 7 L -8 7 L -11 4 L -11 1 Z',
    near?'#474e79':'#313a61',INK,1.7);
  shape(ctx,'M -10 -1 L -6 -6 L -2 -7 L -3 -3 L -7 0 Z M 0 -6 L 4 -7 L 6 -5 L 2 -2 Z',near?'#66709a':'#47527a');
  shape(ctx,'M -7 5 L -7 2 L -5 0 M -2 7 L -2 3 L 0 1 M 4 6 L 4 2 L 6 0 M 8 5 L 8 2',null,'#222a4b',1);
  shape(ctx,'M -6 0 L -3 -1 L -2 1 L -5 2 Z M 1 -1 L 4 -2 L 5 0 L 2 1 Z M 6 -1 L 8 -2 L 9 0 L 7 1 Z',near?'#9aa2bc':'#717b9c');
  ctx.restore();
}

function skull(ctx, roar, blink, energy) {
  // Broad temporal arches, the dark nasal cavity and the two blunt canines form
  // a readable skull mask even at the smallest phone zoom.
  shape(ctx,'M -22 -13 L -21 -21 L -18 -19 L -16 -28 L -12 -26 L -9 -31 L -6 -29 L -1 -32 L 3 -28 L 7 -29 L 10 -26 L 15 -24 L 17 -19 L 20 -18 L 19 -10 L 24 -5 L 20 -3 L 23 2 L 17 5 L 18 10 L 11 9 L 8 14 L 4 12 L -1 15 L -2 10 L -10 13 L -9 9 L -18 10 L -16 4 L -22 4 L -20 -1 L -25 0 L -22 -7 L -25 -6 Z',
    wash(ctx,-17,-28,18,12,['#487bca','#315da3','#243361']),INK,2.05);
  shape(ctx,'M -21 -10 L -18 -20 L -15 -19 L -12 -26 L -9 -24 L -5 -28 L -2 -27 L -5 -22 L -12 -17 L -15 -10 L -15 -15 Z M -18 2 L -15 -7 L -11 -10 L -13 -3 L -12 -4 L -17 4 Z','#7192cd');
  shape(ctx,'M -16 -18 L -13 -22 M -14 -15 L -11 -19 M -9 -23 L -6 -26',null,'#aac5e2',.9);
  ctx.save();ctx.translate(7,roar*4);ctx.rotate(roar*.46+.04);
  shape(ctx,'M -12 -2 Q -8 -6 -1 -4 L 10 -3 L 17 -5 L 19 0 L 15 8 L 9 12 L 0 11 L -8 8 L -14 4 Z','#22253b',INK,1.6);
  shape(ctx,'M -9 0 L -3 -2 L 8 -1 L 14 -2 L 14 5 L 8 8 L 1 8 L -6 5 Z','#773e58');
  shape(ctx,'M -5 4 Q 0 0 7 3 L 11 5 L 7 7 L 2 7 Z','#d17480');
  shape(ctx,'M -12 1 L -8 1 L -6 5 L 1 7 L 10 7 L 17 1 L 17 5 L 12 11 L 8 13 L 1 13 L -7 9 L -11 6 Z',
    '#b6ada6','#39384e',1);
  shape(ctx,'M -3 6 L -1 2 L 1 6 L 4 7 L 5 4 L 7 7 L 10 6 L 12 2 L 13 5 L 9 9 L 1 9 Z','#f9dfb6','#665663',.6);
  ctx.restore();

  shape(ctx,'M -15 -12 L -13 -20 Q -11 -26 -4 -27 L 3 -28 L 11 -26 Q 15 -25 17 -21 L 18 -16 L 23 -13 L 22 -7 L 26 -3 L 25 2 L 21 3 L 19 7 L 14 9 L 9 7 L 6 6 L 1 6 L -2 8 L -6 4 L -9 5 L -13 1 L -11 -6 L -16 -7 Z',
    wash(ctx,-7,-24,17,9,['#fff1cf','#e3d5b8','#b6a7a1']),'#323349',1.7);
  shape(ctx,'M -14 -13 L -11 -19 L -6 -23 L 1 -25 L -1 -21 L -7 -17 L -8 -15 Z','#f9e8c6');
  shape(ctx,'M -12 -11 L -8 -11 L -4 -7 L -5 -4 L -9 0 L -11 -2 L -9 -6 Z M -2 1 L 3 -1 L 7 1 L 12 1 L 14 4 L 9 5 L 3 4 L -1 5 Z','#b1a4a2');
  shape(ctx,'M -11 -13 Q -7 -17 -1 -15 L 6 -11 L 5 -7 L 1 -5 L -5 -5 L -10 -8 Z',
    '#242540','#7f777c',.85);
  shape(ctx,'M 11 -12 L 16 -16 L 20 -15 L 21 -11 L 18 -7 L 14 -6 L 11 -8 Z',
    '#292a40','#82757a',.85);
  if (blink>.13) {
    shape(ctx,'M -6 -10 L -1 -10 L 2 -9 L 1 -7 L -2 -7 L -5 -8 Z M 14 -9 L 19 -12 L 18 -9 L 16 -8 L 14 -8 Z',
      energy>.7?'#fff29d':'#ffb64c');
    oval(ctx,-.6,-8.5,.65,1.05,'#493747');oval(ctx,16.8,-9.7,.55,.85,'#493747');
    oval(ctx,-1.6,-8.9,.45,.44,'#fff7c9');
  }
  shape(ctx,'M -13 -16 L -8 -20 L -3 -19 L 6 -14 L 9 -14 L 13 -18 L 18 -20 L 19 -17 L 13 -13 L 11 -11 L 7 -10 L 2 -13 L -5 -15 L -10 -14 Z',
    '#eee3c9','#afa59e',.8);
  shape(ctx,'M -12 -17 L -7 -20 L -3 -19 M 11 -15 L 15 -18',null,'#fff6dc',1.15);
  shape(ctx,'M 7 -10 L 10 -10 L 13 -6 L 15 -2 L 12 -1 L 9 -3 L 7 -1 L 4 -2 Z',
    '#463d4f','#9e8e90',.7);
  shape(ctx,'M 8 -8 L 9 -5 L 7 -3 L 6 -3 Z M 10 -7 L 12 -5 L 13 -3 L 10 -4 Z','#201e36');
  shape(ctx,'M -6 -4 L -2 -3 L 2 -5 L 2 -2 L -2 1 L -7 0 Z M 16 -5 L 20 -8 L 21 -6 L 18 -3 Z','#f6e8ce');
  shape(ctx,'M -5 1 Q -1 -1 3 0 L 7 1 L 11 1 L 15 2 L 21 -1 L 24 -1 L 23 3 L 20 5 L 15 5 L 10 5 L 6 4 L 0 3 L -4 5 Z',
    '#eee1c4','#aa9895',.8);
  shape(ctx,'M -4 3 L 0 2 L 1 4 L 0 10 L -2 13 L -4 8 Z M 17 4 L 21 2 L 21 7 L 18 11 L 17 9 Z',
    '#fff1d2','#6e6670',.75);
  shape(ctx,'M 2 3 L 6 4 L 5 7 L 2 6 Z M 7 4 L 10 5 L 10 7 L 7 7 Z M 11 5 L 15 4 L 14 7 L 11 7 Z','#f5dfba','#8e807e',.5);
  shape(ctx,'M -3 -25 L 0 -20 L -2 -18 M 0 -20 L 3 -19 M 9 -25 L 8 -23 L 10 -21 M -8 1 L -7 3',null,'#a79e9b',.68);
  shape(ctx,'M -10 -22 L -5 -25 L 0 -26 M 3 -26 L 7 -25',null,'#fff9df',.95);
}

export function drawRex(ctx, {time=0,walk=0,facing=1,air=0,slam=0,swipe=0,roar=0,charge=0,reduced=false,glide=0,stride=time*10.2,flap=0,slide=0,hand=0} = {}) {
  const gait=walk*(reduced ? .68 : 1);
  const step=Math.sin(stride),lift=Math.cos(stride);
  const strike=Math.sin((1-swipe)*Math.PI)*swipe**.32;
  const frontHook=hand===0?strike:0,backHook=hand===0?0:strike;
  const brace=Math.sin(slide*Math.PI*.75)*slide;
  const voice=Math.min(1,roar*4),crush=Math.min(1,slam*2.2);
  const beat=voice*(.58+.42*Math.sin(time*22));
  const spread=Math.min(1,air*.72+glide*.4+voice*.50+crush*.55+strike*.16+flap*.28+brace*.15);
  const wingIdle=Math.sin(time*5.4)*(.04+gait*.08+air*(.5-.3*glide));
  const downstroke=-flap*.88*Math.cos((1-flap)*Math.PI*1.65);
  const wingMotion=(wingIdle+downstroke)*(reduced ? .34 : 1);
  const bob=(Math.sin(time*2.6)*.9-Math.abs(lift)*2.5*gait+crush*4+brace*3)*(reduced ? .45 : 1);
  const lean=step*.035*gait+strike*.105+crush*.05-air*.06-brace*.14;
  ctx.save();ctx.scale(facing<0?-1:1,1);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.save();ctx.translate(0,bob);ctx.translate(-6,-45);ctx.rotate(lean);ctx.translate(6,45);
  wing(ctx,true,spread,wingMotion*.82,voice);
  wing(ctx,false,spread,wingMotion,voice);
  ctx.restore();
  hindLeg(ctx,-24,-47+bob,-34-step*13*gait-air*7-brace*6,-1-Math.max(0,lift)*8*gait-air*14,false);
  hindLeg(ctx,-20,-44+bob,-19+step*13*gait+air*4+brace*4,-Math.max(0,-lift)*10*gait-air*9,true);
  const reach=voice*(.7+.3*Math.cos(time*22));
  arm(ctx,11,-79+bob,31+step*3*gait+reach*4+backHook*12,-51+bob-air*3-reach*10-backHook*15,
    37+step*15*gait+air*7-reach*14+backHook*36+brace*7,-8-Math.max(0,-lift)*11*gait-air*15-reach*50-backHook*57,false);
  ctx.save();ctx.translate(0,bob);ctx.translate(-6,-45);ctx.rotate(lean);ctx.translate(6,45);
  body(ctx);
  ctx.save();ctx.translate(14+strike*3,-90+crush*2-voice*3);ctx.rotate(-voice*.17+strike*.07+Math.sin(time*2.8)*.014);
  skull(ctx,voice+strike*.2,(time+1.7)%4.23,Math.max(charge,voice));ctx.restore();ctx.restore();
  const handX=14-step*19*gait+air*11+frontHook*49-beat*14-backHook*6-brace*7;
  const handY=-8-Math.max(0,lift)*12*gait-air*21-frontHook*52-beat*57-backHook*10;
  arm(ctx,-11,-79+bob, -7-step*7*gait+frontHook*25-beat*11+air*4, -44+bob-frontHook*19-beat*4-air*6, handX,handY,true);
  ctx.restore();
}
