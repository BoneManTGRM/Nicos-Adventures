/* Hand-pixelled wildlife. Each character is rasterized one time per gait frame. */
(() => {
  'use strict';
  const cycle = Math.PI * 2;
  const cache = new Map();
  const sizes = { elk:[137,120], deer:[128,111], boar:[114,68], hare:[59,54], fox:[130,60], pheasant:[111,53] };
  // Ink, deep shade, shade, local colour, half light, light, cream, ivory, dark horn, horn, horn light.
  const colors = {
    elk:['302821','49352c','654537','875e43','aa7852','c59665','dec595','f5ddb0','705f48','a8946d','d5c397'],
    deer:['332922','4e392d','70503a','965f3c','b97f50','d7a26d','ead2a5','fff1cc','806a4e','ae9566','ded09f'],
    boar:['302a2d','45383a','594543','71564b','8c6f5b','ae9273','cbb995','f2e4ba','65504b','9c856c','e7cd9e'],
    hare:['352d2b','4e3c36','6d5142','8c6c50','ad8963','cdac80','e1c99e','faecc3','806559','bf907a','e8c8a0'],
    fox:['32292d','4d3333','783e32','a34c31','c46334','e28445','f2bf84','fae4b3','6e4a41','ad7657','eec59a'],
    pheasant:['302b31','4f3437','764740','9d573a','b47647','d09b62','e0c8a0','f4dcac','344a45','436b61','79958a'],
    rare:['4b413d','685b51','897b69','ad9d82','c5b89d','e0d2b3','f1e6c8','fff8df','937750','be9d62','edd190']
  };
  const expansions=[window.TimberNorthArt,window.TimberSafariArt,window.TimberGiantsArt,window.TimberHighlandArt];
  for(const set of expansions){Object.assign(sizes,set.sizes);Object.assign(colors,set.colors);}
  colors.legend=['362b3d','59404a','80553e','a66b3b','c78945','e6ae62','f5d98a','fff3c2','786075','a78987','e9c48a'];
  colors.aurora=['263847','315260','44747d','618f94','82b0ac','a2cdc0','c3e6cc','e5f5d3','4a657b','7996a3','a9c5bd'];
  const signatures = {
    'brass-tusk': {species:'elephant', colors:['292b2c','3d4141','555a57','73756b','8d8e7b','aaab91','c79b4c','ffe59b','716852','aa9871','e2ca91']},
    'cinderback': {species:'grizzly', colors:['26262a','363333','48403f','61534a','7b6956','99866e','c7b798','eddabd','5d5552','8e7a6a','d5c3a8']},
    'embermane': {species:'lion', colors:['352022','4b2824','6e4533','996843','c49859','dbb377','edd5a0','fff0c7','863f2e','b86138','e8a35e']},
    'blue-hour': {species:'polar', colors:['1d3345','384c6d','59759a','8aa5c5','b2c8d9','d1e0dd','dceeea','fffae8','6c88aa','91bdc0','b5dfd4']},
    'red-comet': {species:'warthog', colors:['302428','4b3030','624642','7d5f54','9c8070','bba18b','d8bb90','f8e5b5','803b31','bb5536','ed9a51']},
    'fogbound': {species:'kodiak', colors:['292327','3c3032','53403c','6b5248','886751','a57e61','caa282','ead0a4','89583f','bb8054','e6b882']}
  };
  for(const [id,s] of Object.entries(signatures))colors[id]=s.colors;
  function pack(hex) {
    const number = parseInt(hex,16);
    return new Uint32Array(new Uint8Array([number >> 16,(number >> 8)&255,number&255,255]).buffer)[0];
  }
  for(const key in colors) colors[key]=colors[key].map(pack);
  const rounded=Math.round;
  // Integer scan lines keep the artwork crisp at every browser zoom and device pixel ratio.
  function painter(w,h,pixels,palette) {
    function dot(i,x,y) {
      x=rounded(x);y=rounded(y);
      if(x>=0 && y>=0 && x<w && y<h) pixels[y*w+x]=palette[i];
    }
    function poly(i,p) {
      let top=h,bot=0;
      for(let k=1;k<p.length;k+=2){top=Math.min(top,p[k]);bot=Math.max(bot,p[k]);}
      for(let y=Math.max(0,Math.ceil(top-.5)); y<Math.min(h,Math.ceil(bot-.5)); y++) {
        const cuts=[], mid=y+.5;
        let x0=p[p.length-2], y0=p[p.length-1];
        for(let j=0;j<p.length;j+=2){
          const x1=p[j],y1=p[j+1];
          if((y0>mid)!==(y1>mid)) cuts.push(x0+(mid-y0)*(x1-x0)/(y1-y0));
          x0=x1;y0=y1;
        }
        cuts.sort((a,b)=>a-b);
        for(let j=0;j+1<cuts.length;j+=2){
          const begin=Math.max(0,Math.ceil(cuts[j]-.5)),end=Math.min(w,Math.ceil(cuts[j+1]-.5));
          if(end>begin)pixels.fill(palette[i],y*w+begin,y*w+end);
        }
      }
    }
    function line(i,p,n=1) {
      for(let k=0;k<p.length-2;k+=2){
        let ax=rounded(p[k]),ay=rounded(p[k+1]);const bx=rounded(p[k+2]),by=rounded(p[k+3]);
        const dx=Math.abs(bx-ax),dy=-Math.abs(by-ay),sx=ax<bx?1:-1,sy=ay<by?1:-1;let err=dx+dy;
        for(;;){dot(i,ax,ay);if(n>=2)dot(i,ax+1,ay);if(n>=3)dot(i,ax,ay+1);
          if(ax===bx && ay===by)break;const e=err*2;if(e>=dy){err+=dy;ax+=sx;}if(e<=dx){err+=dx;ay+=sy;}}
      }
    }
    return {poly,line,dot};
  }
  function longLeg(a,x,y,h,back,far,phase,bulk=1) {
    const v=Math.sin(phase), lift=Math.max(0,Math.cos(phase));
    const kneeX=x+(back?4:-1)+v*h*.17,kneeY=y+h*.38-lift*2;
    const jointX=x+(back?-7:0)+v*h*.23,jointY=y+h*.65-lift*3;
    const toeX=x+(back?-3:1)+v*h*.30,toeY=y+h-lift*5;
    const k=bulk,b=far?1:2,face=far?2:3;
    a.poly(b,[x-5*k,y,x+6*k,y,kneeX+2*k,kneeY-1,jointX+2,jointY,toeX+1,toeY-4,toeX+4,toeY-1,toeX+4,toeY,toeX-2.5,toeY,toeX-2,toeY-5,jointX-2.5,jointY+1,kneeX-4*k,kneeY+1]);
    a.poly(face,[x-3*k,y,x+4*k,y,kneeX+.5,kneeY,jointX,jointY,kneeX-2.5*k,kneeY]);
    if(!far){a.line(4,[kneeX-1,kneeY+1,jointX-.5,jointY]);a.line(3,[jointX+1,jointY+2,toeX,toeY-5]);}
    a.poly(0,[toeX-1.5,toeY-3,toeX+1,toeY-4,toeX+4,toeY-1,toeX+4,toeY,toeX-2.5,toeY]);
  }
  function antler(a,branches,far=false){
    for(const [path,weight] of branches) {
      a.line(far?1:8,path,weight);
      if(!far && weight>=2){const inner=path.map((v,i)=>i%2?v-1:v);a.line(9,inner,1);}
      if(!far){const l=path.length;a.line(10,path.slice(Math.max(0,l-4)),1);}
    }
  }
  function elk(a,t) {
    const {poly:P,line:L,dot:D}=a;
    longLeg(a,39,76,40,true,true,t+Math.PI);longLeg(a,80,76,40,false,true,t);
    antler(a,[ [[106,44,104,35,97,30,90,24,85,15,83,5],3], [[96,30,94,24,94,16],2], [[90,23,83,22,75,14,73,8],2], [[85,16,79,11,78,4],2], [[104,37,109,31,111,21],2], [[102,33,103,25,102,19],2] ],true);
    longLeg(a,31,73,47,true,false,t);longLeg(a,75,75,45,false,false,t+Math.PI);
    P(2,[19,56,29,50,47,50,58,53,72,52,83,46,94,37,107,35,116,43,109,55,100,67,92,79,80,88,72,89,68,83,54,83,43,85,31,83,24,78,19,74,16,64]);
    P(3,[18,59,24,53,32,51,46,51,56,54,71,54,82,49,90,49,90,63,83,76,71,83,54,82,42,85,31,82,23,75,17,70]);
    P(4,[18,58,28,52,44,52,56,55,69,55,77,52,73,61,71,68,62,75,48,77,38,73,30,75,22,68]);
    P(5,[18,59,24,54,31,52,43,52,57,55,68,55,63,58,48,58,37,56,29,58,26,64,21,66]);
    P(6,[17,60,23,54,29,53,33,54,27,58,26,63,22,69,17,68]);
    P(5,[17,62,19,65,19,70,16,72,15,68]);P(2,[18,59,20,61,19,65,15,69,13,68,15,62]);
    P(3,[32,61,42,59,51,62,52,69,47,75,39,79,33,78,36,71,37,67]);
    P(4,[31,60,40,58,47,60,50,63,42,61,36,63,32,69,29,67]);
    P(2,[39,78,47,76,58,79,70,75,74,80,70,83,53,83,45,84]);
    P(1,[70,72,77,56,84,47,95,37,103,39,105,50,98,59,95,67,90,73,85,83,82,81,78,86,77,82,73,87,72,84,68,88,70,79]);
    P(2,[75,66,80,54,88,45,96,40,104,42,101,49,94,53,91,61,87,63,82,75,81,70,76,77]);
    P(3,[79,57,84,47,95,39,100,40,96,46,91,48,87,55,84,56,80,63]);
    L(4,[80,54,84,49,90,44]);L(3,[87,60,86,64,82,69]);L(2,[90,68,88,73,84,78]);L(5,[47,54,56,56,63,56]);
    P(2,[101,42,94,40,89,36,88,32,93,32,102,36,108,40]);P(4,[89,33,94,34,101,38,97,38,92,36]);P(5,[89,32,95,33,99,36,93,34]);
    P(3,[107,38,113,28,117,27,117,32,114,38,111,40]);P(5,[111,36,115,29,116,29,114,34]);
    P(3,[98,39,104,35,112,36,117,41,120,47,130,51,132,54,129,58,123,59,117,55,111,53,105,50,101,51,98,48]);
    P(4,[101,39,105,36,111,36,116,42,119,47,127,50,130,53,125,55,117,51,110,49,104,45]);
    P(5,[105,37,111,37,114,40,110,40,107,39]);P(6,[115,49,120,50,128,55,129,57,124,57,118,53]);
    P(1,[128,51,132,52,133,54,130,56,127,54]);D(5,130,52);L(1,[120,55,124,57,128,57]);
    P(2,[108,41,113,41,115,43,111,44,108,43]);L(0,[111,42,113,42]);D(7,112,42);D(1,115,45);
    antler(a,[ [[105,38,101,32,96,30,90,28,83,24,77,18,74,11,74,4],3], [[98,31,100,24,99,16,97,12],2], [[92,28,93,22,90,16,89,11],2], [[85,25,84,18,81,12,81,6],2], [[78,19,72,18,65,13,62,7],2], [[75,12,70,8,69,2],2], [[103,36,108,32,111,26,110,20],2] ]);
  }
  function deer(a,t) {
    const {poly:P,line:L,dot:D}=a;
    longLeg(a,35,67,39,true,true,t+Math.PI,.8);longLeg(a,76,67,40,false,true,t,.8);
    antler(a,[ [[98,35,101,28,100,22,96,18,94,12,94,5],2], [[98,21,99,14,98,10],2], [[96,17,90,14,87,9],2], [[101,28,107,22,107,15],2] ],true);
    longLeg(a,29,67,44,true,false,t,.87);longLeg(a,72,68,43,false,false,t+Math.PI,.74);
    P(2,[18,54,28,49,38,48,59,52,72,50,82,45,94,32,104,33,111,43,97,57,91,68,81,77,72,79,64,75,50,76,37,79,25,77,19,70,16,62]);
    P(3,[18,55,27,51,40,50,55,53,70,52,82,48,93,36,97,36,99,43,91,53,86,64,76,75,62,71,48,75,33,77,24,73,19,66]);
    P(4,[18,55,27,50,39,49,55,52,72,51,83,45,92,35,98,35,93,44,86,52,82,62,72,69,61,69,49,73,39,70,28,72,21,67]);
    P(5,[20,55,28,51,39,50,53,53,68,53,72,52,65,56,54,56,40,53,30,54,25,59,21,61]);
    P(3,[29,62,36,57,45,57,51,60,51,66,46,71,39,75,34,76,37,70,36,65]);
    L(5,[28,61,32,57,38,55]);L(4,[38,58,43,58,48,60]);L(5,[82,47,89,40,91,36]);
    P(6,[43,73,52,71,65,69,69,71,62,73,54,74,47,76,40,76]);
    P(6,[91,44,96,38,105,38,105,43,97,51,91,61,87,62,87,56]);P(7,[95,45,100,41,104,41,99,48,93,53]);
    P(4,[18,58,13,56,8,51,8,46,11,48,15,51,20,54]);P(7,[18,58,15,60,10,57,6,50,7,46,10,51,14,54]);
    P(3,[98,36,90,35,84,31,82,27,87,27,95,29,102,33]);P(5,[84,28,91,29,97,33,92,32,87,31]);
    P(4,[102,34,107,27,111,25,111,29,106,35]);P(6,[105,32,109,27,110,27,107,31]);
    P(3,[94,34,101,30,108,33,113,37,115,41,123,44,126,47,124,50,120,51,112,47,105,46,99,45,96,42]);
    P(4,[97,34,102,31,108,34,111,37,114,42,121,44,124,47,120,48,113,45,107,43,101,42]);
    P(6,[107,42,112,43,121,48,124,48,122,50,118,49,112,46]);P(0,[121,44,125,45,126,47,123,48,121,47]);D(5,124,45);
    L(2,[103,36,107,36,109,38]);L(0,[105,37,108,38]);D(7,106,37);L(5,[98,33,101,32,104,33]);
    antler(a,[ [[101,32,97,28,91,25,85,23,78,18,75,11,76,4],3], [[94,27,96,21,95,15,94,12],2], [[86,23,87,18,86,11,85,8],2], [[80,19,78,14,80,6,80,2],2], [[76,14,71,12,69,7],2], [[98,29,103,26,105,20],2] ]);
  }
  function boar(a,t){
    const {poly:P,line:L,dot:D}=a;
    longLeg(a,28,43,22,true,true,t+Math.PI,.8);longLeg(a,72,45,20,false,true,t,.8);
    longLeg(a,23,41,27,true,false,t,1.05);longLeg(a,67,44,24,false,false,t+Math.PI,1.05);
    L(2,[16,32,13,32,10,35,8,39,5,40,3,38],2);L(3,[5,40,3,38,3,35]);
    P(1,[12,36,17,25,23,21,31,17,41,15,45,11,46,14,52,10,53,13,60,8,60,11,65,7,65,10,70,8,70,11,76,10,77,13,82,13,83,17,89,20,94,26,97,32,102,37,109,39,111,44,107,47,97,47,91,51,82,51,77,54,70,56,60,54,46,51,34,51,26,54,19,52,14,47]);
    P(2,[13,34,18,26,28,21,38,18,48,16,59,12,71,11,80,15,85,19,91,27,94,33,101,39,107,39,109,43,104,46,96,46,87,49,76,50,67,54,56,51,43,49,32,50,24,53,17,48,14,43]);
    P(3,[14,35,19,26,30,21,43,18,58,14,68,12,77,14,83,18,87,24,80,24,75,30,74,36,67,45,56,47,43,45,37,49,26,48,18,43]);
    P(4,[18,31,22,26,31,22,45,18,59,15,68,13,76,15,77,17,65,17,60,20,48,21,42,24,31,24,24,30,19,32]);
    P(2,[21,34,29,29,37,29,44,32,43,38,37,44,33,47,32,42,30,37,24,37]);L(4,[24,31,29,28,34,27]);
    P(3,[72,25,79,20,84,19,88,24,94,32,98,36,94,37,91,39,86,39,79,45,71,46,73,39]);
    P(4,[77,23,83,20,88,24,88,27,83,26,79,29,76,31]);
    P(1,[77,24,75,18,75,14,79,15,84,20,82,25]);P(3,[77,16,80,18,82,21,79,22]);D(5,77,16);
    P(4,[88,31,92,32,99,38,105,39,106,42,99,43,92,38,87,37]);P(2,[103,38,109,37,112,40,112,44,108,46,105,44]);L(5,[105,39,109,38,110,40]);D(0,110,41);
    L(0,[88,32,91,32]);D(7,89,32);L(5,[85,30,89,29,91,30]);
    P(7,[97,45,99,46,102,44,102,40,104,42,104,45,102,48,99,49,97,48]);
    for(const [x,y] of [[32,22],[39,24],[49,19],[56,18],[62,19],[67,17],[44,28],[51,26],[58,23],[63,26],[65,31],[55,33]]) L(4,[x,y+2,x+3,y]);
    L(5,[46,17,54,14]);L(4,[57,14,64,11]);L(2,[81,43,85,40,88,40]);
  }
  function fox(a,t){
    const {poly:P,line:L,dot:D}=a;
    longLeg(a,64,33,23,true,true,t+Math.PI,.55);longLeg(a,91,35,22,false,true,t,.5);
    // The plume moves from its base, in counterpoint to the leading foot.
    const lift=rounded(Math.sin(t)*2);
    P(2,[60,27,53,29,47,35,38,39,29,40,23,39+lift,16,35+lift,8,30+lift,2,30+lift,4,37+lift,12,44+lift,23,49+lift,34,50,43,48,53,41,61,34]);
    P(3,[57,28,49,31,43,37,34,40,25,40+lift,17,34+lift,8,30+lift,3,30+lift,10,39+lift,21,45+lift,33,47,43,44,51,39,58,32]);
    P(4,[55,29,48,33,43,38,32,42,23,40+lift,18,37+lift,21,41+lift,28,44+lift,36,44,46,40]);
    P(6,[2,30+lift,8,29+lift,15,32+lift,21,37+lift,25,39+lift,21,40+lift,23,44+lift,16,42+lift,17,45+lift,9,41+lift,4,36+lift]);P(7,[2,30+lift,8,30+lift,14,33+lift,17,36+lift,13,35+lift,11,36+lift,6,33+lift]);
    longLeg(a,60,33,27,true,false,t,.62);longLeg(a,86,34,26,false,false,t+Math.PI,.59);
    P(2,[51,29,57,20,65,17,78,19,88,18,96,14,103,11,111,17,111,25,107,30,102,37,94,41,83,41,74,39,66,40,56,41,51,38]);
    P(3,[51,31,55,24,61,20,67,18,79,20,91,18,98,14,105,14,107,24,103,33,96,37,88,39,76,36,68,38,58,39,52,36]);
    P(4,[52,29,58,22,65,19,76,20,87,20,96,16,100,15,102,21,96,27,93,32,83,34,76,32,69,32,62,35,56,35]);
    P(5,[54,27,59,21,65,18,78,20,88,19,95,16,99,16,94,21,86,23,75,23,65,21,60,23]);
    P(3,[60,27,65,25,73,26,75,29,72,33,67,37,65,38,66,32]);L(4,[61,27,66,25,70,26]);
    P(6,[92,28,100,23,111,22,111,28,106,31,102,36,96,39,90,39,93,35,90,36]);P(7,[99,27,105,24,109,24,107,28,102,31,98,31]);
    P(2,[99,16,98,5,100,2,106,10,107,14]);P(4,[100,5,101,5,105,11,102,12]);
    P(2,[105,14,110,3,113,2,114,14,111,18]);P(5,[109,12,112,5,112,12]);
    P(4,[97,16,103,12,111,12,117,17,119,21,126,23,128,25,125,28,118,28,113,27,107,29,101,27,98,24,94,24]);
    P(5,[100,16,104,13,111,13,116,17,119,22,123,23,121,24,114,22,109,20,103,21]);
    P(7,[104,23,111,23,116,24,123,25,126,25,124,28,118,28,113,27,106,28,100,26]);P(0,[125,23,128,23,129,25,126,26,124,25]);
    L(0,[111,20,114,20]);D(6,112,20);L(4,[108,18,111,17,114,18]);L(2,[117,26,121,27]);
  }
  function hare(a,t){
    const {poly:P,line:L,dot:D}=a;const jump=rounded(Math.max(0,Math.sin(t))*3),stretch=rounded(Math.cos(t)*3);
    const tr=(path)=>path.map((v,i)=>i%2?v-jump:v);
    const shape=(c,p)=>P(c,tr(p)),stroke=(c,p,n)=>L(c,tr(p),n);
    shape(2,[15,36,21,38,18,44,11-stretch,48,6-stretch,50,6-stretch,47,13,42]);
    shape(2,[33,36,38,35,39,40,43+stretch,45,48+stretch,46,49+stretch,48,42+stretch,48,36,44]);
    shape(3,[8,35,12,26,19,23,25,23,32,25,36,24,39,21,45,22,46,31,42,37,37,42,28,45,21,48,13,47,8,42]);
    shape(4,[8,35,11,28,17,24,24,24,32,27,36,25,40,22,44,23,43,30,38,37,31,41,22,44,13,45,9,40]);
    shape(5,[10,32,13,27,19,24,25,25,30,27,26,28,20,27,16,29,13,32]);
    shape(6,[9,35,7,33,4,33,2,36,3,40,6,42,10,40]);shape(7,[7,34,4,34,3,37,6,37]);
    shape(3,[12,37,17,31,23,30,28,33,29,38,25,43,18,47,19+stretch,49,25+stretch,50,26+stretch,52,17+stretch,52,11,49,12,44]);
    shape(4,[12,37,16,32,21,30,25,32,26,36,23,40,18,43,13,45]);stroke(5,[15,35,19,32,22,32]);
    shape(6,[31,39,36,34,41,32,40,38,36,42,35,45,39+stretch,49,44+stretch,49,47+stretch,51,46+stretch,52,38+stretch,52,32,47]);
    shape(4,[36,25,35,18,31,10,29,4,31,3,35,7,39,14,42,22]);stroke(9,[31,6,34,10,38,18],2);
    shape(3,[39,23,39,14,41,6,44,2,46,2,46,8,43,19,44,23]);shape(5,[41,17,42,8,44,4,45,4,44,10]);stroke(9,[42,16,44,8]);
    shape(4,[34,24,38,19,44,18,49,20,51,24,55,26,56,29,53,31,48,31,44,34,39,33,36,30]);
    shape(5,[36,24,39,20,44,19,48,21,50,24,46,23,42,24,39,27]);shape(6,[44,28,48,26,54,28,54,30,48,31,45,32,41,31]);
    stroke(0,[46,24,48,24],2);D(7,47,24-jump);stroke(1,[54,27,56,27]);stroke(2,[51,30,53,30]);stroke(5,[52,29,57,30]);
  }
  function pheasant(a,t){
    const {poly:P,line:L,dot:D}=a;const wing=Math.sin(t);
    P(2,[58,30,44,31,28,35,4,38,2,40,35,39,53,36]);P(4,[61,29,46,29,29,32,2,33,0,35,33,36,51,34]);P(5,[56,29,37,30,16,33,3,33,5,34,32,33]);
    for(const x of [15,21,27,33,39,45])L(2,[x,33-(x>32?1:0),x+2,35-(x>32?1:0)]);
    L(2,[67,37,59,41,54,42,50,42]);L(5,[73,38,67,43,60,44,57,46]);L(4,[60,44,56,44]);
    P(2,[45,29,51,24,59,21,69,21,81,23,89,20,96,20,98,26,90,33,82,36,74,40,65,40,54,36]);
    P(3,[46,29,52,25,62,22,72,23,81,24,88,21,95,21,95,26,88,33,80,36,73,38,65,38,55,34]);
    P(4,[49,28,56,24,63,23,75,25,80,26,74,31,65,34,56,33]);P(5,[78,27,85,24,90,23,89,28,84,32,78,35,74,36]);
    for(const [x,y] of [[79,29],[83,28],[85,25],[77,32],[81,32],[73,35],[71,32],[66,36]])L(2,[x,y,x+2,y+1]);
    if(wing>=0){
      const hi=rounded(wing*15);
      P(2,[72,30,67,23,58,17-hi,49,16-hi,38,14-hi,40,18-hi,34,15-hi,37,21-hi,32,18-hi,36,24-hi,37,28-hi,48,32-hi*.5,58,32]);
      P(4,[72,29,66,23,57,18-hi,40,15-hi,46,21-hi,41,19-hi,47,26-hi,53,29-hi*.5,63,31]);
      P(5,[65,26,57,20-hi,46,18-hi,50,22-hi,55,24-hi,59,26-hi*.6]);
      L(3,[59,26-hi*.6,47,22-hi]);L(6,[54,21-hi,48,19-hi]);L(2,[59,30,49,27-hi*.7]);
    } else {
      const low=rounded(-wing*13);
      P(2,[71,27,62,27,50,31,39,34+low,39,37+low,43,36+low,43,40+low,49,37+low,49,39+low,57,35+low*.6,65,33]);
      P(4,[71,28,61,28,50,32,41,35+low,48,32+low,45,37+low,54,33+low*.6,65,31]);L(5,[65,29,55,30,48,34+low*.5]);
    }
    P(7,[84,23,89,20,93,20,94,24,91,26,88,26,88,24]);
    P(8,[88,21,88,16,91,12,96,11,100,13,102,17,100,22,96,25,92,25,89,23]);P(9,[90,18,91,14,96,12,99,14,98,17,94,19,92,23,90,22]);
    L(8,[91,14,88,10,89,14]);P(3,[94,17,97,15,100,16,101,18,99,21,96,21,93,20]);P(4,[94,17,97,16,99,16,98,19,95,20]);D(0,98,17);D(6,97,17);
    P(5,[100,17,105,17,109,19,103,20,100,20]);L(7,[101,17,105,17]);L(10,[90,16,92,14,95,13]);
  }
  const artists=Object.assign({elk,deer,boar,hare,fox,pheasant},...expansions.map(a=>a.artists));
  // Accent pixels stay inside the ordinary animal silhouette, preserving the field hit test.
  function signatureMark(id,a,t){
    const bob=.9*Math.cos(t*2);
    const fur=(color,path,thick=1)=>a.line(color,path.map((v,i)=>i%2?v+bob:v),thick);
    const patch=(color,path)=>a.poly(color,path.map((v,i)=>i%2?v+bob:v));
    switch(id){
      case 'brass-tusk':
        // A V-shaped notch at the edge of the ear and a long highlight in the tusk enamel.
        a.poly(2,[81,32,89,34,91,37,87,36,83,39,85,34]);
        a.line(5,[83,32,89,34,91,36]);a.line(4,[84,39,88,36]);
        a.line(7,[133,54,137,56,141,59,146,60,151,60,156,56],2);
        a.line(6,[141,52,146,54,151,54,155,52]);break;
      case 'cinderback':
        patch(5,[52,29,63,27,72,22,82,13,91,8,98,8,105,12,108,16,103,17,97,16,90,21,91,18,82,26,84,22,75,29,77,25,68,31,65,30,58,32]);
        patch(6,[70,24,81,15,91,9,97,9,103,12,96,12,88,16,82,22,81,20,73,26]);
        for(const [x,y] of [[46,28],[53,29],[61,27],[65,29],[72,25],[79,23],[85,18],[91,14],[97,12]])fur(6,[x-3,y+2,x,y,x+4,y-1]);
        fur(7,[84,15,90,12,94,11]);break;
      case 'embermane':
        a.poly(9,[95,34,100,24,107,19,111,18,106,23,101,27,98,35,98,31]);
        a.poly(10,[98,29,102,23,108,19,105,23,101,26]);
        a.poly(9,[101,42,105,34,112,28,115,28,111,33,107,39,104,46,104,40]);
        a.line(10,[103,39,106,34,110,31]);a.line(9,[110,49,113,43,117,39],2);
        a.line(2,[103,49,106,43,106,46]);break;
      case 'blue-hour':
        // Iridescent guard hairs follow the ridge of the back in the cold light.
        patch(9,[23,23,33,18,45,18,57,20,67,23,82,23,94,19,103,18,109,19,99,20,87,25,75,27,64,26,54,23,43,21,31,22,23,26]);
        fur(10,[26,22,34,20,44,20,55,22]);fur(10,[72,25,83,24,93,21,100,20]);
        fur(7,[35,18,42,18,48,19]);fur(5,[82,32,88,29,94,26]);break;
      case 'red-comet':
        a.poly(8,[32,23,40,20,50,19,59,16,67,15,70,10,71,14,77,10,76,14,82,10,84,14,79,16,72,16,64,19,57,22,55,20,48,23,45,22,38,24]);
        a.line(9,[37,22,46,20,53,20,61,17,69,16],2);
        a.line(10,[53,19,61,16,66,16]);a.line(9,[70,14,75,11]);a.line(10,[78,13,81,11]);
        a.line(9,[3+Math.sin(t)*2,4,5+Math.sin(t)*2,6,5+Math.sin(t)*2,9]);break;
      case 'fogbound':
        patch(8,[71,23,84,16,97,9,108,8,117,12,122,16,119,19,122,23,117,22,112,24,111,21,106,27,106,23,99,30,98,26,92,30,91,26,83,30,86,25,77,28]);
        patch(9,[77,23,87,16,99,10,108,10,117,14,111,14,103,16,97,20,97,17,90,23,90,20,82,25]);
        for(const [x,y] of [[71,26],[77,24],[83,22],[91,18],[97,15],[104,13],[111,14]])fur(10,[x-2,y+2,x,y,x+3,y-1]);
        fur(9,[89,31,95,26,99,24]);break;
    }
  }
  // Shade the painted colour blocks in small tonal steps. Sample within the silhouette
  // so the edge stays crisp and fur, markings and bare skin keep distinct colours.
  function modelSurface(data,w,h){
    const src=new Uint8ClampedArray(data);
    const radius=Math.max(2,Math.round(h*.045));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=4*(y*w+x);
      if(!src[i+3])continue;
      let sum=0,weight=0;
      const light=src[i]*.3+src[i+1]*.59+src[i+2]*.11;
      for(const [dx,dy] of sampleOffsets){
        const xx=x+dx*radius,yy=y+dy*radius;
        if(xx<0||yy<0||xx>=w||yy>=h)continue;
        const j=4*(yy*w+xx);if(!src[j+3])continue;
        const diff=(src[j]-src[i])*.3+(src[j+1]-src[i+1])*.59+(src[j+2]-src[i+2])*.11;
        if(Math.abs(diff)<78){sum+=diff;weight++;}
      }
      // Cool reflected light underneath, warmer highlights on upper-facing planes.
      const volume=7*Math.cos((y/h-.19)*Math.PI*1.3)-3;
      const tone=2*Math.round(((weight?sum/weight:0)*.62+volume)/2);
      const warm=(light/255-.38)*4;
      data[i]+=tone+warm;data[i+1]+=tone;data[i+2]+=tone-warm;
    }
  }
  const sampleOffsets=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  function sprite(species,phase,rare){
    const newFrame=window.TimberStride?.frame(species,phase,rare);
    if(newFrame)return newFrame;
    const key=artists[species]?species:'deer';
    const frame=((rounded((Number.isFinite(phase)?phase:0)*12/cycle)%12)+12)%12;
    const signature=typeof rare==='string'&&signatures[rare]?.species===key?rare:null;
    const palette=signature||(rare==='legend'?(key==='polar'?'aurora':'legend'):rare?'rare':key);
    const id=key+'-'+frame+'-'+palette;
    if(cache.has(id))return cache.get(id);
    const [w,h]=sizes[key];const surface=document.createElement('canvas');surface.width=w;surface.height=h;
    const ctx=surface.getContext('2d'),data=ctx.createImageData(w,h),px=new Uint32Array(data.data.buffer);
    const phaseFrame=frame*cycle/12;
    artists[key](painter(w,h,px,colors[palette]),phaseFrame);
    if(signature){
      const marks=new Uint32Array(px.length);
      signatureMark(signature,painter(w,h,marks,colors[palette]),phaseFrame);
      for(let i=0;i<px.length;i++)if(marks[i]&&px[i])px[i]=marks[i];
    }
    modelSurface(data.data,w,h);
    ctx.putImageData(data,0,0);const result={surface,w,h,px,phaseIndex:frame,phaseCount:12};cache.set(id,result);return result;
  }
  function bounds(species,height){const [w,h]=sizes[species]||sizes.deer;return {width:height*(window.TimberStride?.ratio(species)||w/h),height};}
  function draw(ctx,species,x,feetY,height,direction,phase,rare=false,prepareLanding=false){
    if(!(height>0))return;
    const s=sprite(species,phase,rare),width=height*s.w/s.h;
    if(prepareLanding)LandingArt.prime(species,s,rare);
    ctx.save();ctx.imageSmoothingEnabled=prepareLanding;ctx.imageSmoothingQuality='low';ctx.translate(x,feetY);if(direction<0)ctx.scale(-1,1);
    ctx.drawImage(s.surface,-width/2,-height,width,height);ctx.restore();
  }
  function hitTest(species,x,feetY,height,direction,phase,px,py,pad=0,coat=false){
    if(!(height>0))return false;
    const s=sprite(species,phase,coat),scale=s.h/height;
    const u=(px-x)*(direction<0?-1:1)*scale+s.w/2,v=(py-feetY)*scale+s.h,r=Math.max(0,pad*scale);
    const sx=Math.floor(u),sy=Math.floor(v);
    if(sx>=0&&sx<s.w&&sy>=0&&sy<s.h&&s.px[sy*s.w+sx])return true;
    if(!r || u+r<0 || v+r<0 || u-r>=s.w || v-r>=s.h)return false;
    for(let iy=Math.max(0,Math.floor(v-r));iy<Math.min(s.h,Math.ceil(v+r));iy++){
      for(let ix=Math.max(0,Math.floor(u-r));ix<Math.min(s.w,Math.ceil(u+r));ix++){
        if((ix+.5-u)**2+(iy+.5-v)**2<=r*r&&s.px[iy*s.w+ix])return true;
      }
    }
    return false;
  }
  window.TimberWildlife=Object.freeze({draw,bounds,hitTest,sprite});
})();
