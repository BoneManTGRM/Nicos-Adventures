(() => {
  "use strict";
  const W = 800, H = 440, scenes = new Map();
  const venues = [
    {sky:["#211e40","#74445a","#efa16e"],far:"#825165",mid:"#563951",near:"#322b46",mat:["#7da9a7","#b1c4a9","#8baaa1"],banner:"#378c87",lamp:"#ffce91"},
    {sky:["#18494e","#74a59a","#f4ca90"],far:"#82a49a",mid:"#4e8077",near:"#335f5f",mat:["#73acaa","#c4d4b7","#87b4ad"],banner:"#2b8179",lamp:"#fff2aa"},
    {sky:["#211b3e","#694466","#e29b81"],far:"#975d74",mid:"#62415c",near:"#3e2947",mat:["#789ea7","#b4beaf","#8ba4a6"],banner:"#a45583",lamp:"#ffd09a"},
    {sky:["#753e56","#e28a64","#ffd489"],far:"#c38468",mid:"#966664",near:"#754b55",mat:["#9ba4a1","#d7cab0","#abae9f"],banner:"#ad694f",lamp:"#ffce74"},
    {sky:["#101d3b","#364071","#b26278"],far:"#5a5077",mid:"#393953",near:"#25283d",mat:["#618f99","#a5b8a8","#789b9b"],banner:"#647ead",lamp:"#f3bcea"}
  ];
  const dark = "#202134", nearBlack = "#161a28";
  function seeded(seed) {
    return () => { seed = (Math.imul(1664525,seed)+1013904223) >>> 0; return seed/4294967296; };
  }
  function path(c,pts) {
    c.beginPath(); c.moveTo(pts[0],pts[1]);
    for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);
  }
  function poly(c,color,pts) { path(c,pts); c.closePath(); c.fillStyle=color; c.fill(); }
  function line(c,color,w,pts) { path(c,pts); c.strokeStyle=color; c.lineWidth=w; c.stroke(); }
  function rect(c,color,x,y,w,h) { c.fillStyle=color;c.fillRect(x,y,w,h); }
  function circ(c,color,x,y,r) {c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
  function oval(c,color,x,y,rx,ry) {c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
  function grad(c,x,y,xx,yy,pairs) {
    const g=c.createLinearGradient(x,y,xx,yy);for(const [n,color] of pairs)g.addColorStop(n,color);return g;
  }
  function skyline(c,i,v,rnd) {
    rect(c,grad(c,0,0,0,207,[[0,v.sky[0]],[.52,v.sky[1]],[1,v.sky[2]]]),0,0,W,216);
    if (i===4) {
      for(let j=0;j<34;j++)circ(c,"#e4b6b2",rnd()*800,22+rnd()*85,.35+rnd()*.55);
    } else {
      const x=[564,430,205,587][i], y=[96,94,111,104][i];
      circ(c,i===3?"#ffcb86":(i===1?"#ffdc9b":"#e4a275"),x,y,i===3?26:20);
      for(let j=0;j<5;j++)rect(c,v.sky[1],x-22,y+4+j*3,44,.65+j*.34);
    }
    for(let k=0;k<12;k++){
      const x=rnd()*780,y=78+rnd()*50,len=16+rnd()*72;
      poly(c,["#ac7075","#94b5a8","#ac7075","#edab7d","#504765"][i],[x,y,x+len*.24,y-1,x+len*.36,y-3,x+len*.61,y-3,x+len*.70,y-1,x+len,y+1,x+len*.7,y+2,x,y+2]);
    }
    // A stepped far range gives the open-air arenas their own horizon.
    let p=[0,191,0,149];
    for(let x=0;x<=808;x+=13) p.push(x,133+Math.sin(x*.017+1.4)*7+Math.cos(x*.028)*9+rnd()*2);
    p.push(800,205);poly(c,v.far,p);
    if(i===0) {
      const ridge=[0,161,43,151,65,150,92,138,110,143,126,138,150,137,185,124,210,115,229,104,237,103,247,92,255,91,261,86,270,88,275,83,285,84,297,96,311,100,327,113,341,118,355,125,375,130,405,148,430,151,440,176,0,177];
      poly(c,v.mid,ridge);
      poly(c,"#e2b6a0",[214,114,236,104,248,93,258,91,262,87,269,89,277,84,284,85,298,98,311,101,328,115,313,110,301,103,299,105,289,96,289,99,281,93,275,101,276,94,266,103,267,97,255,104,257,99,241,110,241,107]);
      for (const pts of [[265,104,248,123,231,132],[282,99,290,112,300,118],[271,100,263,120,250,128],[294,106,308,122,349,139]])line(c,"#76516a",1,pts);
      p=[0,189,0,172];
      for(let x=0;x<815;x+=13)p.push(x,157+Math.cos(x*.033)*4+Math.sin(x*.009)*11+rnd()*3);
      p.push(800,198);poly(c,v.near,p);
      // Sierra pines.
      for(let j=0;j<78;j++){const x=rnd()*800, y=163+Math.cos(x*.033)*4+Math.sin(x*.009)*11, z=3+rnd()*5;poly(c,v.near,[x-z*.4,y,x,y-z,x+z*.4,y]);}
    } else if(i===1) {
      canal(c,rnd,v);
    } else if(i===3) {
      oaxaca(c,rnd,v);
    } else if(i===2) {
      // Puebla skyline with cupolas and two bell towers.
      rect(c,v.mid,0,156,800,45);
      for(let j=0;j<45;j++){let x=j*19,y=147+rnd()*14;rect(c,v.mid,x,y,18+rnd()*8,32);rect(c,v.mid,x+4,y-2,11,4);}
      for(const [x,y,s] of [[231,129,1],[331,119,1.1],[352,119,1.1],[513,126,.77],[600,128,.9]]){
        c.save();c.translate(x,y);c.scale(s,s);
        rect(c,v.near,-7,5,14,31);rect(c,v.near,-9,5,18,3);rect(c,v.near,-6,-4,12,10);
        c.beginPath();c.moveTo(-7,-3);c.quadraticCurveTo(-5,-8,-2,-10);c.lineTo(0,-15);c.quadraticCurveTo(2,-10,6,-7);c.lineTo(7,-3);c.fillStyle=v.near;c.fill();
        line(c,v.near,1,[0,-17,0,-24]);line(c,v.near,1,[-2.5,-21,2.5,-21]);rect(c,v.sky[2],-3,0,2,4);rect(c,v.sky[2],1,0,2,4);c.restore();
      }
      oval(c,v.near,301,146,13,13);rect(c,v.near,288,145,27,21);rect(c,v.near,299,129,4,7);
    } else {
      for(let layer=0;layer<2;layer++){
        for (let x=-9;x<800;){const w=8+rnd()*17,y=112+rnd()*37+layer*14;
          rect(c,layer?v.near:v.mid,x,y,w,188-y);
          if(rnd()<.27)line(c,v.mid,1,[x+w*.5,y,x+w*.5,y-5-rnd()*9]);
          for(let wy=y+4;wy<155;wy+=5)for(let wx=x+3;wx<x+w-2;wx+=4)if(rnd()<.24)rect(c,layer?"#ad7a84":"#92748c",wx,wy,1.25,1);
          x+=w+1;
        }
      }
      poly(c,v.near,[318,160,320,128,324,123,324,112,327,111,328,99,332,99,332,111,336,111,336,124,340,130,341,159]);
      line(c,v.near,1,[330,101,330,77]);circ(c,"#ffc091",330,77,1.1);
    }
  }
  function canal(c,rnd,v) {
    // The stepped boats' flower arches stand well above the crowd and the canal.
    for(let x=-8;x<822;x+=12+rnd()*24){
      const y=130+rnd()*12,h=13+rnd()*18;
      rect(c,v.mid,x-1,y-h,2,h);
      for(let i=0;i<5;i++)oval(c,v.mid,x+(i-2)*2.6,y-h+i%2*3,4+rnd()*3,5+rnd()*6);
    }
    rect(c,grad(c,0,132,0,171,[[0,"#63918d"],[1,"#95b2a3"]]),0,137,800,37);
    for(let j=0;j<155;j++){
      const x=rnd()*800,y=139+rnd()*24;
      rect(c,j%3===0?"#4f8280":"#a0baab",x,y,2+rnd()*20,.58);
    }
    function trajinera(x,y,scale,body){
      c.save();c.translate(x,y);c.scale(scale,scale);
      oval(c,"#658e83",-3,1,44,2);poly(c,"#496560",[-50,-5,45,-6,35,0,-38,0]);
      poly(c,body,[-50,-7,48,-7,44,-3,-39,-2]);
      rect(c,"#e4b366",-36,-10,71,3);rect(c,"#365c61",-28,-21,2,13);rect(c,"#365c61",20,-21,2,13);
      poly(c,"#bb5362",[-35,-20,20,-20,29,-17,-31,-17]);line(c,"#e8b865",1.5,[-34,-20,19,-20,27,-17]);
      // A curved flower arch behind the decorated passenger canopy.
      c.beginPath();c.moveTo(-25,-7);c.lineTo(-25,-20);c.bezierCurveTo(-25,-44,20,-45,20,-20);c.lineTo(20,-8);
      c.strokeStyle="#325d60";c.lineWidth=6;c.stroke();
      for(let j=0;j<=22;j++){
        const a=Math.PI+(j/22)*Math.PI,xx=-2.5+22.5*Math.cos(a),yy=-19.5+18*Math.sin(a);
        circ(c,["#edac48","#db5965","#e9bb70","#e5836b"][j%4],xx,yy,2.35);
      }
      for(const side of [-25,20])for(let h=-18;h<=-7;h+=4)circ(c,h%8?"#db5c65":"#f0ad59",side,h,2);
      poly(c,"#e3b862",[-13,-28,-8,-32,4,-32,9,-28,6,-25,-9,-25]);circ(c,"#c96561",-4,-29,2);
      // Pole and the trajinero at the stern.
      line(c,"#615d56",1.2,[31,-26,48,2]);circ(c,"#905f4d",32,-19,2.6);
      line(c,"#3c6968",3,[31,-16,30,-9]);line(c,"#915f4e",1.4,[30,-16,35,-15,36,-19]);
      c.restore();
    }
    trajinera(259,147,.7,"#bd6666");trajinera(557,153,1.1,"#b34e69");
    // Flower beds on the chinampa rims.
    for(let x=0;x<800;x+=5){const y=157+Math.sin(x*.022)*2;line(c,"#517767",1,[x,y,x+1,y-3]);if(rnd()<.64)circ(c,["#d87774","#e6ba70","#bd7898"][Math.floor(rnd()*3)],x+1,y-4,.9+rnd()*.7);}
  }
  function oaxaca(c,rnd,v) {
    const ridges=[
      [0,131,38,126,67,116,106,118,132,109,155,114,189,105,215,109,241,104,270,113,300,110,350,124,392,120,417,123,453,108,476,107,505,99,541,103,577,117,613,116,644,110,680,113,719,97,755,90,784,99,800,101,800,168,0,168],
      [0,147,42,137,67,136,104,129,133,135,164,131,201,144,261,141,298,136,331,142,367,144,422,135,468,146,506,138,548,142,591,138,647,126,678,133,721,118,746,123,799,114,800,174,0,174]
    ];
    poly(c,"#ae7364",ridges[0]);poly(c,"#9c6860",ridges[1]);
    for(let x=-6;x<808;){const w=12+rnd()*24,y=145+rnd()*10;rect(c,rnd()>.5?"#a86c58":"#996453",x,y,w,20);rect(c,"#bd8266",x-1,y-2,w+2,2);for(let z=3;z<w-3;z+=6)rect(c,"#795350",x+z,y+4,2,4);x+=w;}
    // Civic arcades, lit upper facade, central cupola and deep shaded doorways.
    c.save();c.translate(454,149);
    poly(c,"#8c6353",[-72,0,-61,-5,59,-5,71,0,71,10,-72,10]);
    rect(c,"#d29a72",-57,-17,111,14);rect(c,"#d8a478",-60,-18,117,2);
    for(let x=-53;x<53;x+=10){
      rect(c,"#745459",x,-11,4.5,8);oval(c,"#745459",x+2.25,-11,2.25,2);
      rect(c,"#e2b37f",x-2,-14,1,10);
    }
    poly(c,"#a76e58",[-19,-18,-17,-22,15,-22,18,-18]);
    poly(c,"#dba579",[-12,-22,-12,-31,-9,-35,6,-35,10,-30,10,-22]);
    oval(c,"#8d645b",-1,-35,9,7);line(c,"#edb775",1,[-10,-36,-1,-42,7,-37]);rect(c,"#81595a",-2,-44,2,4);
    c.restore();
    for(const [x,y,size] of [[110,151,1.25],[200,151,.75],[731,145,1.8]]){
      c.save();c.translate(x,y);c.scale(size,size);
      for(const [dx,dy] of [[-11,-8],[-7,-13],[-3,-18],[1,-20],[5,-14],[9,-12],[13,-6]])poly(c,v.near,[-1,1,dx,dy,dx*.54,dy*.26,2,0]);
      c.restore();
    }
  }
  function truss(c,x,y,x2,y2,height) {
    const len=Math.hypot(x2-x,y2-y),ang=Math.atan2(y2-y,x2-x),n=Math.floor(len/17),step=len/n;
    c.save();c.translate(x,y);c.rotate(ang);
    rect(c,"#262336",0,0,len,height);line(c,"#605767",2,[0,1,len,1]);line(c,"#555263",2,[0,height-1,len,height-1]);
    for(let k=0;k<n;k++)line(c,"#66596b",1.4,[k*step,height-2,k*step+step/2,2,k*step+step,height-2]);
    c.restore();
  }
  const pennants=["#e1a446","#53a09a","#c15f80","#d97959","#9387ab"];
  function garland(c,ax,ay,bx,by,dip,scale,offset) {
    const n=Math.floor((bx-ax)/(21*scale)),len=(bx-ax)/n;
    const yAt=t=>ay+(by-ay)*t+4*dip*t*(1-t);
    c.beginPath();c.moveTo(ax,ay);c.quadraticCurveTo((ax+bx)/2,(ay+by)/2+2*dip,bx,by);c.strokeStyle="#353044";c.lineWidth=1.5;c.stroke();
    for(let k=0;k<n;k++){
      const t=(k+.5)/n,x=ax+(k+.5)*len,y=yAt(t),ang=Math.atan2(by-ay+4*dip*(1-2*t),bx-ax);
      const w=Math.min(18*scale,len-3),h=11*scale;
      c.save();c.translate(x,y);c.rotate(ang);
      // Even-odd cutouts let the sky show through the paper.
      c.beginPath();c.moveTo(-w*.5,0);c.lineTo(w*.5,0);c.lineTo(w*.5,h);
      for(let z=0;z<3;z++){const start=w*.5-z*w/3;c.lineTo(start-w/6,h+2*scale);c.lineTo(start-w/3,h);}
      c.closePath();
      const diamond=(dx,dy,rx,ry)=>{c.moveTo(dx-rx,dy);c.lineTo(dx,dy-ry);c.lineTo(dx+rx,dy);c.lineTo(dx,dy+ry);c.closePath();};
      diamond(0,h*.51,w*.12,h*.22);diamond(-w*.31,h*.49,w*.055,h*.11);diamond(w*.31,h*.49,w*.055,h*.11);
      c.fillStyle=pennants[(k+offset)%pennants.length];c.fill("evenodd");c.restore();
    }
  }
  function lights(c,v) {
    truss(c,-12,2,215,36,9);truss(c,585,36,812,2,9);
    for(const side of [0,1]){
      c.save();if(side){c.translate(W,0);c.scale(-1,1);}
      line(c,"#343245",2,[62,9,62,0]);line(c,"#343245",2,[165,26,165,0]);
      for(const x of [35,81,127,173]){
        const y=15+x*.15;c.save();c.translate(x,y);c.rotate(-.32);
        rect(c,"#1a1c29",-13,-5,27,15);rect(c,"#73646a",-11,-3,23,4);
        rect(c,"#f7b978",-11,7,22,3);rect(c,"#ffeaca",-8,7,16,1.5);c.restore();
        const g=grad(c,x,y,x+68,205,[[0,"rgba(255,219,165,.13)"],[.7,"rgba(255,234,186,.045)"],[1,"rgba(255,234,186,0)"]]);
        poly(c,g,[x-8,y+9,x+10,y+7,x+160,260,x+30,260]);
        const glow=c.createRadialGradient(x+2,y+10,0,x+2,y+10,19);glow.addColorStop(0,"rgba(255,203,136,.26)");glow.addColorStop(1,"rgba(255,203,136,0)");circ(c,glow,x+2,y+10,19);
      }c.restore();
    }
    garland(c,-15,33,265,62,18,.82,2);garland(c,265,62,530,56,15,.69,0);garland(c,530,56,814,34,19,.82,1);
  }
  function fans(c,rnd,round) {
    const shirts=["#35495a","#765067","#3c797b","#725f5e","#566482","#9a695b","#424157","#89717b","#423e58","#c18866"];
    const faces=["#bc866f","#866365","#d0a38a","#a47564","#8d666d","#77575b"];
    for(let row=0;row<3;row++){
      const step=[10,15,21][row],sz=[.52,.78,1.06][row];
      const yBase=[165,182,205][row];
      const contour=x=>4*Math.cos((x-400)/365);
      rect(c,["#48445a","#343347","#2c2b3d"][row],0,yBase+2,800,30);
      for(let x=-3+rnd()*6;x<813;x+=step){
        const y=yBase+contour(x)+rnd()*5;
        const shirt=shirts[Math.floor(rnd()*shirts.length)],skin=faces[Math.floor(rnd()*faces.length)],hair=["#2a2b38","#3a303b","#4c3941"][Math.floor(rnd()*3)];
        c.save();c.translate(x,y);c.scale(sz,sz);
        const raised=rnd();if(raised<.14) {
          line(c,dark,4,[-4,5,-10,-2,-12,-11]);line(c,skin,2,[-4,5,-10,-2,-12,-11]);circ(c,skin,-12,-11,2);
          if(raised<.036){
            poly(c,"#b06f61",[-14,-10,-16,-18,-14,-19,-12,-17,-12,-23,-10,-23,-10,-15,-8,-16,-8,-12,-10,-9]);
          }
        } else if (raised>.91){line(c,skin,2.5,[4,4,10,0,11,-7]);circ(c,skin,11,-7,1.7);}
        poly(c,shirt,[-8,12,-7,5,-5,2,-2,1,3,1,6,3,8,6,9,13]);
        oval(c,skin,0,-3,3.7,4.6);
        if(rnd()<.22 && row>0) {
          const mask=["#b08665","#85819b","#4f8f89","#b67276"][Math.floor(rnd()*4)];
          oval(c,mask,0,-3,4,4.8);line(c,"#d3be96",.9,[-3,-3,-1,-4,0,-2,1,-4,3,-3]);
        }else{
          poly(c,hair,[-3.9,-2,-4.2,-5,-2.9,-7,0,-8,2.5,-7.5,4,-5.5,4,-3,2,-5,0,-5.5,-2,-5]);
        }
        c.restore();
      }
    }
    rect(c,"#252636",0,217,800,31);
    for(let x=-50;x<850;x+=88){
      poly(c,venues[round].banner,[x,220,x+84,220,x+72,234,x-12,234]);
      poly(c,"rgba(28,31,46,.3)",[x+43,220,x+83,220,x+71,234,x+34,234]);
      line(c,"rgba(255,216,159,.4)",.8,[x+8,221,x+16,221,x+12,225,x+19,225]);
    }
    // A few homemade posters rise from the nearer crowd.
    for(const [x,y,col,angle] of [[64,188,"#dbad6f",-.12],[720,180,"#9dbcb2",.07],[572,190,"#d5a485",.06]]){
      c.save();c.translate(x,y);c.rotate(angle);rect(c,"#604954",-1.1,8,2.2,13);rect(c,col,-14,-6,28,14);
      poly(c,"#795963",[-3,5,0,0,-4,0,1,-4,4,-4,2,-1,6,-1]);line(c,"#927268",1,[-10,1,-7,-1]);line(c,"#927268",1,[8,-1,10,-3]);c.restore();
    }
  }
  function emblem(c,round) {
    c.save();c.translate(400,316);c.scale(1,.34);
    const col="rgba(43,92,93,.18)", pale="rgba(229,217,169,.32)";
    c.beginPath();c.arc(0,0,76,0,2*Math.PI);c.lineWidth=2;c.strokeStyle=col;c.stroke();
    c.beginPath();c.arc(0,0,70,0,2*Math.PI);c.lineWidth=3;c.strokeStyle=pale;c.stroke();
    for(let k=0;k<24;k++){const a=k*Math.PI/12;c.save();c.rotate(a);poly(c,k%2?col:pale,[69,-1,87,-3,82,0,69,2]);c.restore();}
    if(round===1) {
      // A flower on the Xochimilco canvas, its petals radiating from a small disc.
      for(let j=0;j<8;j++){c.save();c.rotate(j*Math.PI/4);oval(c,col,0,-24,10,21);oval(c,pale,0,-23,4,13);c.restore();}
      circ(c,col,0,0,13);circ(c,pale,0,0,7);c.restore();return;
    }
    if(round===2) {
      for(let k=0;k<4;k++){c.save();c.rotate(k*Math.PI/2);poly(c,col,[0,-48,14,-36,8,-23,0,-8,-8,-23,-14,-36]);poly(c,pale,[0,-39,5,-33,0,-21,-5,-33]);c.restore();}
      poly(c,col,[0,-10,10,0,0,10,-10,0]);c.restore();return;
    }
    if(round===3) {
      // Geometric stair-step motif woven across the canvas in perspective.
      for(let z=0;z<2;z++){c.save();c.rotate(z*Math.PI);line(c,col,8,[-43,-3,-43,-19,-28,-19,-28,-32,-12,-32,-12,-19,1,-19,1,-5,17,-5,17,-19,31,-19]);
        line(c,pale,2,[-43,3,-37,3,-37,-13,-22,-13,-22,-26,-18,-26]);c.restore();}c.restore();return;
    }
    // Mask silhouette as a worn emblem printed on the canvas.
    poly(c,col,[-38,-28,-27,-45,-10,-52,11,-52,27,-44,39,-27,36,15,20,38,0,51,-20,38,-37,13]);
    poly(c,pale,[-33,-27,-13,-15,-2,-4,-10,4,-22,-1]);poly(c,pale,[32,-28,12,-15,3,-4,10,4,23,-1]);
    poly(c,pale,[5,-44,-12,-14,-1,-16,-7,10,15,-24,4,-21]);poly(c,pale,[-12,21,0,16,12,21,8,26,0,23,-8,26]);
    c.restore();
  }
  function rope(c,x1,y1,x2,y2,color,w,sag=1) {
    function arc(dx,dy,col,width){
      c.beginPath();c.moveTo(x1+dx,y1+dy);c.quadraticCurveTo((x1+x2)/2+dx,(y1+y2)/2+sag+dy,x2+dx,y2+dy);
      c.strokeStyle=col;c.lineWidth=width;c.stroke();
    }
    arc(0,1.2,"#492c42",w+1.4);arc(0,0,color,w);arc(0,-w*.26,"rgba(255,211,181,.68)",Math.max(.55,w*.18));
  }
  function rearPost(c,x,side) {
    c.save();c.translate(x,0);c.scale(side,1);
    poly(c,"#2b3947",[-4,243,-4,166,0,160,4,164,5,245]);
    rect(c,"#ad9085",-3.2,167,1.7,75);rect(c,"#625964",.5,167,2,75);
    for(const y of [179,201,223]){
      line(c,"#3e3847",3,[1,y,12,y+1]);poly(c,"#5c3449",[4,y-4,16,y-4,22,y,17,y+3,4,y+3]);
      line(c,"#d18a82",.8,[6,y-3,15,y-3,19,y-1]);
    }
    c.restore();
  }
  function mat(c,v,rnd,round) {
    poly(c,"#30303c",[-6,291,86,239,715,239,806,292,806,440,-6,440]);
    poly(c,grad(c,0,239,0,403,[[0,v.mat[0]],[.57,v.mat[1]],[1,v.mat[2]]]),[87,240,713,240,828,398,-28,398]);
    // Perspective seams, canvas stitching and distressed flecks.
    for(const [xa,xb] of [[166,98],[632,704]])line(c,"rgba(52,91,95,.17)",.9,[xa,241,xb,397]);
    for(let j=0;j<650;j++){
      let y=242+rnd()*154,x=90-(y-240)*.70+rnd()*(620+(y-240)*1.42);
      rect(c,rnd()<.5?"rgba(234,223,178,.17)":"rgba(54,93,95,.14)",x,y,.6+rnd()*2,.45+rnd()*.28);
    }
    for(let j=0;j<18;j++){
      const x=98+rnd()*590, y=249+rnd()*127;
      line(c,"rgba(78,114,111,.14)",.65,[x,y,x+4,y-.5,x+13+rnd()*15,y+.4]);
    }
    emblem(c,round);
    // Narrow raised apron with stitched geometric braid.
    rect(c,"#394e57",0,397,800,5);rect(c,"#799395",0,398,800,1);
    rect(c,grad(c,0,401,0,440,[[0,"#374951"],[1,"#202c3e"]]),0,402,800,38);
    for(let x=-35;x<840;x+=36){
      poly(c,"#47545b",[x,425,x+16,410,x+31,425,x+16,438]);
      line(c,"#897857",1,[x+6,425,x+16,416,x+25,425,x+16,432,x+6,425]);
      poly(c,"#6b685b",[x+12,424,x+16,420,x+20,424,x+16,428]);
    }
    rect(c,"#494f56",0,405,800,1);
  }
  function makeScene(round) {
    const v=venues[round],r=seeded(101+round*7901);
    const surface=document.createElement("canvas");surface.width=W*1.5;surface.height=H*1.5;
    const c=surface.getContext("2d");c.scale(1.5,1.5);
    skyline(c,round,v,r);lights(c,v);fans(c,r,round);mat(c,v,r,round);
    rearPost(c,85,1);rearPost(c,715,-1);
    const rows=[[179,"#d46a73"],[201,"#b95a69"],[223,"#cb6871"]];
    for(const [y,color] of rows)rope(c,90,y,710,y,color,2.6,2.5);
    for(const side of [0,1]){
      c.save();if(side){c.translate(800,0);c.scale(-1,1);}
      for(const [k,[y,color]] of rows.entries())rope(c,85,y,-12,376+k*11,color,2.8,1.2);
      c.restore();
    }
    return surface;
  }
  function idx(n){return Math.max(0,Math.min(venues.length-1,Math.floor(n)||0));}
  function ringside(c,time,round,motion) {
    c.save();c.beginPath();c.rect(0,163,800,37);c.clip();
    const skin=["#d2a088","#ab756b","#bb856b","#c7947d"], shirts=["#447f7f","#795e87","#ad6f64","#757397"];
    const locations=[116,275,515,679];
    for(let j=0;j<4;j++){
      const x=locations[j], wave=motion?Math.sin(time*(2.4+j*.17)+j*2.4):0;
      const y=194+j%2*2+wave*.6;
      c.save();c.translate(x,y);
      // Crowd wave, illustrated scarf and one small snare drum.
      const raise=5+wave*4;
      if(j!==2){
        const leftY=-6-raise,rightY=-7-(j===1?raise*.6:raise);
        const a=[-5,2,-9,-1,-12,leftY],b=[4,2,9,-1,13,rightY];line(c,"#303343",3.5,a);line(c,skin[j],2.25,a);
        line(c,"#303343",3.5,b);line(c,skin[j],2.25,b);
        if(j===1||j===3){
          const col=j===1?venues[round].banner:"#bb725d";
          poly(c,col,[-13,leftY-2,-1,leftY-5,14,rightY-2,15,rightY+1,0,leftY-1,-14,leftY+2]);
          for(let k=0;k<3;k++)line(c,"#dfbd86",.8,[-11+k*8,leftY-2,-11+k*8,leftY+.2]);
        }
        circ(c,skin[j],-12,leftY,1.4);circ(c,skin[j],13,rightY,1.4);
      } else {
        const beat=motion?Math.sin(time*8.3):0;
        line(c,skin[j],2,[-4,3,-8,1,-11,-3+beat*2]);line(c,"#dcb585",1,[-11,-3+beat*2,-4,-9+beat*3]);
        line(c,skin[j],2,[5,3,10,0,11,-4-beat*2]);line(c,"#e1c095",1,[11,-4-beat*2,4,-9-beat*3]);
      }
      poly(c,shirts[j],[-7,9,-6,3,-3,1,1,0,5,2,7,9]);oval(c,skin[j],0,-3.2,3.6,4.2);
      if(j%2===0){
        poly(c,"#394754",[-3.6,-3,-3.6,-6,0,-8,3,-7,4,-4,2,-4,0,-5,-2,-4]);
      } else {
        oval(c,shirts[j],0,-3.6,3.8,4.2);line(c,"#e7cd9b",.85,[-3,-4,-1,-4.6,0,-2.4,1,-4.6,3,-4]);
      }
      if(j===2){rect(c,"#b68667",-4,4,10,5);line(c,"#ead398",1,[-4,4,6,4]);line(c,"#664d53",.7,[-3,5,-1,8,1,5,3,8,5,5]);}
      c.restore();
    }
    c.restore();
  }
  window.drawArena = function(c,{time=0,round=0,motion=true}={}) {
    const n=idx(round);
    if(!scenes.has(n))scenes.set(n,makeScene(n));
    c.save();c.drawImage(scenes.get(n),0,0,W,H);
    ringside(c,time,n,motion);
    if(motion) {
      // Tiny crowd-camera glints and dust animate independently of the painted set.
      const spots=[[126,153],[634,167],[470,175],[54,182],[742,154]];
      for(let i=0;i<spots.length;i++){
        const t=(time*.41+i*.238+n*.39)%1;
        if(t<.033){const strength=Math.sin(t/.033*Math.PI),[x,y]=spots[i];c.globalAlpha=Math.max(0,strength)*.72;
          line(c,"#fff1cf",.8,[x-4,y,x+4,y]);line(c,"#fff1cf",.8,[x,y-3,x,y+3]);circ(c,"#fff5d5",x,y,1.1);}
      }
      c.globalAlpha=.28;
      for(let j=0;j<8;j++){
        const x=(j*103+Math.sin(time*.62+j)*5)%800,y=36+(j*19+time*(3+j%3))%98;
        circ(c,"#f1c49d",x,y,.6);
      }
    } c.restore();
  };
  // The referee is drawn separately so the match can place him behind both wrestlers.
  window.drawReferee = function(c,{x=400,y=307,count=0,time=0,pinning=false,motion=true}={}) {
    const wave=motion?Math.sin(time*(pinning?7:2.8)):0;
    c.save();c.translate(x,y);c.scale(.85,.85);
    const ink="#292d39", skin="#b77c67", highlight="#deb398", cream="#e0d8be";
    const squat=pinning?10:0, top=-51+squat;
    oval(c,"rgba(38,55,58,.2)",0,1,18,3.2);
    // Slacks, white soles and a center crease keep this small figure legible.
    if(pinning){
      poly(c,ink,[-7,-26,2,-25,0,-15,-10,-7,-5,-3,-7,0,-19,-1,-20,-6,-11,-15]);
      poly(c,"#44424b",[-1,-24,8,-23,13,-14,18,-9,17,-5,9,-6,4,-10,-2,-10]);
      poly(c,ink,[17,-10,22,-8,24,-4,16,-4,12,-6]);rect(c,cream,-19,-1,11,1);
    }else{
      poly(c,ink,[-9,-31,0,-31,0,-19,-4,-6,-5,-2,-13,-2,-12,-7,-9,-19]);
      poly(c,"#44424b",[-1,-30,8,-31,10,-20,12,-4,4,-3,0,-17,-2,-20]);
      line(c,"#706875",.8,[5,-23,7,-17,8,-6]);
      poly(c,ink,[-12,-5,-5,-5,-4,-1,-6,0,-17,0,-17,-2]);
      poly(c,ink,[4,-5,11,-5,16,-2,16,0,4,0]);
      line(c,cream,.8,[-16,-.5,-6,-.5]);line(c,cream,.8,[5,-.5,15,-.5]);
    }
    c.save();c.translate(0,top);
    const headBob=wave*.4,shirt=[-11,6,-7,1,-3,0,4,0,9,3,13,8,9,12,7,12,8,23,-8,23,-8,12,-11,13,-14,10];
    poly(c,ink,shirt);c.save();path(c,shirt);c.closePath();c.clip();
    for(let k=-12;k<15;k+=5)poly(c,cream,[k,-1,k+2.7,-1,k+5,25,k+2,25]);c.restore();
    poly(c,ink,[-5,0,0,2,4,0,3,3,.5,5,-1,3,-3,5]);
    rect(c,ink,-8,20.8,16,2.8);rect(c,"#b29b79",-1,21.4,3,1.1);
    const arm = pinning ? [10,8,16,3+wave*2,18,-7-wave*6] : [11,10,13,17,9,21+wave];
    const other = pinning ? [-12,10,-15,18,-22,22] : [-12,12,-15,17,-18,13+wave];
    c.lineJoin="round";c.lineCap="round";
    line(c,ink,4.2,other);line(c,skin,2.8,other);
    line(c,ink,4.2,arm);line(c,skin,2.8,arm);
    const hx=arm[4],hy=arm[5];
    circ(c,skin,hx,hy,2.3);circ(c,skin,other[4],other[5],2);
    if(pinning){
      const digits=Math.min(3,Math.max(1,Math.floor(Number(count)||0)));
      for(let j=0;j<digits;j++)line(c,highlight,1.3,[hx+j*.65-.7,hy-1,hx-1+(j-1)*1.6,hy-4.4+(j%2)*.7]);
    }
    c.translate(0,headBob);
    rect(c,skin,-2.5,-3,5,4);
    poly(c,ink,[-6,-10,-5,-15,-2,-17,3,-17,6,-14,6,-8,4,-4,1,-2,-3,-3,-5,-6]);
    poly(c,skin,[-5,-11,0,-14,5,-12,5,-8,3,-5,0,-4,-4,-6]);
    poly(c,"#4c3940",[-6,-9,-6,-13,-4,-16,-1,-18,3,-17,6,-14,6,-11,3,-12,0,-13,-3,-12,-4,-9]);
    line(c,"#62505a",.8,[-4,-15,-1,-16,3,-15]);line(c,ink,.8,[-3,-9,-1.2,-9]);line(c,ink,.8,[1,-9,3,-9]);line(c,highlight,.85,[0,-8,0,-7,1,-7]);
    rect(c,"#aead9a",4,6,2.4,2.4);c.restore();c.restore();
  };
  window.drawForeRopes = function(c,{time=0,round=0,motion=true}={}) {
    c.save();
    const wobble=motion?Math.sin(time*2.1)*.23:0;
    rope(c,-10,375,810,375,"#bb465a",4.7,6+wobble);
    rope(c,-10,402,810,402,"#ab4156",3.7,5+wobble*.6);
    for(const side of [0,1]){
      c.save();if(side){c.translate(800,0);c.scale(-1,1);}
      // Foreground turnbuckle cropped at either picture edge like a ringside camera.
      poly(c,"#25303e",[0,346,4,348,9,424,0,435]);line(c,"#a29487",1.6,[1,349,6,420]);
      for(const yy of [375,402]){
        poly(c,"#5f3448",[0,yy-8,9,yy-5,16,yy,9,yy+4,0,yy+5]);
        line(c,"#ce8581",1.1,[1,yy-5,9,yy-3,12,yy-1]);
      }c.restore();
    }c.restore();
  };
})();
