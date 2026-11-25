/* Pixel wildlife for the coastal forest and Arctic reserves. All poses face right. */
(() => {
  'use strict';
  const sizes = {
    blackbear:[145,87], grizzly:[152,93], kodiak:[165,98], polar:[174,91],
    muskox:[143,83], arcticfox:[107,56]
  };
  const colors = {
    blackbear:['121821','1b2028','262b32','353b40','454b4f','5c6261','a08767','d0b48c','7f654f','a18665','d3bf91'],
    grizzly:['2b2220','41302c','594036','795644','987858','b79b77','cfb694','e8d3ae','685445','a08b70','e0c7a1'],
    kodiak:['302420','49332a','644233','85583c','aa7851','be9066','d6b58c','f1d6a7','745644','9d785b','dec89f'],
    polar:['202b33','566777','889ba7','b0c1c4','ced7d1','e3e5d8','f1efdd','fff5dd','71828b','b9c4bc','f3eed6'],
    muskox:['231e22','3f302e','56403a','72513e','936e4e','b48f64','c6a57e','e4ce9c','7b6a56','b4a58a','e6d5ac'],
    arcticfox:['29303a','576476','74879a','a8b7c2','c4d0d1','dce3df','e8ece3','fbf6e4','83919a','acb9c2','eef2e9']
  };
  // Round just the corners of a closed control polygon, retaining sharp coat detail elsewhere.
  function roundedShape(a, color, points) {
    const curve=[];
    for(let i=0;i<points.length;i+=2){
      const k=(i+2)%points.length;
      curve.push(points[i]*.78+points[k]*.22,points[i+1]*.78+points[k+1]*.22);
      curve.push(points[i]*.22+points[k]*.78,points[i+1]*.22+points[k+1]*.78);
    }
    a.poly(color,curve);
  }
  function offset(a, dx, dy) {
    const path = pts=>pts.map((n,i)=>n+(i%2?dy:dx));
    return {poly:(c,pts)=>a.poly(c,path(pts)),line:(c,pts,w)=>a.line(c,path(pts),w),dot:(c,x,y)=>a.dot(c,x+dx,y+dy)};
  }
  const bears = {
    blackbear:{
      // Lean flanks, high rump, almost straight back, and high round ears.
      body:[5,43,10,33,19,23,31,18,45,18,61,21,77,21,89,17,99,17,109,21,115,28,114,43,106,55,96,63,88,68,70,65,54,63,39,65,23,63,10,60,5,52],
      back:[9,39,17,27,30,20,45,20,60,23,76,23,88,20,98,19,105,23,96,25,82,27,64,29,50,26,36,26,25,29,17,37,13,43],
      ribs:[13,39,26,29,38,26,55,30,66,33,82,29,97,24,102,27,99,38,86,49,66,56,49,56,36,51,24,53,14,50],
      waist:[39,58,51,52,66,53,80,47,94,38,95,45,87,56,79,61,62,61,49,60,40,63],
      shoulder:[75,30,85,22,95,20,102,22,106,31,102,41,92,50,91,60,86,65,80,63,75,53,78,45,84,35],
      shoulderLight:[76,32,83,25,93,21,99,22,97,25,88,28,81,36,78,38],
      hip:[11,42,20,34,31,30,41,32,49,40,45,50,36,58,29,65,21,68,19,61,21,54,16,49],
      hipLight:[14,40,21,34,30,32,38,32,45,37,38,35,30,35,23,39,19,46],
      headX:96,headY:15,headW:1,headH:1,ear:1.15,chin:.8,muzzle:6,
      rear:28,front:88,feet:85,legTop:53,legBulk:1.0,legSwing:8,
      fur:[[66,35],[56,36],[46,39],[77,32],[38,26],[90,30],[32,40],[62,42]]
    },
    grizzly:{
      // Salt-tipped shoulder hump, concave profile and smaller round ears.
      body:[4,48,8,36,16,28,29,22,44,22,57,25,68,22,81,10,91,5,99,5,109,12,117,23,117,35,111,47,102,57,97,68,88,73,77,70,65,69,52,66,37,68,24,68,11,62,6,57],
      back:[8,39,16,29,29,24,44,24,57,27,68,24,80,13,91,7,99,7,108,13,113,19,109,21,101,17,92,17,84,22,76,26,69,31,60,32,47,29,35,29,24,31,15,36,11,43],
      ribs:[11,42,21,32,34,29,51,31,65,35,78,28,89,22,100,22,107,30,101,43,88,51,70,58,53,59,34,57,21,60,12,54],
      waist:[39,61,52,56,65,56,78,53,91,42,98,41,92,53,83,65,74,67,58,65,48,63,38,66],
      shoulder:[71,32,80,21,89,13,99,12,108,17,111,26,108,36,98,48,94,63,91,72,81,72,76,64,76,51,81,38],
      shoulderLight:[72,31,80,21,88,14,97,11,103,13,107,16,100,15,94,17,86,23,82,29,76,32,73,36],
      hip:[9,47,16,36,30,31,42,33,50,41,48,52,40,59,32,68,25,72,17,69,18,60,16,56],
      hipLight:[13,43,20,36,30,32,39,33,45,37,37,36,27,38,20,42,16,49],
      headX:102,headY:19,headW:.97,headH:1.09,ear:.88,chin:1.3,muzzle:5,
      rear:28,front:88,feet:91,legTop:56,legBulk:1.13,legSwing:9,
      fur:[[17,39],[29,29],[34,30],[42,29],[49,32],[56,33],[61,32],[66,29],[71,29],[76,23],[81,18],[86,13],[90,11],[95,9],[102,13],[85,21],[90,18],[95,16],[78,29],[85,27],[72,34],[49,36],[54,37],[33,36],[63,37]]
    },
    kodiak:{
      // Thick russet coastal coat, long heavy body, exceptionally broad forequarters.
      body:[4,48,8,35,17,25,29,20,45,18,61,20,73,19,86,11,99,5,111,6,123,13,130,22,132,33,125,49,115,57,107,69,99,78,90,78,80,73,65,73,51,70,37,72,24,71,11,65,5,57],
      back:[8,39,17,28,30,22,45,20,61,22,74,21,87,13,99,7,110,8,120,13,123,18,115,16,106,14,95,17,83,24,72,28,61,29,48,26,32,27,21,31,14,38,10,44],
      ribs:[11,42,21,30,34,26,49,26,65,30,78,28,95,19,107,16,119,21,123,34,112,48,97,56,83,61,66,63,48,60,32,62,20,63,12,55],
      waist:[44,65,53,58,69,60,84,57,100,49,108,39,114,40,109,54,97,69,86,72,69,71,53,68,42,70],
      shoulder:[81,32,89,19,100,11,111,11,120,17,124,26,121,38,111,49,107,65,103,75,95,79,88,75,84,65,85,53,91,40],
      shoulderLight:[83,30,89,22,100,14,109,12,115,14,119,17,109,16,102,19,94,24,88,32,85,37],
      hip:[9,47,16,35,29,29,41,28,51,33,57,43,53,55,43,65,35,74,25,77,17,70,18,59,15,55],
      hipLight:[12,44,18,36,29,30,41,30,50,35,52,40,45,35,36,34,27,37,19,43,15,51],
      headX:111,headY:20,headW:1.03,headH:1.15,ear:.83,chin:1.65,muzzle:5,
      rear:31,front:99,feet:96,legTop:58,legBulk:1.35,legSwing:9,
      fur:[[22,37],[31,29],[40,25],[48,25],[57,28],[65,29],[74,26],[84,22],[89,18],[95,16],[104,13],[113,14],[90,26],[97,23],[65,35],[56,34],[43,35],[33,39]]
    },
    polar:{
      // An elongated body, small ears, a tapering neck and a long straight face.
      body:[6,42,11,30,23,19,34,15,52,16,69,20,84,19,96,15,107,15,121,18,129,20,137,25,136,36,126,43,117,49,108,60,103,68,95,71,83,67,68,63,51,61,39,65,26,67,15,63,8,56],
      back:[9,35,18,24,31,17,46,17,63,19,75,22,88,20,99,17,108,17,121,20,127,22,120,25,110,24,98,24,85,28,68,28,54,24,38,22,27,25,17,31,12,39],
      ribs:[12,38,22,27,35,22,49,23,68,28,83,28,101,22,117,23,126,28,121,38,106,47,90,54,71,57,55,54,39,55,27,59,15,54],
      waist:[40,57,54,52,69,54,86,52,103,45,114,38,117,42,106,53,97,63,88,66,74,61,62,59,51,59,39,63],
      shoulder:[83,30,92,21,102,18,110,19,116,24,116,33,108,43,103,53,102,65,98,72,90,70,87,64,86,55,90,44,94,36],
      shoulderLight:[87,29,92,23,102,19,111,20,116,24,109,23,101,24,94,29,89,35],
      hip:[11,43,18,31,31,24,41,23,50,29,54,38,51,49,41,59,33,68,25,70,20,65,20,56,16,51],
      hipLight:[14,39,21,31,31,26,41,25,49,30,49,34,43,29,34,29,26,33,20,40,17,45],
      headX:124,headY:19,headW:1.04,headH:.78,ear:.61,chin:.65,muzzle:6,
      rear:30,front:97,feet:89,legTop:52,legBulk:1.06,legSwing:9,
      fur:[[28,28],[41,22],[54,24],[65,27],[77,26],[95,23],[104,21],[110,23],[90,34],[83,38],[38,35]]
    }
  };
  function bearLeg(a,x,top,ground,phase,hind,far,bulk){
    const delta=Math.sin(phase),rise=Math.max(0,Math.cos(phase));
    const bend=x+(hind?4:-3)+delta*4;
    const hock=x+(hind?-6:-3)+delta*7;
    const paw=x+(hind?-3:1)+delta*(bulk>1.25?8:9), foot=ground-rise*4;
    const knee=top+(ground-top)*.43-rise;
    const hockY=top+(ground-top)*.68-rise*2;
    const b=bulk*(far?1.05:1.15),shadow=far?1:2,face=far?2:3;
    roundedShape(a,shadow,[x-8*b,top,x+9*b,top+1,bend+6*b,knee,hock+3*b,hockY,paw+2*b,foot-6,paw+8*b,foot-5,paw+10*b,foot-2,paw+9*b,foot,paw-5*b,foot,paw-7*b,foot-2,paw-7*b,foot-8,hock-5*b,hockY,bend-6*b,knee]);
    roundedShape(a,face,[x-5*b,top,x+6*b,top,bend+3*b,knee,hock+1.2*b,hockY,paw-1,foot-6,paw+5*b,foot-4,paw+7*b,foot-2,paw-3*b,foot-2,paw-4*b,foot-8,hock-2*b,hockY,bend-4*b,knee+1]);
    if(!far){
      a.line(4,[x+3*b,top+2,bend+3*b,knee-2,hock,hockY-1]);
      a.line(2,[hock-2*b,hockY+2,paw-4*b,foot-6,paw-2*b,foot-4]);
      a.line(1,[paw+2,foot-3,paw+4,foot-1]);a.dot(9,paw+6*b,foot-1);a.dot(9,paw+8*b,foot-1);
    }
  }
  function bearFace(a,b,kind,t){
    const ox=b.headX,oy=b.headY+Math.sin(t*2)*.65;
    const convert=pts=>pts.map((v,i)=>i%2?oy+v*b.headH:ox+v*b.headW);
    const shape=(c,p)=>a.poly(c,convert(p));const line=(c,p,n=1)=>a.line(c,convert(p),n);
    const dot=(c,x,y)=>a.dot(c,ox+x*b.headW,oy+y*b.headH);
    const ear=(x,y,r,far)=>{
      shape(far?1:2,[x-r*.9,y+4,x-r,y+1,x-r*.8,y-r*.75,x-r*.34,y-r,x+r*.32,y-r,x+r*.82,y-r*.7,x+r,y-r*.1,x+r*.75,y+3]);
      shape(far?2:4,[x-r*.7,y+1,x-r*.68,y-r*.5,x-r*.32,y-r*.8,x+r*.25,y-r*.8,x+r*.66,y-r*.49,x+r*.72,y,x+r*.35,y+2]);
      if(!far)shape(1,[x-r*.4,y,x-r*.4,y-r*.36,x-r*.12,y-r*.62,x+r*.2,y-r*.47,x+r*.37,y-r*.13,x+r*.2,y+1]);
    };
    ear(20,5,4*b.ear,true);
    // The bridge stays straight on the black and polar bears, dipping between brow and snout on brown bears.
    const bridge=(kind==='grizzly'||kind==='kodiak')?15:12;
    shape(2,[-4,10,2,4,9,2,17,2,24,5,29,9,33,bridge,38,bridge+1,42,17,45,19,45,23,42,26,34,27,27,26,24,28,18,31,12,32,12,b.chin*2+31,7,32,3,35,-1,34,-4,30,-8,29,-6,22,-9,23,-7,16]);
    shape(3,[-5,12,3,5,11,3,18,3,24,6,29,10,33,bridge+1,40,17,44,20,42,24,35,25,27,23,21,25,17,29,11,31,7,30,2,33,-2,31,0,27,-5,28,-3,23,-7,23,-4,18]);
    shape(4,[-4,13,3,7,11,5,19,4,24,7,29,12,33,bridge+1,30,18,23,16,18,17,13,21,8,22,7,19,2,24,3,19,-2,20]);
    shape(5,[8,6,14,4,19,5,23,7,25,9,21,8,16,7,12,8,8,10,5,10]);
    shape(b.muzzle,[24,17,28,15,33,bridge+1,38,bridge+2,43,18.5,44,21,42,24,35,25,29,23,25,23,22,21]);
    shape(kind==='blackbear'?9:4,[26,19,31,18,37,18.5,42,20,42,22,37,23,31,22,27,21]);
    shape(kind==='polar'?7:b.muzzle,[27,17.8,31,16,36,16.6,39,18.4,34,18.1,31,18.4]);
    shape(0,[39,16.5,43,16.5,46,18,46,21,44,23,41,22,39,20]);
    dot(kind==='polar'?4:5,42,18);
    line(1,[34,23,39,24,42,23]);line(2,[29,24,33,25,37,25]);
    shape(2,[22,10,25,10,28,12,26,13,23,13,21,12]);line(0,[24,11.5,26,11.5]);dot(7,24,11);
    line(5,[21,9,24,8.5,26,10]);
    line(4,[11,23,15,21,19,18]);line(3,[8,26,12,25,15,22]);dot(2,32,20);
    // Break the neck outline into cheek fur and turn the muzzle under the nose.
    shape(kind==='polar'?5:3,[10,21,16,17,21,16,24,18,21,21,17,23,13,27,14,24,9,28]);
    line(2,[22,23,27,25,34,26,39,25]);
    line(kind==='polar'?6:4,[25,24,29,25,34,25]);
    shape(0,[41,18,44,18,45,19,44,20,42,20]);
    dot(1,34,20);dot(2,32,21);dot(2,36,21);
    line(2,[20,12,22,11,25,11]);
    dot(0,25,12);dot(6,24,11);
    ear(6,5,5.3*b.ear,false);
  }
  function bear(a,t,kind){
    const b=bears[kind];const bob=.9*Math.cos(t*2);
    const farFeet=b.feet-4;
    bearLeg(a,b.rear+8,b.legTop,farFeet,t+Math.PI,true,true,b.legBulk*.87);
    bearLeg(a,b.front+8,b.legTop+1,farFeet,t+1.25,false,true,b.legBulk*.88);
    bearLeg(a,b.rear,b.legTop,b.feet,t,true,false,b.legBulk);
    bearLeg(a,b.front,b.legTop,b.feet,t+Math.PI+1.25,false,false,b.legBulk);
    const body=offset(a,0,bob);
    roundedShape(body,2,b.body);roundedShape(body,3,b.body.map((v,i)=>i%2?v-1:v+.6));
    roundedShape(body,4,b.ribs);roundedShape(body,kind==='polar'?6:5,b.back);
    roundedShape(body,2,b.waist);
    roundedShape(body,3,b.hip);roundedShape(body,4,b.hipLight);
    roundedShape(body,3,b.shoulder);roundedShape(body,kind==='polar'?6:4,b.shoulderLight);
    const hairColor=kind==='polar'?6:kind==='grizzly'?6:5;
    b.fur.forEach(([x,y],i)=>{
      body.line(i%5===0?hairColor:(kind==='grizzly'?5:4),[x,y+2,x+2,y,x+4+(i%2),y-1]);
      if(i%3===0)body.dot(kind==='grizzly'?5:4,x-1,y+3);
    });
    // Guard hairs follow the shoulder and turn down around the haunch.
    // Anchor the clusters to the torso so they travel with its gait.
    b.fur.forEach(([x,y],i)=>{
      const shoulder=x>b.front-18, slope=shoulder?3:2, tone=kind==='polar'?5:4;
      body.line(tone,[x+1,y+5,x-1,y+6,x-2,y+6+slope]);
      if(i%3===1)body.line(kind==='polar'?6:5,[x+2,y+4,x,y+5]);
    });
    const bottom=b.feet-23;
    for(let i=0;i<5;i++){
      const x=b.front-18+i*4,y=bottom-4+Math.sin(i)*2;
      body.poly(2,[x,y-4,x+4,y-5,x+2,y,x,y+1]);
    }
    if(kind==='grizzly'){
      // Scattered frost tips catch the light on the shoulder while the belly stays dark.
      for(const [x,y] of [[91,10],[95,10],[99,11],[86,16],[90,14],[77,23],[80,21],[73,28],[65,30],[61,32],[49,28],[42,27],[36,28],[29,30],[23,33],[89,22],[84,25],[83,29],[55,34],[51,33],[70,31]]){
        body.line(5,[x,y+2,x+2,y,x+4,y]);body.dot(6,x+4,y);
      }
      body.poly(4,[108,23,111,20,115,22,118,25,117,30,112,33,109,39,105,41,108,33,105,35]);
    }
    if(kind==='kodiak'){
      for(const [x,y] of [[61,47],[68,46],[76,43],[80,40],[84,36],[95,29],[91,34],[102,25],[104,31],[28,46],[35,42],[43,43],[22,52]]){
        body.line(3,[x-2,y+4,x,y+1,x+3,y-1]);
      }
      for(const [x,y] of [[54,66],[58,67],[63,68],[69,69],[74,69],[81,70],[87,73],[91,74],[96,75]]){
        body.poly(2,[x,y-1,x+4,y-1,x+2,y+3,x,y+5]);
      }
    }
    bearFace(body,b,kind,t);
  }
  function oxLeg(a,x,y,t,far){
    const lean=Math.sin(t)*5,up=Math.max(0,Math.cos(t))*3;
    const k=x+lean*.5,foot=x+lean,fy=far?78-up:81-up;
    a.poly(far?1:2,[x-4,y,x+5,y,k+3,67,foot+2,fy-5,foot+6,fy-2,foot+6,fy,foot-4,fy,foot-4,fy-5,k-3,68]);
    a.poly(far?2:5,[x-2,y,x+2,y,k+1,66,foot,fy-5,foot-2,fy-5,k-1,68]);
    a.poly(0,[foot-3,fy-5,foot+1,fy-5,foot+6,fy-2,foot+6,fy,foot-4,fy]);if(!far)a.dot(8,foot+4,fy-2);
  }
  function muskox(a,t){
    const {poly:P,line:L,dot:D}=a;
    oxLeg(a,36,51,t+Math.PI,true);oxLeg(a,91,49,t+.7,true);
    oxLeg(a,26,49,t,false);oxLeg(a,83,47,t+Math.PI+.7,false);
    const b=offset(a,0,Math.sin(t*2)*.7);
    roundedShape(b,1,[8,41,14,26,29,17,46,14,60,17,73,14,82,8,95,8,107,15,115,23,117,36,109,53,103,63,96,71,85,74,76,68,66,71,48,67,34,70,19,68,12,62,7,52]);
    roundedShape(b,3,[10,40,15,28,29,19,45,16,59,20,71,18,83,11,96,10,106,16,112,23,109,39,98,51,82,58,70,54,55,55,39,54,28,57,17,58,10,51]);
    roundedShape(b,4,[13,34,23,23,38,18,51,19,63,22,77,18,85,12,97,12,104,17,91,21,78,29,66,33,52,31,41,29,29,32,19,39,12,43]);
    // The light saddle lies over the back of the rich long guard skirt.
    roundedShape(b,5,[22,25,33,20,46,19,59,22,72,23,70,28,64,32,57,34,49,31,43,30,37,28,31,29,25,31]);
    b.poly(6,[30,22,37,20,47,20,57,22,64,23,61,25,52,25,44,23,38,23,33,25]);
    for(let i=0;i<18;i++){
      const x=10+i*4.8,y=33+3*Math.sin(i*1.5),length=29+7*Math.sin(i*.83);
      b.poly(i%3===0?2:3,[x,y+3,x+6,y,x+6,y+length*.60,x+3,y+length-1,x+1,y+length+5,x,y+length-1,x-3,y+length+2,x-1,y+length*.58]);
      b.line(i%4===0?5:4,[x+4,y+1,x+3,y+7,x+2,y+length*.45,x,y+length*.72]);
      if(i%2===0)b.line(2,[x+5,y+length*.5,x+3,y+length*.9]);
    }
    b.poly(2,[80,25,89,16,99,14,109,19,118,30,119,44,113,54,108,63,105,61,100,71,98,66,93,75,92,67,86,72,88,62,83,66,86,53,80,57,85,42]);
    b.poly(3,[84,28,90,19,98,17,106,20,114,29,113,39,106,45,102,55,98,59,99,53,94,60,95,52,90,56,92,46,87,48,90,36]);
    b.poly(4,[85,27,92,19,100,18,107,21,109,25,104,24,97,25,93,30,88,33]);
    b.poly(1,[104,26,114,23,124,27,129,34,129,40,135,45,138,50,134,55,124,57,122,61,117,60,114,65,110,63,105,60,103,51,99,49,101,42]);
    b.poly(3,[106,27,114,25,122,28,127,34,125,40,133,46,136,50,132,53,125,54,118,50,113,48,110,51,106,48,107,41,104,39]);
    b.poly(4,[115,28,120,29,126,34,124,39,129,43,128,46,121,43,118,38,115,36]);
    b.poly(2,[120,44,127,45,134,48,137,50,133,54,126,55,120,51]);
    b.line(4,[125,46,130,47,134,49]);b.line(0,[130,51,133,51]);
    b.line(0,[119,37,121,37]);b.dot(7,120,37);
    // The large fused horn boss sweeps down beside the cheek then up into the ivory tips.
    b.poly(8,[104,25,110,20,118,20,123,24,125,29,123,34,119,36,115,33,113,28,109,27,106,32,103,37,103,43,106,48,111,47,115,42,116,38,118,38,118,44,115,50,110,54,104,54,99,51,96,45,96,39,98,32]);
    b.poly(9,[102,29,109,22,116,22,121,24,123,29,121,33,118,34,116,31,114,26,109,25,105,29,101,36,100,42,102,49,106,51,111,50,115,46,111,52,106,53,101,50,98,45,98,38]);
    b.line(10,[101,34,104,28,110,23,116,23,120,25]);b.line(8,[115,24,118,29,119,32]);
    b.line(10,[106,52,110,52,114,49,116,44,117,39]);
    L(2,[12,38,8,44,8,51,5,56],3);P(1,[6,51,8,50,9,54,7,60,3,62,2,58]);D(4,7,53);
  }
  function foxLeg(a,x,y,t,far){
    const lean=Math.sin(t)*5,lift=Math.max(0,Math.cos(t))*3,foot=x+lean,ground=(far?50:54)-lift;
    a.poly(far?2:3,[x-4,y,x+4,y,x+2+lean*.5,42,foot+1,ground-4,foot+5,ground-2,foot+5,ground,foot-3,ground,foot-4,ground-3,foot-2,ground-6,x-2+lean*.5,43]);
    if(!far){a.line(5,[x+2,y+1,x+lean*.5,41,foot,ground-5]);a.line(2,[foot-2,ground-1,foot+2,ground-1]);}
  }
  function arcticfox(a,t){
    const sway=Math.sin(t)*2;
    const b=offset(a,0,Math.cos(2*t)*.55);
    foxLeg(a,53,31,t+.4,true);foxLeg(a,77,30,t+Math.PI+.5,true);
    // A thick, wind-curved brush, with dusty shadow on the underside.
    roundedShape(b,2,[51,25,44,23,37,25,31,31,24,35,17,34+sway,10,30+sway,5,25+sway,3,23+sway,2,30+sway,4,37+sway,10,43+sway,19,48+sway,29,48+sway,37,45,43,40,49,38,56,34]);
    roundedShape(b,4,[50,26,43,25,37,27,30,33,24,37,16,37+sway,9,32+sway,4,26+sway,4,31+sway,7,38+sway,14,43+sway,21,46+sway,29,46+sway,36,42,43,37,50,35]);
    b.poly(6,[40,27,35,31,30,36,25,39,17,39+sway,10,35+sway,6,31+sway,8,36+sway,14,41+sway,22,43+sway,29,42+sway,35,38,40,32]);
    b.poly(7,[3,24+sway,6,27+sway,11,32+sway,17,35+sway,20,37+sway,13,36+sway,7,32+sway,4,30+sway]);
    foxLeg(a,47,31,t+Math.PI+.4,false);foxLeg(a,72,30,t+.5,false);
    roundedShape(b,3,[39,31,43,23,51,18,62,17,69,19,76,18,81,12,90,10,95,15,96,25,91,31,86,35,79,40,68,41,58,39,49,41,43,37,38,37]);
    roundedShape(b,4,[40,31,45,24,53,20,64,19,72,21,78,18,85,13,91,13,94,18,92,27,85,31,78,35,66,37,56,35,49,38,44,35]);
    roundedShape(b,6,[42,29,47,23,55,20,65,20,72,22,79,18,84,16,84,21,80,28,76,30,68,31,58,30,51,31,44,34]);
    b.poly(7,[45,27,51,22,57,21,64,21,69,23,62,23,56,23,50,25,46,29]);
    b.poly(4,[46,30,50,27,57,27,61,30,61,34,56,37,52,39,49,40,51,36,51,32]);
    b.poly(5,[72,25,78,17,84,15,90,17,91,23,86,27,85,31,81,32,79,36,76,35,73,38,73,33,70,36,71,29]);
    b.poly(7,[75,28,80,22,87,20,91,22,89,26,84,28,81,32,78,31,75,34,76,30]);
    // Compact, rounded ears and a short, pointed winter muzzle distinguish this fox.
    b.poly(3,[80,17,79,10,79,5,82,4,86,8,88,14]);b.poly(5,[81,12,80,7,82,6,85,9,86,13]);
    b.poly(3,[86,14,88,6,91,3,93,4,94,11,93,15]);b.poly(6,[89,12,90,7,92,5,93,7,92,12]);
    b.poly(4,[79,17,83,13,90,12,95,15,97,20,101,22,104,23,103,26,99,27,96,26,91,28,87,29,80,24,77,22]);
    b.poly(6,[81,17,85,14,91,13,94,16,96,20,100,22,102,24,98,24,94,23,89,23,84,25,81,23]);
    b.poly(7,[86,22,89,21,94,21,97,23,101,24,100,26,96,25,92,26,87,27,83,26]);
    b.line(2,[91,17,94,18]);b.line(0,[92,19,94,19]);b.dot(7,92,18);
    b.poly(0,[100,22,103,22,105,23,103,25,101,25]);b.line(2,[97,25,99,26,101,25]);
  }
  Object.assign(colors,{
    formosan:['10171a','142025','1b2a2d','293b3e','3a4b4c','596660','ddd6ae','fff0c8','746858','a69572','d6caaf'],
    bornean:['21191c','302427','413031','533d37','6b4c3e','8d6951','d99b45','ffcd70','8c664b','b78b60','ebc68f'],
    eastbrown:['211d20','362b2a','4d3a35','654c3f','81634e','a18465','c4a882','e4c9a3','755d50','a08b70','d5ba96'],
    brownpanda:['3b2822','714e3e','8f6850','a48971','b8a48d','d0c4a9','e7dbc1','fff2d8','89715b','b2a38b','e8d9c0'],
    brown:['271e1b','3e2e26','543929','755238','916743','a47e54','bf976e','e6ce9c','6d5036','9a7653','d4bd95'],
    moonbear:['10171c','192129','283037','354047','465157','5b6769','cacac0','efead0','685c50','9a8b71','ede5c8'],
    sunbear:['211f26','2a272a','343033','474042','5b5151','77645b','dfac66','f4d08c','877761','b1906a','efc990'],
    slothbear:['1e1a1d','2c2529','3a3134','4c403e','65554c','7c685a','b5a699','e3d9c6','8c7b6b','c9b59b','efdfbe'],
    spectacled:['1d2022','272a2b','363a39','464b47','5b6159','777a65','c1ac7a','e7d5a0','7c705e','aa9472','d9c897'],
    panda:['15181e','232932','333d45','647174','97a39e','bec4b7','dedfd0','f5edd7','475456','85938c','deded0'],
    spirit:['303035','736960','958575','b6a58c','cdbda1','dcceb3','e7dbc1','f5ead0','867463','b6a182','e8d6b4'],
    cinnamon:['332623','59392f','815039','a36643','c58552','d99e65','ddb889','efd6af','806953','bf9470','e5c6a4'],
    glacier:['222d34','34414b','475762','617383','7a8b98','9aa9af','bdc5bf','e0e1ce','627380','929b9c','d7d8ca'],
    himalayan:['382b27','65493e','86624e','a38065','b99a7f','d5b99a','ead0a9','f1dab7','867262','ab9479','e2cbb0'],
    kamchatka:['272222','3b3330','51433a','665343','82664e','9c7f60','bd9e77','e3c99f','615449','94806a','c8b59a'],
    peninsular:['2b2424','47392f','614c3b','836c52','a18c69','b7a684','cebd9c','e9d9b9','6e6552','9d9478','d9c8a6'],
    ussuri:['1d1b1d','302827','433530','5b4438','785c45','90775d','af9372','d2b891','675242','88735b','bca585'],
    himblack:['15191d','202329','2e3238','3d444a','50585d','687072','cdbb9b','f1e1bf','776c5f','a5977f','e6dbc4'],
    lankansloth:['241d20','32282b','453533','59473d','715949','89735b','b6a181','d9c6a6','8c7967','b6a186','d9c7ab'],
    tibetan:['293139','3e4a51','53616a','70828a','88989b','a4b3ae','c8baa1','e2d5b1','756e64','ad9d80','daccad']
  });
  Object.assign(sizes,{
    formosan:[145,89],bornean:[128,81],eastbrown:[153,93],brownpanda:[130,83],
    brown:[153,93],moonbear:[145,89],sunbear:[128,81],slothbear:[152,88],spectacled:[137,85],panda:[130,83],
    spirit:[145,87],cinnamon:[145,87],glacier:[145,87],himalayan:[152,93],kamchatka:[165,98],tibetan:[152,93],peninsular:[165,98],ussuri:[152,93],himblack:[145,89],lankansloth:[151,88]
  });
  // Smaller forest bears have different shoulder profiles, leg lengths, ears and facial proportions.
  const forest={
    moonbear:{
      back:[5,44,10,33,20,22,33,18,48,18,65,20,79,16,88,11,97,12,105,19,108,31,105,46,97,61,89,67,77,65,65,64,51,64,39,66,24,67,12,61,6,55],
      shoulder:[70,30,77,21,87,15,94,13,102,17,106,24,103,33,97,43,93,59,88,67,83,65,77,57,76,45,80,35],
      rump:29,fore:87,leg:51,foot:87,head:[91,12,1.07,1.00],bulk:.96,ear:6.8
    },
    sunbear:{
      back:[5,42,9,31,18,22,31,17,43,16,53,19,64,22,73,19,82,16,90,18,95,25,95,40,90,52,84,59,76,62,65,60,54,59,42,60,31,62,18,61,10,56,6,50],
      shoulder:[59,31,65,24,74,19,83,18,88,21,91,31,88,39,81,47,79,57,75,63,69,60,67,51,68,40],
      rump:24,fore:72,leg:48,foot:79,head:[80,14,.97,.90],bulk:1.02,ear:4.1
    },
    slothbear:{
      back:[4,46,10,34,19,25,33,20,44,20,56,22,66,21,77,15,86,10,95,12,104,20,106,32,104,44,97,59,90,67,80,69,66,66,54,66,43,67,28,69,13,65,7,58],
      shoulder:[68,29,77,17,87,12,96,15,103,21,104,30,99,39,91,52,88,65,83,71,78,68,77,59,73,61,73,50,68,53,72,40,66,44],
      rump:27,fore:84,leg:55,foot:86,head:[91,17,1.22,1.04],bulk:.98,ear:6.0
    },
    spectacled:{
      back:[5,44,9,32,18,24,28,18,40,17,51,19,62,21,74,19,83,15,91,16,98,22,100,34,96,46,88,57,82,64,73,65,60,61,48,61,36,65,24,65,13,59,6,53],
      shoulder:[65,27,72,21,81,18,90,18,96,24,98,33,93,42,85,50,83,60,78,65,73,61,70,53,71,40,75,32],
      rump:27,fore:79,leg:50,foot:83,head:[86,14,1.0,.97],bulk:1.04,ear:5.5
    }
  };
  function mapped(a,x,y,sx,sy){
    const path=p=>p.map((v,i)=>i%2?y+sy*v:x+sx*v);
    return {poly:(c,p)=>a.poly(c,path(p)),line:(c,p,n)=>a.line(c,path(p),n),dot:(c,u,v)=>a.dot(c,x+sx*u,y+sy*v)};
  }
  function forestEar(a,x,y,r,far){
    roundedShape(a,far?1:2,[x-r,y+2,x-r,y-r*.5,x-r*.5,y-r,x+r*.3,y-r,x+r,y-r*.55,x+r,y+2,x+r*.4,y+4]);
    roundedShape(a,far?2:4,[x-r*.74,y+1,x-r*.72,y-r*.45,x-r*.4,y-r*.77,x+r*.25,y-r*.77,x+r*.7,y-r*.35,x+r*.6,y+1,x+r*.18,y+2]);
    if(!far)roundedShape(a,1,[x-r*.4,y+1,x-r*.4,y-r*.3,x-r*.18,y-r*.52,x+r*.2,y-r*.47,x+r*.43,y-r*.1,x+r*.2,y+1]);
  }
  function forestBear(a,t,key){
    const p=forest[key],moon=key==='moonbear',sun=key==='sunbear',sloth=key==='slothbear',andean=key==='spectacled';
    bearLeg(a,p.rump+6,p.leg,p.foot-4,t+Math.PI,true,true,p.bulk*.85);
    bearLeg(a,p.fore+8,p.leg,p.foot-4,t+1.18,false,true,p.bulk*.83);
    bearLeg(a,p.rump,p.leg,p.foot,t,true,false,p.bulk);
    bearLeg(a,p.fore,p.leg,p.foot,t+Math.PI+1.18,false,false,p.bulk);
    const bob=.9*Math.cos(2*t),b=offset(a,0,bob),sh=p.shoulder;
    roundedShape(b,2,p.back);
    const center=key==='sunbear'?[47,39]:[52,41];
    const inset=(pts,sx,sy,dy)=>pts.map((v,i)=>i%2?center[1]+(v-center[1])*sy+dy:center[0]+(v-center[0])*sx);
    roundedShape(b,3,inset(p.back,.985,.92,-1));
    roundedShape(b,4,inset(p.back.slice(0,24).concat([84,39,69,42,48,38,30,39,16,49,8,47]),.94,.90,-1));
    b.poly(3,[12,43,19,30,29,26,38,26,47,31,47,42,40,52,33,61,27,66,21,62,22,53,16,49]);
    b.poly(4,[13,40,20,30,29,25,37,25,42,29,34,28,26,31,19,38,15,44]);
    b.line(5,[18,32,24,27,31,24,37,24]);
    roundedShape(b,3,sh);
    b.line(4,[sh[0]+2,sh[1],sh[2]+2,sh[3],sh[4],sh[5],sh[6],sh[7]],2);
    for(let i=0;i<(sloth?16:9);i++){
      const x=24+i*3.7,y=26+Math.sin(i*.7)*3+(i%3)*2;
      b.line(i%4===0?5:4,[x-2,y+3,x,y+1,x+3,y]);
    }
    if(moon||sloth){
      const base=p.fore+1;
      for(let i=0;i<(sloth?13:9);i++){
        const x=base+i*1.55-12,y=p.leg-13+Math.sin(i*.8)*4,len=sloth?18:14;
        b.poly(i%3===0?2:3,[x,y,x+5,y-4,x+7,y+2,x+1,y+len*.7,x-3,y+len+1,x-1,y+len*.3,x-5,y+len*.75]);
        if(i%2===0)b.line(4,[x+3,y+1,x+1,y+5,x-2,y+len*.72]);
      }
    }
    // A crescent, ochre horseshoe or cream bib folds around the front of the chest.
    if(moon||sun||sloth||andean){
      const bib=offset(b,p.fore-2,p.leg-9);
      bib.poly(moon?6:sun?6:andean?5:6,[0,-1,4,2,9,4,16,0,18,-5,17,3,13,9,9,13,4,9,1,5,-1,2]);
      bib.poly(moon?7:sun?7:andean?6:7,[2,1,6,4,10,5,15,2,14,5,10,9,7,8,4,5]);
    }
    const [hx,hy,sx,sy]=p.head,h=mapped(b,hx,hy,sx,sy);
    forestEar(h,23,4,p.ear*.79,true);
    const tip=sloth?47:sun?43:moon?42:40;
    const chin=sloth?31:sun?29:28;
    roundedShape(h,2,[-6,15,-2,7,6,3,15,2,24,5,29,9,32,14,tip-5,16,tip,19,tip+1,23,tip-2,26,tip-10,27,27,24,21,27,14,chin+3,8,chin+4,4,30,0,31,-4,28,-7,24]);
    roundedShape(h,3,[-5,14,0,7,8,4,16,3,23,6,29,11,31,16,tip-4,18,tip-1,20,tip-2,23,tip-11,25,25,23,19,26,12,30,7,31,2,28,-2,29,-5,24]);
    h.poly(4,[-3,14,1,8,8,5,16,4,23,7,27,10,31,15,26,18,19,15,13,20,9,21,10,18,2,23,3,18,-3,21]);
    if(sloth){
      // A long, shaggy ruff and nearly hairless muzzle.
      for(let i=0;i<7;i++){
        const x=3+i*2.0,y=17+Math.sin(i)*2.1;
        h.poly(i%2?2:3,[x,y,x+5,y-1,x+4,y+7,x-3,y+16,x-2,y+11,x-5,y+13]);
      }
    }
    const noseShade=sloth||sun?6:andean?5:4;
    h.poly(noseShade,[23,17,28,14,32,14,tip-5,16,tip,19,tip,23,tip-6,26,tip-12,25,26,22,22,21]);
    h.poly(sloth?7:sun?9:andean?6:5,[27,17,30,15,34,16,tip-4,18,tip-3,20,tip-9,20,31,19]);
    h.poly(0,[tip-4,16,tip,17,tip+2,19,tip+1,22,tip-2,23,tip-5,20]);h.dot(5,tip,18);
    h.line(1,[tip-12,23,tip-7,24,tip-3,23]);
    if(andean){
      h.line(6,[14,9,18,7,23,8,26,11,25,15,21,17,17,15,15,12,14,9],2);
      h.line(7,[16,9,19,8,23,9]);h.line(6,[19,17,16,20,13,22,9,25,5,25],2);
      h.line(6,[24,9,28,11,30,14]);h.line(5,[15,7,12,8,11,10]);
    }
    h.line(2,[20,10,24,11]);h.line(0,[21,12,24,12]);h.dot(7,22,12);
    forestEar(h,6,5,p.ear,false);
    if(sloth)h.line(4,[1,2,2,1,5,0,7,1,10,2]);
  }
  function panda(a,t){
    // The saddle is confined to the shoulders. The white rump, dark limbs, round ears
    // and tear-shaped eye patch remain visible even in the alternate trophy palette.
    bearLeg(a,33,48,77,t+Math.PI,true,true,1.03);
    bearLeg(a,81,48,77,t+1.12,false,true,1.02);
    bearLeg(a,24,47,81,t,true,false,1.16);
    bearLeg(a,75,47,81,t+Math.PI+1.12,false,false,1.16);
    const b=offset(a,0,Math.cos(t*2)*.78);
    roundedShape(b,3,[6,45,11,32,22,22,35,18,49,18,62,20,73,17,86,15,98,20,105,30,104,43,97,53,89,60,84,66,76,67,65,63,55,62,41,66,26,67,15,61,8,55]);
    roundedShape(b,5,[7,44,13,32,23,23,37,20,51,20,63,23,75,19,85,18,96,22,101,32,98,45,89,52,76,58,62,58,49,60,35,63,21,61,12,54]);
    roundedShape(b,6,[9,39,17,28,30,22,42,20,55,22,66,24,72,24,69,31,59,37,47,48,37,53,22,55,14,51]);
    b.poly(7,[14,33,23,25,36,21,47,21,56,23,59,25,49,25,41,24,33,26,25,30,17,39]);
    roundedShape(b,2,[59,21,70,18,80,15,90,17,97,22,99,30,95,39,86,47,84,58,83,66,76,69,69,65,65,55,66,44,65,37]);
    roundedShape(b,1,[68,22,76,19,84,19,91,22,93,29,90,36,80,45,77,54,75,62,70,59,68,53,69,42,69,35]);
    b.line(3,[65,24,71,20,78,18,84,18],2);
    roundedShape(b,2,[15,49,21,42,29,39,37,43,39,49,35,55,29,61,27,68,21,69,17,65,17,58,13,55]);
    b.line(3,[18,48,22,44,28,42,33,44],2);
    const h=offset(b,82,13);
    forestEar(h,25,4,6,true);
    roundedShape(h,4,[-7,17,-3,9,4,5,13,2,22,3,30,7,34,13,36,18,40,20,44,23,43,27,39,29,32,29,26,32,18,34,12,33,4,30,-3,26]);
    roundedShape(h,6,[-6,17,-2,10,4,6,13,3,22,4,29,8,33,14,34,20,41,22,42,26,37,28,30,27,24,31,16,32,7,29,0,25]);
    h.poly(7,[-1,16,2,10,9,6,18,4,24,6,27,9,20,9,13,11,8,14,4,20,0,22]);
    roundedShape(h,1,[17,14,20,10,25,10,28,13,27,18,23,21,18,23,14,22,14,19]);
    h.line(2,[16,20,18,16,21,13,25,12]);h.line(0,[22,15,25,15]);h.dot(7,23,15);
    h.poly(0,[37,20,41,20,44,22,43,25,40,26,37,24]);h.dot(4,41,21);
    h.line(3,[32,26,36,28,40,27]);h.line(5,[9,27,16,30,21,29]);
    forestEar(h,5,5,7,false);
  }
  function regionalBear(a,t,base,variant){
    bear(a,t,base);
    const b=offset(a,0,Math.sin(2*t)*.65);
    if(variant==='tibetan'){
      // Tibetan blue bears have a warm, contrasting collar behind the head.
      b.poly(6,[100,20,105,21,111,25,113,28,108,32,105,38,102,43,99,42,100,36,97,38,99,31,97,32,100,26]);
      b.line(7,[103,23,106,25,109,27]);b.line(5,[102,33,100,38]);
    }else if(variant==='spirit'||variant==='glacier'||variant==='cinnamon'){
      const shade=variant==='spirit'?6:5;
      for(const [x,y] of [[19,32],[26,28],[33,26],[48,26],[57,27],[61,28],[78,25],[87,23]]){
        b.line(shade,[x-1,y+2,x+2,y,x+5,y]);
      }
      if(variant==='glacier')b.line(6,[91,23,95,22,99,23]);
    }else if(variant==='himalayan'){
      b.poly(6,[87,22,91,17,96,15,100,16,96,16,91,19,88,24]);
      for(const [x,y] of [[25,29],[36,27],[43,28],[66,30],[78,24],[84,18]])b.line(6,[x,y+1,x+3,y]);
    }else if(variant==='kamchatka'){
      b.poly(2,[80,31,89,23,97,19,102,19,97,22,91,27,86,32,84,38,80,41]);
      b.line(4,[95,18,101,15,107,15]);b.line(3,[69,40,76,37,80,33]);
    }else if(variant==='peninsular'){
      // Pale guard hairs running across the broad coastal shoulder.
      for(const [x,y] of [[83,24],[88,20],[92,18],[96,16],[100,15],[105,14],[111,15],[87,26],[93,23],[98,21],[103,19]]){
        b.line(5,[x-2,y+2,x,y,x+3,y-1]);
      }
    }else if(variant==='ussuri'){
      b.poly(2,[86,27,92,24,98,24,97,29,93,34,87,39,88,33,84,36]);
      b.line(4,[91,21,96,18,102,19]);
    }else if(variant==='eastbrown'){
      b.line(5,[82,25,87,21,92,18,98,17]);b.line(4,[75,32,80,29,83,26]);
      b.line(4,[38,28,46,27,54,29]);b.line(2,[18,55,23,52,28,50]);
    }else if(variant==='brown'){
      b.line(4,[17,39,21,34,26,32]);b.line(4,[54,35,60,34,66,31]);
    }
  }

  function regionalForest(a,t,key){
    if(key==='himblack'){
      forestBear(a,t,'moonbear');
      const b=offset(a,0,.9*Math.cos(2*t));
      for(const [x,y] of [[78,40],[81,43],[84,38],[88,37],[91,40],[76,42]]){
        b.poly(3,[x,y+1,x+4,y-4,x+4,y,x-1,y+9,x,y+4,x-3,y+6]);
        b.line(4,[x+3,y-1,x+1,y+3]);
      }
    }else{
      forestBear(a,t,'slothbear');
      const h=mapped(a,91,17+.9*Math.cos(2*t),1.22,1.04);
      h.poly(5,[19,20,24,17,30,16,32,17,28,18,24,20,20,23]);
      h.line(4,[1,17,4,15,9,14]);h.line(4,[9,19,12,17,15,16]);
    }
  }
  const artists={
    brownpanda:panda,
    formosan:(a,t)=>forestBear(a,t,'moonbear'),
    bornean:(a,t)=>forestBear(a,t,'sunbear'),
    eastbrown:(a,t)=>regionalBear(a,t,'grizzly','eastbrown'),
    blackbear:(a,t)=>bear(a,t,'blackbear'),grizzly:(a,t)=>bear(a,t,'grizzly'),
    kodiak:(a,t)=>bear(a,t,'kodiak'),polar:(a,t)=>bear(a,t,'polar'),muskox,arcticfox,panda,
    moonbear:(a,t)=>forestBear(a,t,'moonbear'),sunbear:(a,t)=>forestBear(a,t,'sunbear'),
    slothbear:(a,t)=>forestBear(a,t,'slothbear'),spectacled:(a,t)=>forestBear(a,t,'spectacled'),
    brown:(a,t)=>regionalBear(a,t,'grizzly','brown'),spirit:(a,t)=>regionalBear(a,t,'blackbear','spirit'),
    cinnamon:(a,t)=>regionalBear(a,t,'blackbear','cinnamon'),glacier:(a,t)=>regionalBear(a,t,'blackbear','glacier'),
    himalayan:(a,t)=>regionalBear(a,t,'grizzly','himalayan'),kamchatka:(a,t)=>regionalBear(a,t,'kodiak','kamchatka'),
    tibetan:(a,t)=>regionalBear(a,t,'grizzly','tibetan'),
    peninsular:(a,t)=>regionalBear(a,t,'kodiak','peninsular'),ussuri:(a,t)=>regionalBear(a,t,'grizzly','ussuri'),
    himblack:(a,t)=>regionalForest(a,t,'himblack'),lankansloth:(a,t)=>regionalForest(a,t,'lankansloth')
  };
  window.TimberNorthArt=Object.freeze({sizes,colors,artists});
})();
