import type {Drive} from './save';
import {INTRO_CRATE} from './smashObjects';
import {terrainAt} from './carPhysics';
/** Original local canvas artwork. Fixed six fragments, purely decorative. */
export function drawIntroSmash(c:CanvasRenderingContext2D,r:Drive,reduced:boolean){
 const o=INTRO_CRATE,y=terrainAt(o.x,r.track,r.bridges),state=r.smash;
 if(!state?.cleared.includes(o.id)){
  c.save();c.translate(o.x,y);c.fillStyle='#b96b3e';c.strokeStyle='#442c32';c.lineWidth=3;c.fillRect(-o.width,-o.height,o.width*2,o.height);c.strokeRect(-o.width,-o.height,o.width*2,o.height);
  c.strokeStyle='#efbe7a';c.lineWidth=6;c.strokeRect(-o.width+7,-o.height+7,o.width*2-14,o.height-14);
  c.beginPath();c.moveTo(-o.width+7,-7);c.lineTo(o.width-7,-o.height+7);c.stroke();c.restore();return;
 }
 const age=r.t-state.impactAt;if(age<0||age>1)return;
 c.save();c.globalAlpha=1-age;c.fillStyle='#ffe5a5';
 if(!reduced)for(let i=0;i<6;i++){const x=o.x+(i-2.5)*age*58,py=y-20-age*(70+i*13)+age*age*120;c.save();c.translate(x,py);c.rotate(age*(i%2?4:-4));c.fillRect(-7,-3,14,6);c.restore();}
 c.font='bold 20px sans-serif';c.textAlign='center';c.fillText('+3 ⬡',o.x,y-75-(reduced?0:age*20));c.restore();
}
