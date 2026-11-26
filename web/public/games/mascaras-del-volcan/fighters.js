/* Original character illustrations and articulated performance for Máscara de Fuego. */
(() => {
  'use strict';

  const ink = '#211727', crease = '#6c383b', ivory = '#fff0cd';
  const roster = [
    {base:'#078f7c',light:'#68e3b0',dark:'#094f52',trim:'#ffce61',accent:'#fff1ba',skin:'#bf7251',sun:'#e49a67',shade:'#8c4a41',width:1, face:0},
    {base:'#c45d2e',light:'#ffad58',dark:'#703733',trim:'#ead396',accent:'#fff0ca',skin:'#a45b41',sun:'#db8c59',shade:'#74413b',width:1.04,face:1},
    {base:'#704298',light:'#bc86df',dark:'#392454',trim:'#8ae3db',accent:'#f3e5e3',skin:'#ac6854',sun:'#d89670',shade:'#714451',width:.94,face:2},
    {base:'#a52f3f',light:'#ec6251',dark:'#482836',trim:'#f6b756',accent:'#ffe1a0',skin:'#995943',sun:'#c7825c',shade:'#613843',width:1.15,face:3},
    {base:'#ef657c',light:'#ffadb0',dark:'#963956',trim:'#64e2d4',accent:'#ffead1',skin:'#b4745d',sun:'#de9e77',shade:'#764756',width:.89,face:4},
    {base:'#2854b6',light:'#729ae6',dark:'#213c71',trim:'#becfda',accent:'#f1f5ed',skin:'#b37653',sun:'#e2a374',shade:'#795044',width:1.03,face:5},
    {base:'#e3a22f',light:'#ffe178',dark:'#59346b',trim:'#965ac5',accent:'#fff0bf',skin:'#b27656',sun:'#e4a674',shade:'#784851',width:.97,face:6},
    {base:'#4e4759',light:'#918499',dark:'#302a3b',trim:'#d8ad83',accent:'#fff0c3',skin:'#88604e',sun:'#b88366',shade:'#624250',width:1.25,face:7}
  ];
  const shapes = new Map();
  const clamp = (n,a,b) => Math.max(a,Math.min(n,b));
  function path(c, d, fill, stroke = null, width = 1) {
    let p = shapes.get(d);
    if (!p) { p = new Path2D(d); shapes.set(d,p); }
    if (fill) { c.fillStyle=fill; c.fill(p); }
    if (stroke) { c.strokeStyle=stroke; c.lineWidth=width; c.stroke(p); }
  }
  function line(c,d,color,width=1) { path(c,d,null,color,width); }
  function ellipse(c,x,y,rx,ry,color) {
    c.fillStyle=color; c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fill();
  }
  function makePose(p,t,u,id) {
    const beat=Math.sin(t*7), step=Math.sin(t*10), pulse=Math.sin(Math.PI*u), extend=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.46);
    let body=[0,-39,0], head=0;
    // Elbows and hands are offsets from the shoulder, knees and ankles from world origin.
    let back=[-12,12,-5,2],front=[16,11,23,-4];
    let legs=[[-15,-22,-23,-2],[17,-21,21,-2]];
    switch(p) {
      case 'walk':
        body=[step*.8,-39-Math.abs(step)*2,.06];head=.025*step;
        back=[-12+step*4,14,-5+step*11,4];front=[13-step*4,13,20-step*10,-2];
        legs=[[-12-step*8,-22-Math.max(0,step)*7,-13-step*17,-2-Math.max(0,step)*6],[14+step*8,-22-Math.max(0,-step)*7,13+step*17,-2-Math.max(0,-step)*6]];break;
      case 'strike':
        body=[1+2*extend,-39,.04+.17*extend];head=-.08*extend;
        front=[15+8*extend,12-14*extend,23+24*extend,-4-5*extend];
        back=[-13,13,-4,-5];legs=[[-16,-22,-27,-2],[17,-20,23,-2]];break;
      case 'throw': {
        const load=Math.sin(Math.PI*Math.min(1,u/.41));
        const lift=Math.sin(Math.PI*clamp((u-.19)/.69,0,1));
        const toss=Math.sin(Math.PI*clamp((u-.58)/.42,0,1));
        body=[2+3*load-2*lift,-38+9*load-3*lift,.24+.24*load-.58*lift+.65*toss];
        head=-.09-.18*load+.10*lift;
        front=[16+5*load-11*lift+8*toss,8+4*load-23*lift,22+9*load-14*lift+10*toss,1+5*load-29*lift+3*toss];
        back=[-5+12*load+5*lift,12-17*lift,7+19*load+5*lift+12*toss,3+4*load-25*lift];
        legs=[[-16-load*3,-21+4*load,-23,-2],[19+4*load,-18+3*load,24+toss*4,-2]];break;
      }
      case 'dive': {
        const sail=Math.sin(Math.PI*u);
        body=[2,-38,.61+.36*sail];head=-.33;
        back=[-12-5*sail,12,-17-6*sail,10+10*sail];front=[13+6*sail,-9,22+13*sail,-20];
        legs=[[-5-6*sail,-25,-21-11*sail,-24-6*sail],[10,-21-4*sail,-2-6*sail,-9-6*sail]];break;
      }
      case 'spring': {
        const coil=Math.sin(Math.PI*Math.min(1,u/.32)), fly=clamp((u-.19)/.56,0,1), tuck=Math.sin(Math.PI*fly);
        body=[2*coil,-37+11*coil,.20+.33*coil+.67*fly];head=-.30*fly;
        back=[-11-4*tuck,11-17*fly,-15-8*tuck,4-25*fly];front=[12+6*fly,12-23*fly,20+12*fly,2-26*fly];
        legs=[[-17-8*tuck,-18-8*tuck,-22-9*fly,-2-24*fly],[19+5*tuck,-18-7*tuck,21-13*fly,-2-9*fly]];
        break;
      }
      case 'counter': {
        const slip=Math.sin(Math.PI*clamp(u/.62,0,1)), hook=Math.sin(Math.PI*clamp((u-.40)/.60,0,1));
        body=[-7*slip+3*hook,-37+7*slip,-.46*slip+.40*hook]; head=.27*slip-.13*hook;
        back=[-16-4*slip,10,-11-8*slip,-6-7*slip];front=[12+9*hook,8-13*hook,13+15*hook,-13+8*hook];
        legs=[[-17-5*slip,-18,-25-4*slip,-2],[15-5*slip,-20,19+9*hook,-2-4*slip]];break;
      }
      case 'charge': {
        const wind=clamp(u*1.6,0,1), shiver=Math.sin(t*37)*wind;
        body=[-4*wind+shiver*.48,-37+8*wind,-.10-.19*wind];head=.18+.13*wind;
        back=[-14-8*wind,10+shiver,-16-11*wind,0+shiver];front=[15+2*wind,8,19-5*wind,-6-5*wind];
        legs=[[-15-8*wind,-20,-24-4*wind,-2],[16+3*wind,-20+3*wind,21+4*wind,-2]];break;
      }
      case 'combo': {
        const a=Math.sin(Math.PI*clamp(u/.36,0,1)), b=Math.sin(Math.PI*clamp((u-.21)/.39,0,1)), fin=Math.sin(Math.PI*clamp((u-.50)/.50,0,1));
        body=[2*a-2*b+4*fin,-39+2*b-2*fin,.18*a-.17*b+.36*fin];head=-.12*fin;
        back=[-10+23*b,11-14*b,0+36*b,-4-2*b];front=[14+11*a+4*fin,10-9*a-21*fin,20+23*a+9*fin,-4-4*a-26*fin];
        legs=[[-16,-21,-24-4*fin,-2],[16+4*fin,-20,22+4*fin,-2]];break;
      }
      case 'guard':
        body=[-2,-36+beat*.4,-.08];head=.15;
        back=[-9,10,1,-12];front=[10,9,9,-15];legs=[[-17,-20,-23,-2],[16,-19,19,-2]];break;
      case 'hit':
        body=[-4,-38,-.24*pulse-.1];head=-.14;
        back=[-14,10,-21,2];front=[12,15,22,4];legs=[[-17,-19,-23,-2],[17,-24,23,-3]];break;
      case 'down':
        body=[0,-37,-.06];head=-.03;back=[-12,10,-16,18];front=[16,9,26,13];
        legs=[[-13,-21,-13,-2],[15,-25,21,-6]];break;
      case 'pin':
        body=[-6,-16+beat*.8,1.0+beat*.035];head=-.34+.04*beat;
        back=[2,12,10,22];front=[12,-1,24,13+beat];legs=[[-23,-6,-34,-3],[12,-9,0,-3]];break;
      case 'win':
        body=[0,-39-Math.max(0,beat),-.04];head=-.1;
        back=[-14,-9,-21,-24+beat*2];front=[13,-14,15,-31+beat*2];
        legs=[[-14,-21,-21,-2],[14,-22,21,-2]];break;
      default:
        body=[0,-39+beat*.95,.025*beat];
        back=[-12,13+beat,-7,1+beat*1.2];front=[14,11-beat,21,-4-beat*1.2];
    }
    if(p==='idle'||p==='walk'){
      if(id===4) {body[1]+=2+Math.sin(t*9)*1.6;body[2]+=.12;front[3]-=4;back[2]-=4;}
      if(id===5) {body[2]-=.1;back[0]-=3;front[0]-=2;front[2]-=5;front[3]-=5;}
      if(id===6) {body[1]-=1;body[2]-=.09;front[3]-=5;back[2]-=6;back[3]+=2;}
      if(id===7) {body[1]+=2;body[2]+=.15;front[0]+=3;front[3]+=9;back[2]-=4;back[3]+=9;legs[0][2]-=4;legs[1][2]+=5;}
    }
    if(p==='win') {
      if(id===1){back=[-15,9,-8,2];front=[17,-10,25,-24+beat*2];head=-.18;}
      if(id===2||id===4){back=[-15,-5,-32,-13-beat];front=[17,-8,29,-13+beat];body[2]=-.08;}
      if(id===5){back=[-11,12,-2,16];front=[12,-9,0,-13+beat];head=.05;}
      if(id===6){back=[-14,12,-5,16];front=[8,-17,10,-35+beat];body[2]=-.11;}
      if(id===7){back=[-18,3,-15,-11];front=[20,4,18,-11];body[2]=.12;head=.02;}
    }
    return {body,head,back,front,legs};
  }
  function localSegment(c,ax,ay,bx,by,fn) {
    const dx=bx-ax,dy=by-ay,l=Math.max(.01,Math.hypot(dx,dy));
    c.save();c.translate(ax,ay);c.rotate(Math.atan2(-dx,dy));fn(l);c.restore();
  }
  function muscle(c,ax,ay,bx,by,r,s,colors) {
    localSegment(c,ax,ay,bx,by,l=>{
      c.beginPath(); c.moveTo(-r,-1.5);
      c.bezierCurveTo(-r*1.5,l*.13,-s*1.45,l*.66,-s,l);
      c.quadraticCurveTo(0,l+s*.68,s,l);
      c.bezierCurveTo(s*1.34,l*.72,r*1.52,l*.18,r,-1.5);
      c.quadraticCurveTo(0,-r*1.18,-r,-1.5);
      c.fillStyle=colors[0];c.fill();c.strokeStyle=ink;c.lineWidth=2.1;c.stroke();
      c.beginPath();c.moveTo(r*.48,-1.3);c.bezierCurveTo(r*1.45,l*.20,s*1.22,l*.68,s*.75,l);
      c.quadraticCurveTo(0,l+s*.56,-s*.63,l);c.bezierCurveTo(s*.20,l*.74,r*.9,l*.25,r*.48,-1.3);
      c.fillStyle=colors[1];c.fill();
      c.beginPath();c.moveTo(-r*.8,l*.13);c.bezierCurveTo(-r*1.21,l*.33,-s*1.03,l*.55,-s*.86,l*.67);
      c.strokeStyle=colors[2];c.lineWidth=1.4;c.stroke();
    });
  }
  function drawnLeg(c,s,isNear,hip,knee,foot) {
    const fitted=[2,3,4,5,6,7].includes(s.face), sk=[isNear?s.skin:s.shade,s.shade,isNear?s.sun:s.skin];
    const suit=[isNear?s.base:s.dark,s.dark,isNear?s.light:s.base];
    muscle(c,hip[0],hip[1],knee[0],knee[1],(s.face===7?9.9:s.face===3?8.1:s.face===4?6:7.1),s.face===7?6.3:5.3,fitted?suit:sk);
    const ankle=[foot[0],foot[1]-4.4];
    muscle(c,knee[0],knee[1],ankle[0],ankle[1],s.face===7?6.6:5.4,s.face===7?4.4:3.8,suit);
    if(s.face===5||s.face===6||s.face===7) localSegment(c,hip[0],hip[1],knee[0],knee[1],len=>{
      c.save();c.scale(1,len/22);
      if(s.face===5){
        path(c,'M-5 4 L0 5 -1 11 -5 10Z',s.dark,ink,.7);
        line(c,'M-4.5 5 L-.6 6 M-4 7 L-.8 8',s.trim,.8);
      } else if(s.face===6){
        path(c,'M0 1 L5 2 1 8 4 8 -3 17 -1 11 -4 11Z',s.dark);
      } else {
        path(c,'M-6 2 L4 1 7 4 4 9 2 7 -1 10 -3 7 -6 10Z',s.trim,ink,.8);
      }
      c.restore();
    });
    localSegment(c,knee[0],knee[1],ankle[0],ankle[1],len=>{
      c.save();c.scale(1,len/19);
      path(c,'M-5 -1 Q-1 -5 4 -2 L5 3 Q1 6 -5 4Z',s.dark,ink,1.2);
      path(c,'M-4 -1 Q-1 -3 4 -1 L3.5 1 Q0 1 -4 3Z',s.trim);
      if(s.face===4) {
        ellipse(c,-1,8,1.5,1.7,s.trim);ellipse(c,.8,12,.9,1.1,s.accent);
      } else if(s.face===5) {
        line(c,'M-3.8 6 L3.6 9 M-3.8 10 L3.2 13',s.trim,1.25);
      } else if(s.face===7) {
        path(c,'M-3 5 L3 5 4 9 2 10 1 8 -1 12 -1 9 -3 10Z',s.trim);
      } else path(c,'M-2 6 L1 5 1 9 3 10 -1 15 0 11 -2 11Z',s.trim);
      line(c,'M-3 7 L-3 14',s.light,.8);c.restore();
    });
    c.save();c.translate(foot[0],foot[1]);
    path(c,'M-4 -6 Q0 -4 4 -6 L5 -4 8 -3.5 Q11 -3 11 -1 L10 1.5 -5 1.5 Q-6 -.5 -4 -6Z',s.dark,ink,1.6);
    path(c,'M2 -3 Q7 -3.8 9 -1.8 L8 -.6 2 -.7Z',s.light);
    line(c,'M-4 .3 L9 .3',s.trim,1);c.restore();
  }
  function fist(c,x,y,rotation,s,near) {
    c.save();c.translate(x,y);c.rotate(rotation);
    path(c,'M-5 1 L-4 -4 -2 -6 4 -6 7 -4 7 0 4 3 0 4 -4 3Z',near?s.skin:s.shade,ink,1.7);
    path(c,'M-2 -5 L4 -5 6 -3 4 -2 -2 -3Z',s.sun);
    line(c,'M0 -5 L0 -3 M2.8 -4.6 L3 -2.6 M-3 .5 L-.6 -1 3 .1',crease,.8);
    c.restore();
  }
  function arm(c,s,x,y,pos,near,open=false) {
    let ex=x+pos[0],ey=y+pos[1],wx=x+pos[2],wy=y+pos[3];
    const sk=[near?s.skin:s.shade,s.shade,near?s.sun:s.skin];
    const bulk=s.face===7?1.24:s.face===4?.87:1;
    muscle(c,x,y,ex,ey,6.1*bulk,4.8*bulk,sk);
    muscle(c,ex,ey,wx,wy,4.7*bulk,3.9*bulk,sk);
    if(s.face===5||s.face===7) {
      c.save();c.translate(ex,ey);ellipse(c,0,0,5.5*bulk,4.7*bulk,s.dark);
      line(c,'M-3.3 -1.3 Q-1 -3.7 2 -2.4',s.trim,1.1);c.restore();
    }
    localSegment(c,ex,ey,wx,wy,l=>{
      c.save();c.translate(0,l);path(c,'M-4.4 -8 Q0 -6 4.6 -8 L4.1 -1 Q0 1 -4.4 -1Z',near?s.base:s.dark,ink,1.25);
      line(c,'M-3.8 -6 Q0 -4 3.8 -6 M-3.8 -3 Q0 -1 3.8 -3',s.trim,1);c.restore();
    });
    const a=Math.atan2(wy-ey,wx-ex);
    if(open) {
      c.save();c.translate(wx,wy);c.rotate(a);
      path(c,'M-3 -3 L1 -4 5 -7 Q6 -7 6 -5 L4 -2 9 -4 Q11 -4 10 -2 L6 0 10 -.5 Q12 0 11 1 L6 3 3 4 -2 4 -4 1Z',near?s.skin:s.shade,ink,1.35);
      line(c,'M0 -1 Q2 -2 4 -2 M4 1 L8 -1',s.sun,1);c.restore();
    } else fist(c,wx,wy,a+.20,s,near);
  }
  function insignia(c,s,x,y,scale) {
    c.save();c.translate(x,y);c.scale(scale,scale);
    if(s.face===0) path(c,'M-1 -8 L7 -8 2 -1 7 -2 -4 9 -1 2 -6 3Z',s.trim,ink,1);
    if(s.face===1) path(c,'M-8 -7 L-1 -3 6 -8 5 0 0 7 -4 4 -7 -1Z',s.trim,ink,1);
    if(s.face===2) path(c,'M-7 6 Q-7 -5 8 -8 Q5 0 1 1 L4 0 Q1 6 -7 6Z',s.trim,ink,1);
    if(s.face===3) path(c,'M-8 5 L-3 -4 0 -2 3 -7 9 5 2 2 0 4 -2 1Z',s.trim,ink,1);
    c.restore();
  }
  function torso(c,s) {
    const torsoShape='M-10 -35 Q-17 -37 -20 -31 Q-23 -25 -17 -19 Q-14 -15 -12 -8 L-12 -2 Q-5 4 8 2 L13 -5 Q11 -12 17 -18 Q23 -24 19 -32 Q16 -37 9 -35 L5 -38 -6 -39Z';
    path(c,torsoShape,s.skin,ink,2.5);
    path(c,'M-18 -30 Q-21 -21 -14 -17 L-10 -6 -7 -8 -9 -15 -6 -18 Q-15 -18 -16 -24Z',s.shade);
    path(c,'M17 -32 Q22 -28 16 -18 Q10 -13 12 -7 L9 0 5 1 8 -12 12 -17 Q10 -17 9 -18 Q16 -21 17 -32Z',s.shade);
    path(c,'M-15 -32 Q-10 -35 -4 -32 L-4 -30 Q-10 -31 -15 -27Z M1 -32 Q8 -36 14 -31 Q7 -32 1 -28Z',s.sun);
    line(c,'M-15 -23 Q-9 -19 -2 -21 Q0 -24 0 -27 M0 -21 Q8 -18 14 -23',crease,1.3);
    line(c,'M-8 -16 Q-4 -14 -1 -16 M2 -16 Q5 -14 8 -17 M-6 -11 Q-3 -10 -1 -11 M2 -11 L6 -12',crease,.85);
    if(s.face===0){
      path(c,'M-16 -35 L-8 -36 Q-3 -24 12 -12 L10 -8 Q-3 -16 -16 -35Z',s.dark,ink,1.2);
      path(c,'M-14 -34 L-11 -35 Q-3 -22 11 -11 L10 -10 Q-4 -19 -14 -34Z',s.trim);
    } else if(s.face===1){
      path(c,'M-9 -30 L-5 -28 -2 -30 1 -27 5 -31 7 -29 11 -31 6 -24 3 -25 1 -22 -1 -25 -3 -23 -5 -26Z',s.shade);
      line(c,'M-15 -27 L-12 -24 M-17 -25 L-14 -22',s.trim,1.1);
    } else if(s.face===2){
      path(c,'M-15 -34 L-10 -36 Q-10 -27 0 -26 Q12 -28 13 -35 L17 -33 Q13 -23 16 -19 Q11 -10 12 -4 L8 1 -11 .6 -12 -8 -15 -17 Q-10 -23 -15 -34Z',s.base,ink,1.3);
      path(c,'M-12 -24 Q-3 -17 10 -23 Q4 -16 1 -15 L4 -16 -5 -9 -3 -13 -9 -11 -5 -16 -10 -15Z',s.light);
      line(c,'M-13 -32 Q-11 -23 -5 -22 M13 -32 Q12 -28 8 -26',s.trim,1.4);
    } else if(s.face===4){
      path(c,'M-14 -34 L-9 -36 Q-4 -29 1 -29 Q8 -30 13 -35 L17 -32 Q15 -19 12 -14 L10 -4 -11 -2 -13 -12 -16 -21Z',s.base,ink,1.4);
      path(c,'M-14 -27 Q-7 -18 0 -18 Q6 -19 14 -25 L12 -18 Q4 -12 -1 -11 Q-6 -13 -12 -18Z',s.dark);
      path(c,'M-12 -28 Q-4 -20 .5 -21 Q6 -21 13 -27 Q8 -18 .5 -17 Q-5 -18 -12 -25Z',s.trim);
      ellipse(c,-4,-10,1.8,1.6,s.light);ellipse(c,1,-8,1.1,1.2,s.light);
      line(c,'M-12 -33 Q-6 -24 0 -25 Q7 -25 14 -32',s.accent,.9);
    } else if(s.face===5){
      path(c,'M-15 -34 L-9 -36 -6 -24 7 -24 11 -36 16 -33 13 -20 12 -3 -12 -1 -14 -21Z',s.base,ink,1.35);
      path(c,'M-13 -33 L-10 -34 -7 -23 -10 -23Z M11 -34 L14 -33 11 -23 8 -23Z',s.trim);
      path(c,'M-8 -22 L8 -22 7 -12 -.5 -9 -7 -12Z',s.dark,ink,1);
      path(c,'M-4 -19 L4 -19 3 -16 -.5 -14.7 -4 -16Z',s.light);
      ellipse(c,-8.5,-22.7,1.45,1.45,s.accent);ellipse(c,9,-23,1.45,1.45,s.accent);
      line(c,'M-11 -7 Q-6 -6 -5 -10 M10 -9 L8 -6',s.trim,1);
    } else if(s.face===6){
      path(c,'M-16 -34 L-10 -35 Q-4 -30 1 -29 L12 -35 17 -31 Q11 -24 14 -18 L11 -10 -10 -9 -14 -18 Q-10 -25 -16 -34Z',s.dark,ink,1.45);
      path(c,'M-11 -32 L-.5 -28 8 -32 4 -26 10 -27 -1 -16 1 -23 -4 -23 -9 -27Z',s.base);
      path(c,'M-7 -31 L-1 -28 1 -28 -1 -25Z',s.accent);
      path(c,'M-10 -9 Q-.3 -7 11 -11 L11 -5 Q0 -2 -11 -5Z',s.base,ink,.9);
      line(c,'M-13 -29 L-10 -24 M11 -29 L13 -31',s.trim,1.6);
    } else if(s.face===7){
      path(c,'M-19 -32 L-15 -39 -10 -34 -4 -36 2 -34 8 -38 14 -34 18 -36 20 -31 17 -20 14 -22 11 -17 6 -19 1 -14 -2 -18 -6 -15 -8 -19 -13 -19 -14 -23 -18 -22Z',s.dark,ink,1.7);
      path(c,'M-15 -34 L-13 -28 -9 -31 -8 -26 -5 -29 -4 -24 -1 -28 2 -25 7 -30 7 -26 13 -32 12 -26 17 -32 14 -22 11 -24 8 -20 5 -21 1 -17 -2 -20 -6 -17 -8 -21 -13 -21Z',s.base);
      line(c,'M-14 -32 L-12 -27 M-8 -32 L-7 -28 M-2 -32 L-1 -29 M6 -33 L4 -29 M13 -33 L11 -28',s.light,1.2);
      path(c,'M-13 -18 L-8 -17 Q-1 -9 12 -10 L11 -5 Q-2 -4 -13 -18Z',s.trim,ink,1);
    } else {
      path(c,'M-17 -34 L-10 -36 Q-10 -27 -2 -26 Q7 -25 11 -35 L16 -33 Q12 -24 17 -20 L13 -11 12 -3 7 1 -11 0 -13 -8 -15 -17 Q-10 -24 -17 -34Z',s.dark,ink,1.3);
      path(c,'M-10 -18 L-5 -23 -1 -18 4 -22 6 -18 11 -21 7 -13 3 -14 0 -8 -2 -15 -5 -13Z',s.light);
      line(c,'M-11 -34 Q-9 -25 -4 -25 M12 -33 Q10 -28 7 -26',s.trim,1.35);
    }
    path(c,'M-12 -4 Q-2 -.7 12 -5 L13 0 10 7 4 8 0 5 -6 9 -13 5 -14 -.5Z',s.base,ink,1.7);
    path(c,'M-13 -3 Q-1 1 12 -4 L12 -.5 Q-1 4 -13 0Z',s.trim,ink,.85);
    path(c,'M-2 -1.9 L4 -2 5 1.6 2 4 -2 2Z',s.accent,ink,.8);
    line(c,'M-12 4.5 L-7 6 M5 6 L10 3',s.light,1.45);
  }
  function mask(c,s,time=0,phase=0) {
    const b=s.base,h=s.light,d=s.dark,g=s.trim,cream=s.accent;
    // Neck, knots, and seams sit behind the fitted leather shell.
    path(c,'M-7 5 L7 5 8 14 Q4 18 -4 15 L-8 12Z',s.skin,ink,1.4);
    path(c,'M-7 7 L7 8 7 12 Q2 14 -4 12Z',s.shade);
    path(c,'M-11 -3 Q-17 -4 -18 0 Q-14 -1 -13 2 L-19 6 -22 6 Q-17 11 -11 5Z',d,ink,1.4);
    if(s.face===1){
      path(c,'M-11 -8 L-16 -23 -4 -17 6 -18 13 -25 13 -10Z',b,ink,1.9);
      path(c,'M-13 -20 L-8 -16 -11 -11Z M10 -17 L12 -21 12 -14Z',g);
    } else if(s.face===2){
      path(c,'M-10 -11 Q-17 -16 -18 -23 Q-11 -19 -7 -16 Q-10 -21 -9 -25 Q-1 -19 2 -13Z',h,ink,1.6);
      line(c,'M-15 -20 L-9 -14 M-8 -21 L-4 -15',g,.8);
    } else if(s.face===3){
      path(c,'M-12 -11 L-17 -21 -9 -19 -5 -16 0 -22 3 -16 11 -21 12 -13Z',d,ink,1.7);
      line(c,'M-15 -19 L-10 -15 M1 -20 L2 -16 M10 -19 L9 -16',g,1);
    }
    if(s.face===4) {
      // Six external gills open and close with the bounce of the mask.
      for(const side of [-1,1]) {
        c.save();c.translate(side<0?-9:10,-7);c.scale(side,1);c.rotate(Math.sin(time*7+.8*side)*.065);
        path(c,'M0 -4 Q4 -11 10 -15 L9 -11 14 -13 11 -9 13 -9 6 -4 2 -1 Q9 -5 15 -4 L13 -2 17 -2 14 .5 15 1.5 7 2 2 3 Q9 4 12 8 L9 7 10 10 6 8 2 8 -1 4Z',s.base,ink,1.4);
        line(c,'M1 -3 L9 -10 M1 1 L12 -2 M1 4 L7 7',s.trim,1.3);c.restore();
      }
    } else if(s.face===5){
      path(c,'M-15 -13 Q-14 -20 -9 -21 L5 -22 Q10 -21 12 -17 L9 -12 0 -12 -2 -15 -5 -12Z',s.dark,ink,1.4);
    } else if(s.face===6){
      c.save();c.translate(-10,-13);c.rotate(Math.sin(time*6)*.09);
      path(c,'M1 -2 Q-5 -11 -12 -7 Q-17 -4 -17 2 Q-16 11 -24 14 Q-17 16 -12 10 Q-12 13 -15 15 Q-5 13 -6 4 Q-6 1 -3 2Z',s.dark,ink,1.6);
      line(c,'M-3 -4 Q-11 -9 -13 -.5 T-16 9',s.trim,1.7);c.restore();
    } else if(s.face===7){
      path(c,'M-11 -14 Q-22 -18 -22 -7 L-20 -4 -19 2 -14 5 -9 -2Z M10 -13 Q19 -18 20 -13 L19 -7 16 -3 13 0Z',s.dark,ink,1.6);
      path(c,'M-19 -11 Q-14 -14 -11 -10 L-15 -3 -18 -5Z M15 -12 L18 -13 16 -8Z',s.base);
    }
    path(c,'M-13 -7 Q-14 -15 -8 -19 Q-1 -23 7 -19 Q13 -16 13 -10 L14 -4 15 0 13 2 12 8 Q9 13 4 13 L-4 10 Q-10 7 -11 3 L-13 1Z',b,ink,2.1);
    path(c,'M-12 -11 Q-12 -17 -6 -18 L-7 -12 -5 -6 -8 -2 -6 4 0 10 -3 10 Q-10 6 -10 2 L-12 0Z',d);
    path(c,'M5 -17 Q9 -17 11 -13 L11 -9 Q8 -12 4 -13Z',h);
    if(s.face===0){
      path(c,'M-12 -13 L-5 -10 -9 -14 -7 -18 3 -8 0 -7 4 -3 -1 -2 -8 -6 -4 -6Z',g);
      path(c,'M13 -13 L9 -11 12 -16 10 -18 4 -9 7 -8 4 -3 9 -4 13 -8Z',g);
      path(c,'M-6 -18 L-2 -20 1 -20 4 -15 2 -12Z',cream);
      path(c,'M-9 0 L-5 1 0 6 1 9 -2 8 -6 5Z',h);
    } else if(s.face===1){
      path(c,'M-12 -10 L-5 -8 -7 -13 0 -8 3 -4 0 -2 -6 -3 -10 -6Z M6 -6 L11 -14 11 -10 13 -11 13 -6 8 -2 4 -1Z',cream);
      path(c,'M-10 1 L-3 4 1 4 5 0 9 2 13 0 11 7 7 10 -1 8 -7 6Z',g);
      path(c,'M-4 -17 Q0 -20 6 -17 L3 -15 0 -11Z',d);
    } else if(s.face===2){
      path(c,'M-12 -15 Q-7 -10 0 -11 L3 -8 -1 -4 -7 -5 -10 -8 -6 -7Z M5 -8 L12 -17 12 -11 14 -12 12 -6 5 -1Z',g);
      path(c,'M-10 -11 Q-6 -7 -3 -8 M-7 -17 Q-3 -13 1 -14 M8 -17 L4 -13',null,cream,1);
      path(c,'M3 -5 L7 -7 6 -2 12 0 5 2 1 1Z',g);
      path(c,'M-8 2 L-3 3 1 7 -1 9 -5 6Z',h);
    } else if(s.face===4){
      path(c,'M-12 -11 Q-9 -14 -5 -11 L-1 -8 2 -7 -3 -4 -8 -5 -11 -7Z M5 -8 Q10 -15 13 -12 L13 -7 8 -2 5 -3Z',g);
      path(c,'M-6 -17 Q-2 -21 4 -18 L1 -15 -2 -13Z',h);
      ellipse(c,-8,1.2,2.2,1.5,h);ellipse(c,-5,2,1,1,cream);ellipse(c,11,-.5,1.4,1,cream);
    } else if(s.face===5){
      path(c,'M-13 -16 L-7 -18 -2 -17 4 -19 10 -18 12 -15 10 -12 4 -12 2 -14 -1 -12 -9 -11 -13 -12Z',g,ink,1.2);
      path(c,'M-10 -15 L-4 -16 -3 -14 -9 -13Z M4 -16 L9 -17 9 -14 5 -14Z',d,ink,.75);
      line(c,'M-9 -14 L-6 -15 M6 -15 L8 -16',h,.9);
      path(c,'M-13 -9 L-7 -10 -3 -9 1 -6 -3 -5 -8 -6 -10 -4 -12 -4Z M5 -7 L10 -11 13 -11 12 -7 7 -5Z',g);
      path(c,'M-10 -1 L-6 -.5 -4 3 -2 4 -2 7 -7 4Z',g,ink,.75);
      ellipse(c,-9,-.1,1,1,d);ellipse(c,-5,3,1,1,d);
      line(c,'M-5 -18 L-1 -19 2 -19',cream,.8);
    } else if(s.face===6){
      path(c,'M-14 -10 L-16 -22 -9 -18 -7 -25 -2 -19 4 -24 4 -18 11 -22 10 -18 14 -18 12 -11 8 -10 5 -13 0 -9 -5 -12Z',s.base,ink,1.5);
      path(c,'M-12 -18 L-9 -15 -8 -20 -4 -16 -2 -14 -5 -13 -9 -14Z M2 -16 L3 -19 3 -16 8 -18 7 -15Z',cream);
      path(c,'M-12 -10 L-6 -10 -8 -13 2 -7 -1 -4 -8 -5 -5 -7Z M6 -7 L13 -15 12 -11 15 -12 10 -6 6 -4Z',d);
      path(c,'M-9 0 L-4 2 -4 4 1 5 -1 7 -5 5Z',g);
      ellipse(c,1.8,-13.5,2,2.3,g);ellipse(c,1.3,-14.2,.7,.7,cream);
    } else if(s.face===7){
      path(c,'M-12 -10 L-15 -15 -13 -15 -14 -20 -9 -19 -7 -24 -4 -21 0 -25 2 -21 7 -24 7 -20 11 -19 13 -15 10 -13 10 -11 6 -13 3 -10 -1 -12 -4 -9 -7 -12 -9 -9Z',d,ink,1.4);
      path(c,'M-12 -17 L-9 -16 -7 -20 -6 -16 -3 -20 -2 -17 0 -20 1 -16 5 -20 5 -16 8 -17 7 -13 4 -14 2 -12 -1 -14 -4 -12 -6 -14 -9 -12Z',h);
      path(c,'M-12 -8 L-8 -10 -3 -8 1 -7 1 -4 -3 -4 -9 -6 -11 -4Z M4 -7 L10 -10 13 -9 12 -6 6 -3Z',g);
    } else {
      path(c,'M-12 -12 L-7 -10 -8 -15 -4 -13 -4 -18 1 -12 0 -8 4 -5 1 -3 -7 -5Z M6 -7 L7 -13 10 -16 10 -12 13 -15 12 -8 8 -4Z',g);
      path(c,'M-10 0 L-6 0 -4 4 -1 4 1 8 7 9 9 6 12 6 11 10 5 13 -1 10 -4 10 -8 5Z',d);
      path(c,'M-1 -19 L1 -15 3 -16 5 -19Z',h);
    }
    path(c,'M-7 -7 Q-4 -8 .5 -5.9 L1 -3 Q-1 -1.3 -4 -2.7 Q-6 -3.5 -7 -7Z M5 -5.8 Q9 -9 12 -8 L12 -4.8 Q9 -1.8 5 -2.5Z',ivory,ink,1.4);
    path(c,'M-2.2 -6.4 L-.2 -5.8 -.4 -3.3 -2 -3.1Z M9.1 -7 L11 -7.5 10.9 -5 9.3 -4.3Z',ink);
    line(c,'M-6.5 -7.5 Q-2.4 -6.8 .7 -5.4 M5.1 -5.5 Q9 -8.4 12.6 -8.2',ink,1.25);
    if(s.face!==2) path(c,'M2 -3 L4 -5 6 -.5 4.2 .6 1.8 .1Z',d);
    if(s.face===1)path(c,'M3 1 Q6 -.6 8 1 L6 3 4 3Z',ink);
    path(c,'M0 4.5 Q6 1.8 11 3.6 L10.1 7 Q6 9 3 7.7Z',s.skin,ink,1);
    path(c,'M2.6 5.4 Q6 4.4 9.3 4.7 L8.5 6.5 4.6 6.8Z',ivory);
    line(c,'M3.6 6.7 L8.7 6.2',crease,.7);
    line(c,'M-10.4 -11.8 Q-12.5 -6 -10 -1 M-8.7 1.6 L-7.1 4.4',h,.8);
    line(c,'M-.5 9.2 Q4 11.5 7.3 10.7',g,.85);
    if(s.face===7){
      c.save();c.translate(4,-2);c.rotate(Math.sin(time*4+phase)*.035);
      path(c,'M-2 -2 Q1 -3 4 -1 Q8 5 8 12 Q8 15 11 14 L12 12 Q15 13 14 16 Q12 21 7 19 Q3 18 2 12 L1 6 -2 2Z',b,ink,1.25);
      line(c,'M2 4 L5 3 M3 8 L6 7 M4 12 L7 11 M6 15 L8 14',h,.8);c.restore();
      path(c,'M-3 1 Q-10 3 -15 -8 Q-17 1 -11 6 Q-7 10 -.5 5Z M10 1 Q16 4 20 -5 Q22 2 16 7 Q12 9 9 6Z',cream,ink,1.25);
      line(c,'M-13 -2 Q-10 5 -5 5 M14 5 Q17 4 19 .3',g,.85);
    } else if(s.face===4) {
      line(c,'M-3 4 Q2 11 11 4',d,.85);
    } else if(s.face===5) {
      path(c,'M-11 -1 L-9 -.5 -8 3 -9 5 -12 3Z',d,ink,.75);
      line(c,'M-10 0 L-9 2 M-7 6 L-3 8',g,.7);
    }
  }
  function drawLuchador(ctx,options={}) {
    const {x=0,y=0,scale=1,face=1,id=0,pose='idle',phase=0,time=0}=options;
    const s=roster[id]||roster[0], c=ctx, u=clamp(phase||0,0,1), t=Number.isFinite(time)?time:0;
    const pace=s.face===4?1.12:s.face===7?.76:s.face===5?.87:1;
    const state=makePose(pose,t*pace,u,s.face), [bx,by,rot]=state.body;
    c.save(); c.translate(x,y);c.scale((face<0?-1:1)*scale,scale);c.lineJoin='round';c.lineCap='round';
    if(pose==='down'){c.translate(0,-14+Math.sin(t*3)*.25);c.rotate(-Math.PI*.49);c.scale(.9,.92);c.translate(0,53);}
    if(s.face===4)c.scale(.96,.95);
    if(s.face===7)c.scale(1.04,1.045);
    if(pose==='dive'){c.translate(0,-10);c.rotate(.31+.22*Math.sin(Math.PI*u));c.translate(0,2);}
    if(pose==='spring'){const launch=clamp((u-.30)/.66,0,1);c.translate(0,-6*launch);c.rotate(.36*launch);}
    if(pose==='combo'&&u>.51&&u<.92){
      c.save();c.translate(4,-59);c.rotate(-.35);
      line(c,'M26 -6 Q44 -14 40 -26',s.trim,1.3);
      line(c,'M27 -2 Q47 -8 47 -22',s.light,.85);c.restore();
    }
    const width=s.width;
    drawnLeg(c,s,false,[bx-6,by+3],state.legs[0].slice(0,2),state.legs[0].slice(2));
    drawnLeg(c,s,true,[bx+5,by+3],state.legs[1].slice(0,2),state.legs[1].slice(2));
    c.translate(bx,by);c.rotate(rot);c.scale(width,1);
    if(s.face===6){
      c.save();c.translate(-13,-26);c.rotate(Math.sin(t*6)*.055+(pose==='dive'||pose==='spring'?.30:0));
      path(c,'M0 -3 Q-6 3 -7 13 Q-7 17 -12 22 L-9 20 -10 26 -5 23 Q-.7 16 -0.5 11 L3 3Z',s.dark,ink,1.25);
      line(c,'M-1 1 Q-5 11 -5 15',s.base,1);c.restore();
    }
    const reaching=pose==='throw'||pose==='pin'||pose==='counter';
    const wings=pose==='spring'||pose==='dive';
    arm(c,s,-15,-30,state.back,false,reaching||wings);
    torso(c,s);
    // Close arm appears in front of the torso. Raised fists can cross the face.
    if(s.face===3)insignia(c,s,-1,-15,.68);
    const frontArm=()=>arm(c,s,14,-29,state.front,true,reaching||(pose==='win'&&[2,4,6].includes(s.face)));
    const armInFront=pose==='guard'||pose==='counter'||pose==='pin'||(pose==='throw'&&u>.33&&u<.8);
    if(!armInFront)frontArm();
    c.save();c.translate(2.7,-49);c.rotate(state.head);mask(c,s,t*pace,u);c.restore();
    if(armInFront)frontArm();
    c.restore();
  }
  window.drawLuchador=drawLuchador;
})();
