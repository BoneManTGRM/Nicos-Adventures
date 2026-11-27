import {drawPerson} from './pedestrian-art.mjs';
import {drawVehicle} from './vehicle-art.mjs';
import {carryAnchor} from './nacho-moves.mjs';

const paint = typeof Image==='function' ? new Image() : null;
if(paint)paint.src=new URL('./nacho-parts.webp',import.meta.url).href;
const limbs = typeof Image==='function' ? new Image() : null;
if(limbs)limbs.src=new URL('./nacho-limbs.webp',import.meta.url).href;
const ink='#342136';
const bronze=['#824733','#b9603a','#efa760','#ffcf8c'];
const teal=['#0c3845','#087e7e','#32b5a7','#8af6d1'];
const crimson=['#6d203d','#bc3045','#ed5650','#ffac72'];

// Four tightly fitted transparent cells. All joints are drawn in local units.
function stamp(c,cell,x,y,w,h,texture=paint){
  if(!texture?.complete || !texture.naturalWidth)return false;
  const side=texture.naturalWidth/2;
  c.drawImage(texture,(cell%2)*side,Math.floor(cell/2)*side,side,side,x,y,w,h);
  return true;
}
function oval(c,x,y,rx,ry,color,rotation=0){
  c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fillStyle=color;c.fill();
}
function contour(c,d,fill,stroke=ink,width=1.2){
  const p=new Path2D(d);
  if(fill){c.fillStyle=fill;c.fill(p);}
  if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke(p);}
}
function grad(c,x,y,x2,y2,palette){
  const g=c.createLinearGradient(x,y,x2,y2);
  g.addColorStop(0,palette[0]);g.addColorStop(.38,palette[1]);g.addColorStop(.71,palette[2]);g.addColorStop(1,palette[3]);
  return g;
}
// A tapered muscle runs from its proximal joint to its distal joint.
function segment(c,x,y,x2,y2,r,r2,colors){
  const dx=x2-x,dy=y2-y,len=Math.max(.01,Math.hypot(dx,dy));
  c.save();c.translate(x,y);c.rotate(Math.atan2(dy,dx));
  c.beginPath();c.moveTo(-r*.48,-r*.64);
  c.bezierCurveTo(len*.20,-r*1.37,len*.64,-r*1.05,len,-r2*.83);
  c.quadraticCurveTo(len+r2*.76,0,len,r2*.8);
  c.bezierCurveTo(len*.65,r*.77,len*.15,r*1.24,-r*.48,r*.6);
  c.quadraticCurveTo(-r*1.17,0,-r*.48,-r*.64);
  c.fillStyle=grad(c,0,r,0,-r,colors);c.fill();c.strokeStyle=ink;c.lineWidth=1.3;c.stroke();
  c.beginPath();c.moveTo(len*.05,-r*.68);c.quadraticCurveTo(len*.34,-r,len*.64,-r*.66);
  c.strokeStyle=colors[3];c.lineWidth=1;c.stroke();c.restore();
}
// Fit each painted muscle between its two joints. Overlap the ends to hide seams.
function muscle(c,cell,x,y,x2,y2,width,colors) {
  const length=Math.hypot(x2-x,y2-y);
  c.save();c.translate(x,y);c.rotate(Math.atan2(y2-y,x2-x)-Math.PI/2);
  const painted=stamp(c,cell,-width*.5,-width*.28,width,length+width*.47,limbs);
  c.restore();
  if(!painted)segment(c,x,y,x2,y2,width*.44,width*.31,colors);
}
function leg(c,x,y,kx,ky,fx,fy,far){
  muscle(c,2,x,y,kx,ky,18,teal);
  segment(c,kx,ky,fx-1,fy-6,5.8,4.1,bronze);
  if(!stamp(c,3,kx-6.6,ky-5.8,13.2,11.6,limbs))oval(c,kx,ky,6.8,5.3,'#b53047');
  c.save();c.translate(fx,fy);
  if(!stamp(c,3,-7,-19,22,20)){
    contour(c,'M-6 -18 L4 -18 5 -7 Q8 -4 14 -3 L15 0 -7 0Z',grad(c,-5,0,6,-17,crimson));
    contour(c,'M-3 -15 L2 -14 M-3 -11 L2 -10 M-3 -7 L2 -6',null,'#ffcf62',1.3);
  }
  if(far){c.fillStyle='#20203733';c.fillRect(-3,-16,3,11);}
  c.restore();
}
function arm(c,sx,sy,hx,hy,bend,far){
  const dx=hx-sx,dy=hy-sy,len=Math.max(1,Math.hypot(dx,dy));
  const elbow=Math.sqrt(Math.max(2,31**2-(len*.48)**2))*bend;
  const ex=sx+dx*.46-dy/len*elbow, ey=sy+dy*.46+dx/len*elbow;
  muscle(c,0,sx,sy,ex,ey,far?21:24,bronze);
  muscle(c,1,ex,ey,hx,hy,far?15:17.5,bronze);
  c.save();c.translate(hx,hy);
  c.rotate(Math.atan2(hy-ey,hx-ex)*.7);
  if(!stamp(c,2,-8,-8.2,20,16.4)){
    contour(c,'M-8 -6 L-2 -8 1 -6 6 -7 11 -3 11 3 5 7 -5 7 -8 4Z',grad(c,0,8,0,-8,bronze));
    contour(c,'M-8 -6 L-4 -7 -2 7 -7 6Z','#d33c46','#6a2638',.8);
  }
  c.restore();
}
function body(c){
  if(stamp(c,1,-27,-97,62,70))return;
  contour(c,'M-13 -94 Q0 -99 16 -91 Q28 -89 26 -72 Q42 -55 31 -38 Q24 -25 4 -28 L-17 -31 Q-29 -46 -25 -70 Q-28 -88 -13 -94Z',grad(c,-20,-32,24,-84,bronze));
  contour(c,'M-21 -44 Q3 -38 33 -48 L31 -36 Q17 -26 4 -27 L-17 -31Z',grad(c,-18,-29,17,-45,teal));
  contour(c,'M-22 -46 Q3 -39 33 -49 L32 -41 Q4 -33 -21 -40Z','#e6ae48');
  oval(c,9,-42,7,4.4,'#ffdf70');
  contour(c,'M-15 -75 Q-1 -66 10 -75 M12 -75 Q20 -69 25 -76 M4 -48 Q13 -45 19 -50',null,'#95492f',1.6);
}
function head(c) {
  if(stamp(c,0,-14,-128,38,42))return;
  contour(c,'M-13 -108 Q-15 -124 0 -127 Q14 -129 20 -118 L21 -111 24 -107 21 -104 Q24 -95 14 -90 L3 -86 -6 -93Z',grad(c,-13,-91,13,-126,crimson));
  contour(c,'M-13 -118 L-2 -113 6 -116 18 -121 12 -111 4 -106 -3 -109 -8 -107Z','#ffce59');
  contour(c,'M-12 -116 L-4 -112 -7 -108 -14 -110Z','#34c9bd');
  contour(c,'M0 -111 L7 -113 4 -109 1 -108Z','#332138');
  contour(c,'M9 -105 Q14 -108 19 -104 L21 -99 Q15 -94 9 -98Z','#dda46c');
  contour(c,'M8 -101 Q11 -104 15 -102 Q18 -104 21 -102 L23 -104 Q23 -98 16 -99 Q12 -97 8 -101Z','#392538');
}
export function drawNacho(c,a,time,facing,reduced=false) {
  const step=Math.sin(a.stride), gait=a.walk, air=a.flight, flop=a.flopTilt;
  const fist=Math.sin((1-a.swipe)*Math.PI)*Math.sqrt(a.swipe);
  const bob=(Math.sin(time*2.8)*.9+Math.abs(Math.cos(a.stride))*gait*1.9)*(reduced?.45:1);
  const impact= a.splashPose;
  const carried=a.haul, anchor=carried && carryAnchor(a);
  const anchorX=anchor?(anchor.x-a.x)*facing:0,anchorY=anchor?a.y-anchor.y:0;
  c.save();c.scale(facing,1);c.lineCap='round';c.lineJoin='round';
  // Rotate around the belly and lower the centre of mass so the belly touches the impact plane.
  const pivotY=-55+bob+flop*28+impact*2;
  c.translate(0,pivotY);c.rotate(flop*1.44+step*gait*.025+fist*.055);c.scale(1+impact*.05,1-impact*.035);c.translate(0,55);
  const rearFoot=-13-step*gait*15-air*12, frontFoot=12+step*gait*15+air*8;
  leg(c,-10,-34,-14-step*gait*8-air*10,-21-air*7,rearFoot,-Math.max(0,step)*gait*9-air*14,true);
  leg(c,8,-34,14+step*gait*9+air*9,-19-air*12,frontFoot,-Math.max(0,-step)*gait*9-air*9,false);
  let farX=23+step*gait*7,farY=-63-air*12,nearX=20-step*gait*9,nearY=-61-air*12;
  if(!carried){
    if(a.hand===1){nearX+=fist*57;nearY+=fist*9;}else{farX+=fist*52;farY+=fist*9;}
    nearX+=a.throwPose*40;nearY-=a.throwPose*15;
    nearX+=flop*14;farX-=flop*11;
  }
  if(carried){
    farX=anchorX+(carried.kind==='car'?12:0);farY=anchorY-bob;
    if(carried.kind==='car'){nearX=anchorX-12;nearY=anchorY-bob;}
    else {nearX+=fist*50;nearY+=fist*7;}
  }
  if(a.celebrate){farX=38;farY=-121;nearX=-27;nearY=-58;}
  arm(c,16,-86,farX,farY,.8,true);
  body(c);
  c.save();c.translate(0,-96);c.rotate(-.055*air-.05*fist);c.translate(0,96);head(c);c.restore();
  if(carried){
    c.save();c.translate(anchorX,anchorY-bob);
    if(carried.kind==='car'){
      drawVehicle(c,{...carried.target,x:0,y:0,angle:0,dir:carried.target.dir*facing},time,reduced);
    }else{
      c.rotate(-.38);c.translate(0,8);drawPerson(c,carried.target,time*(reduced?5:13),true);
    }
    c.restore();
  }
  arm(c,-13,-86,nearX,nearY,carried?.kind==='car'||a.celebrate?-.94:.97,false);
  c.restore();
}

export function paintNachoPoster(canvas) {
  const c=canvas.getContext('2d');
  const draw=()=>{
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,canvas.width,canvas.height);
    c.translate(171,347);c.scale(2.63,2.63);
    drawNacho(c,{x:0,y:0,stride:0,walk:0,flight:0,flopTilt:0,celebrate:true,swipe:0,hand:1,throwPose:0,splashPose:0},0,1,true);
  };
  draw();for(const atlas of [paint,limbs])if(atlas&&!atlas.complete)atlas.addEventListener('load',draw,{once:true});
}
