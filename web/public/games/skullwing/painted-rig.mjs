// Painted pieces use the original rig's local joint positions in world units.
// Far-side pieces have the same geometry with a baked indigo shadow.
const sheet = typeof Image === 'function' ? new Image() : null;
if (sheet) sheet.src = new URL('./skullwing-painted.webp', import.meta.url).href;
const hindlegs = typeof Image === 'function' ? new Image() : null;
if (hindlegs) hindlegs.src = new URL('./skullwing-hindlegs.webp', import.meta.url).href;
export function ready() { return !!(sheet?.complete && sheet.naturalWidth); }

const parts = {
  torso:[1,1,280,272], head:[285,1,243,246], voice:[535,1,244,251],
  wing:[1,280,490,249], farWing:[1,532,490,249],
  upper:[501,280,146,210], farUpper:[501,532,146,210],
  fore:[655,280,134,220], farFore:[655,532,134,220],
};
function stamp(ctx, rect, x, y, width, height) {
  ctx.drawImage(sheet,rect[0],rect[1],rect[2],rect[3],x,y,width,height);
}

// Each triangle maps an atlas patch onto three moving joints. The subpixel
// overlap belongs to the internal cut edges, which otherwise alias on iOS.
function triangle(ctx, rect, s0,s1,s2, d0,d1,d2) {
  const ux=s1[0]-s0[0], uy=s1[1]-s0[1], vx=s2[0]-s0[0], vy=s2[1]-s0[1];
  const det=ux*vy-uy*vx;
  const x1=d1[0]-d0[0], y1=d1[1]-d0[1], x2=d2[0]-d0[0], y2=d2[1]-d0[1];
  const a=(x1*vy-x2*uy)/det,b=(y1*vy-y2*uy)/det,c=(x2*ux-x1*vx)/det,d=(y2*ux-y1*vx)/det;
  if(!Number.isFinite(a+b+c+d) || Math.abs(a*d-b*c)<.001) return;
  const midX=(d0[0]+d1[0]+d2[0])/3,midY=(d0[1]+d1[1]+d2[1])/3;
  ctx.save();ctx.beginPath();
  for (let n=0;n<3;n++){
    const p=n===0?d0:n===1?d1:d2;
    const px=p[0]-midX,py=p[1]-midY;
    const k=1+.52/Math.max(1,Math.hypot(px,py));
    if(n===0)ctx.moveTo(midX+px*k,midY+py*k);else ctx.lineTo(midX+px*k,midY+py*k);
  }
  ctx.closePath();ctx.clip();
  ctx.transform(a,b,c,d,d0[0]-a*s0[0]-c*s0[1],d0[1]-b*s0[0]-d*s0[1]);
  stamp(ctx,rect,0,0,1,1);ctx.restore();
}
// Source rows are normalized. Their two destination ends can rotate and shear
// independently, so the wrist and heel can retain their original articulation.
function band(ctx,rect,y0,y1,left0,right0,left1,right1) {
  const a=[0,y0], b=[1,y0], c=[1,y1], d=[0,y1];
  triangle(ctx,rect,a,b,c,left0,right0,right1);
  triangle(ctx,rect,a,c,d,left0,right1,left1);
}
function row(x,y,angle,width,pivot) {
  const dx=Math.cos(angle)*width,dy=Math.sin(angle)*width;
  return [[x-dx*pivot,y-dy*pivot],[x+dx*(1-pivot),y+dy*(1-pivot)]];
}
const wristUV=[.843,.129];
const sourceRays=[
  [.982,.735], [.856,.98], [.588,.956], [.310,.806], [.006,.57], [.465,.095], [.887,.018], [.962,.13]
].map(p=>[wristUV[0]+4*(p[0]-wristUV[0]),wristUV[1]+4*(p[1]-wristUV[1])]);

export function wing(ctx,far,spread,flap) {
  const w=-19-19*spread, h=-35-13*spread+flap*10;
  const tipX=-51-39*spread,tipY=-10-15*spread+flap*18;
  const f2X=-49-26*spread,f2Y=13-4*spread+flap*11;
  const f3X=-35-22*spread,f3Y=19-2*spread+flap*6;
  const f4X=-20-11*spread,f4Y=19+flap*2;
  const center=[w,h],rect=far?parts.farWing:parts.wing;
  const rays=[[3,5],[f4X,f4Y],[f3X,f3Y],[f2X,f2Y],[tipX,tipY],
    [w+(tipX-w)*.44,h+(tipY-h)*.22-4],[w-3,h-11],[w+4,h-4]]
    .map(p=>[w+4*(p[0]-w),h+4*(p[1]-h)]);
  for(let i=0;i<rays.length;i++){
    const j=(i+1)%rays.length;
    triangle(ctx,rect,wristUV,sourceRays[i],sourceRays[j],center,rays[i],rays[j]);
  }
}

// Source anchors are painted joint centers in pixels, relative to each part.
const thighPart = {x:4, w:160, h:224, top:[76,44], bottom:[105,196], widthScale:.19};
const shinPart = {x:172, w:117, h:223, top:[72,29], bottom:[70,198], widthScale:.149};

function drawLegBone(ctx, part, atlasY, ax, ay, bx, by) {
  const sourceX = part.bottom[0] - part.top[0], sourceY = part.bottom[1] - part.top[1];
  const targetX = bx - ax, targetY = by - ay;
  // Scale along the painted bone independently of its thickness.
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(Math.atan2(targetY, targetX) - Math.PI / 2);
  ctx.scale(part.widthScale, Math.hypot(targetX, targetY) / Math.hypot(sourceX, sourceY));
  ctx.rotate(Math.PI / 2 - Math.atan2(sourceY, sourceX));
  ctx.translate(-part.top[0], -part.top[1]);
  ctx.drawImage(hindlegs, part.x, atlasY, part.w, part.h, 0, 0, part.w, part.h);
  ctx.restore();
}

export function hindLeg(ctx, hipX, hipY, kneeX, kneeY, ankleX, ankleY, footAngle, near) {
  if (!hindlegs?.complete || !hindlegs.naturalWidth) return false;
  const atlasY = near ? 4 : 236;
  // Register the ankle at (39,33) and the load-bearing sole at y=85.
  ctx.save();
  ctx.translate(ankleX, ankleY);
  ctx.rotate(footAngle);
  ctx.scale(.141, 7 / 52);
  ctx.drawImage(hindlegs, 297, atlasY, 184, 88, -39, -33, 184, 88);
  ctx.restore();
  drawLegBone(ctx, shinPart, atlasY, kneeX, kneeY, ankleX, ankleY);
  drawLegBone(ctx, thighPart, atlasY, hipX, hipY, kneeX, kneeY);
  return true;
}
export function body(ctx) { stamp(ctx,parts.torso,-40,-101,70,70); }

export function arm(ctx,sx,sy,ex,ey,hx,hy,near) {
  const dx=ex-sx,dy=ey-sy,len=Math.max(1,Math.hypot(dx,dy));
  const upperAngle=-Math.atan2(dx,dy),size=near?1:.83;
  const fx=hx-ex,fy=hy-ey,lower=Math.max(1,Math.hypot(fx,fy)),palmAngle=-Math.atan2(fx,fy)*.58;
  const armAngle=-Math.atan2(fx,fy),ux=fx/lower,uy=fy/lower;
  const cos=Math.cos(palmAngle),sin=Math.sin(palmAngle);
  const rect=near?parts.fore:parts.farFore;
  const collar=row(ex-ux*7.5,ey-uy*7.5,armAngle,36*size,.52);
  const muscle=row(ex+fx*.45,ey+fy*.45,armAngle,34*size,.36);
  const wrist=row(hx+sin*7,hy-cos*7,palmAngle,29*size,.55);
  const knuckle=row(hx-sin*8.3,hy+cos*8.3,palmAngle,27*size,.59);
  band(ctx,rect,0,.42,...collar,...muscle);
  band(ctx,rect,.42,.70,...muscle,...wrist);
  band(ctx,rect,.70,1,...wrist,...knuckle);
  // Layer the bicep locks over the forearm collar. This also lets the
  // foreshortened far elbow emerge continuously from behind the chest.
  ctx.save();ctx.translate(sx,sy);ctx.rotate(upperAngle);ctx.scale(size,len/28);
  stamp(ctx,near?parts.upper:parts.farUpper,near?-16.3:-19,-13,near?33:38,47);ctx.restore();
}

export function skull(ctx,roar,blink,energy) {
  // Register both paintings at their brow. The moving mandible can open
  // beneath the brow without making the skull jump to a different position.
  const open=Math.min(1,Math.max(0,(roar-.20)/.48));
  if(open<1) stamp(ctx,parts.head,-26,-33,53,51);
  if(open>0){
    ctx.save();ctx.globalAlpha*=open;
    stamp(ctx,parts.voice,-26.8,-34.2,55.1,52.5+2.6*open);ctx.restore();
  }
  // At high charge the tiny amber pupil glints against the dark eye socket.
  if(open<.05 && blink<.13){
    ctx.save();ctx.fillStyle='#251c29';
    ctx.beginPath();ctx.ellipse(7.6,-15.7,1.23,.85,.12,0,2*Math.PI);ctx.fill();
    ctx.beginPath();ctx.ellipse(18.3,-14.2,.70,.61,0,0,2*Math.PI);ctx.fill();ctx.restore();
  }else if(energy>.72 && open<.05){
    ctx.save();ctx.globalAlpha*=.38*(energy-.72)/.28;
    ctx.fillStyle='#fff1ab';ctx.beginPath();ctx.ellipse(7.6,-15.7,.64,.35,0,0,2*Math.PI);ctx.fill();ctx.restore();
  }
}
