// Coordinates follow the simulation: y is the height above the road.
// Fixed vector paths are shared across frames, including the stamped fan blades.
const paths = new Map();
const TAU = Math.PI * 2;
const ink = '#212637';
const copper = '#ed9651';
const warningGold = '#ffcc67';
const colors = {
  drone: {body:'#ff9f39', edge:'#c23d45', core:'#fff3ac'},
  tank:  {body:'#ff7846', edge:'#aa3b50', core:'#fff1bf'},
  police:{body:'#65deff', edge:'#654aa8', core:'#ecfeff'}
};

function shape(c, d, fill, outline, width=1) {
  let path=paths.get(d);
  if (!path) {path=new Path2D(d); paths.set(d,path);}
  if (fill) {c.fillStyle=fill;c.fill(path);}
  if (outline) {c.strokeStyle=outline;c.lineWidth=width;c.stroke(path);}
}

function oval(c,x,y,rx,ry,fill) {
  c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();
}

function rotor(c,x,y,scale,phase) {
  c.save();c.translate(x,y);c.scale(scale,scale);
  // The front lip partially occludes the fan, making a deep duct.
  shape(c,'M-12 -1 Q-11 -5 0 -5 Q11 -5 12 -1 L11 3 Q8 6 0 6 Q-9 6 -11 3 Z','#4a5161',ink,1.4);
  oval(c,0,-1,11.6,3.65,'#d4d6c3');
  oval(c,0,-1,9.5,2.65,'#253343');
  c.save();c.translate(0,-1);c.scale(1,.28);c.rotate(phase);
  for(let j=0;j<3;j++){
    shape(c,'M0 -.75 Q7 -5 9 -3 Q9 -1 1 .75 Z','#90acae');
    c.rotate(TAU/3);
  }
  c.restore();
  oval(c,0,-1,2.15,.94,'#eed3a3');
  shape(c,'M-10 1.2 Q-.2 5.15 10 .8 L9 2.8 Q0 6.3 -9 3.4 Z',copper);
  shape(c,'M-10 -2.5 Q-6 -5 1 -4.5',null,'#fff4d5',.56);
  shape(c,'M3 3.4 L4.8 3.2 M5.9 2.95 L7.45 2.6',null,'#603b44',.75);
  c.restore();
}

function craft(c,drone,actor,time,reduced,charging) {
  if (!drone || drone.disabled>0) return;
  const t=reduced?0:time;
  const facing=actor.x<drone.x?-1:1;
  c.save();c.translate(drone.x,-drone.y+Math.sin(t*3.6)*.65);
  c.scale(facing,1);c.rotate(Math.sin(t*2.2)*.025);
  // Far truss, engine and small stabilizing tail.
  shape(c,'M-5 -4 L5 -14 L14 -13 L14 -10 L7 -10 L3 -2 Z','#607582',ink,1.2);
  rotor(c,14,-13,.79,t*17+1.4);
  shape(c,'M-13 -1 L-22 -6 L-24 -11 L-21 -12 L-15 -8 L-8 -7 Z','#c6cfc7',ink,1.2);
  shape(c,'M-22 -9 L-16 -7 L-14 -5 L-21 -7 Z','#e58548');
  // Flight pod, pale ceramic armored crown and inset panoramic glass.
  shape(c,'M-16 -2 Q-15 -8 -8 -10 L1 -11 Q8 -11 12 -6 L17 -5 L19 -2 L17 3 L9 5 L5 9 L-3 10 L-10 6 L-15 4 Z','#616d77',ink,1.55);
  shape(c,'M-15 -4 Q-13 -9 -7 -10 L0 -10 L2 -7 L-1 -5 L-11 -2 Z','#e6d8b7');
  shape(c,'M0 -10 Q8 -10 11 -6 L15 -4 L8 -3 L0 -5 L2 -7 Z','#89bbb9',ink,.75);
  shape(c,'M3 -9 L7 -8 L4.5 -5.1 L.8 -5.65 Z','#caede1');
  shape(c,'M-12 -1 L0 -4 L9 -2 L15 -3 L12 1 L3 4 L-7 3 Z','#e6954d',ink,.8);
  shape(c,'M-11 -.25 L-1 -2.7 L1 -2.3 L-7 .7 Z','#ffcb7b');
  shape(c,'M-2 -2 L-.1 -2.5 L-2 2.5 L-4 2 Z M2.1 -2.7 L4.1 -2.15 L2 2.8 L0 3 Z','#42404a');
  shape(c,'M-7 4 L0 6 L8 4 L5.4 7.7 L-2 8.6 Z','#aebbb7');
  shape(c,'M-4.4 5.5 L-.6 7.2 L3.2 6.9 M10.2 -7.1 L12.2 -5.2 L15.2 -4.6',null,'#f4e0b2',.55);
  oval(c,7,-1.45,.62,.62,'#f8d09a');
  // Near outrigger connects past the pod to a warm-rimmed turbine.
  shape(c,'M-7 1 L-17 -2 L-22 -6 L-20 -8 L-14 -5 L-4 -3 Z','#b5c2be',ink,1);
  rotor(c,-18,-7,.97,-t*19);
  // A single gimballed eye is the visual origin of its bright energy bolt.
  oval(c,10.2,3.35,5.35,4.65,ink);
  oval(c,10.45,3.2,4.2,3.45,'#b15e40');
  oval(c,11,2.85,2.9,2.6,charging?'#ffbd4a':'#f09457');
  oval(c,11.85,2.05,1.05,1,'#fff0c4');
  const flash=Math.max(0,Math.min(1,drone.flash||0));
  if (charging || flash>0) {
    const swell=reduced?0:.7*(.5+.5*Math.sin(t*7));
    c.globalAlpha=.24+flash*.22;
    oval(c,11,2.85,6.6+swell,5.4+swell,'#ff9a46');
    c.globalAlpha=1;
    oval(c,11,2.85,2.05+flash,1.9+flash*.55,'#fff5b3');
  }
  c.restore();
}

function warningPath(c,a,reduced) {
  const x=a.ox,y=-a.oy,tx=a.tx,ty=-a.ty;
  c.save();
  c.lineCap='round';c.setLineDash([3,5]);
  c.lineDashOffset=reduced?0:-a.age*12;
  c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);
  c.strokeStyle='rgba(34,28,48,.67)';c.lineWidth=2.6;c.stroke();
  c.strokeStyle='#ffcd74';c.lineWidth=1.1;c.stroke();
  c.restore();
}

function marker(c,a,reduced) {
  const progress=Math.min(1,a.age/Math.max(.01,a.warning));
  const r=reduced?13:17-progress*6;
  c.save();c.translate(a.tx,-a.ty);
  c.lineJoin='round';c.lineCap='round';
  c.beginPath();
  for(const sx of [-1,1])for(const sy of [-1,1]){
    c.moveTo(sx*(r-5),sy*r);c.lineTo(sx*r,sy*r);c.lineTo(sx*r,sy*(r-5));
  }
  c.strokeStyle=ink;c.lineWidth=3.1;c.stroke();
  c.strokeStyle=warningGold;c.lineWidth=1.4;c.stroke();
  // An outlined amber badge also works without color or motion cues.
  c.translate(0,-r-7.3);
  shape(c,'M-1.45 -4.2 Q0 -6.5 1.45 -4.2 L5.8 3.3 Q6.4 5.3 4.35 5.3 L-4.35 5.3 Q-6.4 5.3 -5.8 3.3 Z',warningGold,ink,1.35);
  shape(c,'M0 -2.3 L0 .6 M0 2.55 L0 2.7',null,ink,1.45);
  c.restore();
}

function bolt(c,a,reduced) {
  const p=colors[a.type]||colors.drone;
  const dx=a.tx-a.ox,dy=a.oy-a.ty;
  c.save();c.translate(a.x,-a.y);c.rotate(Math.atan2(dy,dx));
  const size=a.type==='tank'?1.19:a.type==='police'?.93:1;
  c.scale(size,size);
  c.globalAlpha=.23;
  oval(c,-2.6,0,reduced?8.5:13,4.1,p.body);
  c.globalAlpha=1;
  shape(c,'M-13 0 L-4.5 -2.6 L2 -2.8 L5.5 0 L2 2.8 L-4.5 2.6 Z',p.edge,ink,.65);
  shape(c,'M-9.5 0 L-2.6 -1.8 L1.75 -2.2 L4.35 0 L1.75 2.2 L-2.6 1.8 Z',p.body);
  shape(c,'M-4 0 L.9 -1.05 L3.25 0 L.9 1.05 Z',p.core);
  if(a.type==='police')shape(c,'M-6 -4.1 L-2.5 -3 L-4.8 -1.5 M-6 4.1 L-2.5 3 L-4.8 1.5',null,p.core,.85);
  if(a.type==='tank')shape(c,'M-3.7 -3.7 Q.4 -1.3 -3.7 3.7',null,p.core,.8);
  c.restore();
}

function shield(c,actor,hurt,reduced) {
  const amount=Math.max(0,Math.min(1,hurt/.7));
  c.save();c.translate(actor.x,-actor.y-48);
  const t=reduced?0:1-amount,rx=31+t*9,ry=36+t*12;
  c.globalAlpha=Math.min(.82,amount*1.4);
  c.lineCap='round';
  for(const [start,end] of [[-.74,-.24],[.02,.44],[2.46,2.97],[3.25,3.68]]){
    c.beginPath();c.ellipse(0,0,rx,ry,0,start,end);
    c.strokeStyle='#5b3857';c.lineWidth=3;c.stroke();
    c.strokeStyle='#ffe2a7';c.lineWidth=1.45;c.stroke();
  }
  c.restore();
}

export function drawDefense(c,s,reduced,layer) {
  const d=s.defense;
  if(!d)return;
  if(layer==='back') {
    const charging=d.attacks.some(a=>a.type==='drone'&&a.phase==='warning');
    craft(c,d.drone,s.actor,s.time,reduced,charging);
    for(const a of d.attacks)if(a.phase==='warning')warningPath(c,a,reduced);
  } else if(layer==='front') {
    for(const a of d.attacks){
      if(a.phase==='warning')marker(c,a,reduced);
      else if(a.phase==='flight')bolt(c,a,reduced);
    }
    if(d.hurt>0)shield(c,s.actor,d.hurt,reduced);
  }
}
