'use strict';
const eaterAtlas=new Image();
eaterAtlas.src='assets/world-eater.webp';

// Coordinates are relative to the hinge behind the cheek. Both layers share
// registration so the lower teeth follow the jaw through the entire bite.
function drawEater(x,y,scale,opening,roll,alpha){
  if(!eaterAtlas.naturalWidth||alpha<=0)return;
  ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(roll);ctx.scale(scale,scale);
  ctx.save();ctx.translate(opening*25,opening*32);
  ctx.rotate((-49+opening*61)*Math.PI/180);
  ctx.drawImage(eaterAtlas,0,530,800,530,-583,-251,800,530);ctx.restore();
  ctx.drawImage(eaterAtlas,0,0,800,530,-583,-251,800,530);ctx.restore();
}
