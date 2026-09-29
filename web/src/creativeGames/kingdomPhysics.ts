import {num} from './save';
export type Ride={id:number;x:number;y:number;vy:number;t:number;grounded:boolean;jumpHeld:boolean;checkpoint:number;found:number[];completed:boolean;portalAt:number;falls:number;platform:number};
export type MagicPlatform={x:number;y:number;w:number;id:number;pad:number;vx:number;vy:number};
export const STARTER_COURSE=[1,1,2,1,1,2,1,1,2,1];
export const PADS=[{x:360,y:302},{x:470,y:255},{x:680,y:252},{x:930,y:302},{x:1020,y:255},{x:1230,y:242},{x:1460,y:297},{x:1570,y:249},{x:1770,y:245},{x:1880,y:190}];
export const GROUND=[[0,320],[540,840],[1100,1360],[1610,2070]];
export function padAt(i:number,island:number){const p=PADS[i];return {x:p.x,y:p.y-(island===1&&i%2?18:island===2&&i%3===0?25:0)};}
export function magicPlatforms(layout:number[],island:number,t:number):MagicPlatform[]{
 const result:MagicPlatform[]=GROUND.map(([x,right],i)=>({x,y:335,w:right-x,id:0,pad:-i-1,vx:0,vy:0}));
 layout.forEach((id,i)=>{if(!id||!PADS[i])return;const p=padAt(i,island),w=id===1||id===4?190:id===9?115:90;let x=p.x-w/2,y=p.y,vx=0,vy=0;
  if(id===5){y+=Math.sin(t*1.25)*45;vy=Math.cos(t*1.25)*56.25;}if(id===6){x+=Math.sin(t)*55;vx=Math.cos(t)*55;}if(id===9)y-=30;
  if(id===8){for(let j=0;j<3;j++)result.push({x:p.x-80+j*45,y:p.y-j*23,w:50,id,pad:i,vx:0,vy:0});}else result.push({x,y,w,id,pad:i,vx,vy});
 });return result;
}
export function makeRide(id=1):Ride{return {id,x:75,y:335,vy:0,t:0,grounded:true,jumpHeld:false,checkpoint:75,found:[],completed:false,portalAt:-10,falls:0,platform:-1};}
export function friendPosition(friend:number,island:number){const p=padAt([2,5,8][friend],island);return {x:p.x+14,y:p.y-36};}
export function stepRide(r:Ride,layout:number[],island:number,input:{left:boolean;right:boolean;jump:boolean},dt=1/120){
 if(r.completed)return;dt=num(dt,0,1/60,1/120);r.t+=dt;const previousY=r.y,platforms=magicPlatforms(layout,island,r.t),oldPlatform=platforms.find(p=>p.pad===r.platform);
 let dx=(Number(input.right)-Number(input.left))*175;
 if(r.grounded&&oldPlatform){r.x+=oldPlatform.vx*dt;if(oldPlatform.id===4)dx*=1.45;}
 if(input.jump&&!r.jumpHeld&&r.grounded){r.vy=-410;r.grounded=false;}r.jumpHeld=input.jump;
 r.x=num(r.x+dx*dt,30,2040,75);r.vy+=850*dt;r.y+=r.vy*dt;r.grounded=false;r.platform=999;
 for(let i=0;i<layout.length;i++){const id=layout[i],p=padAt(i,island);if(id===3&&Math.abs(r.x-p.x)<34&&r.y>p.y-130&&r.y<p.y+85&&input.jump){r.vy=-170;r.y-=3;}if(id===12&&Math.abs(r.x-p.x)<40&&r.y>p.y-140&&r.y<p.y+50){r.vy=-180;}
  if(id===10&&input.jump&&r.t-r.portalAt>1.5&&Math.abs(r.x-p.x)<30&&Math.abs(r.y-p.y)<60){const next=layout.findIndex((v,j)=>v===10&&j>i);if(next>=0){const target=padAt(next,island);r.x=target.x;r.y=target.y-3;r.vy=0;r.portalAt=r.t;}}
 }
 for(const p of platforms){const top=p.y+(p.id===4?num((r.x-p.x)/p.w,0,1)*32:0);if(r.x>=p.x-9&&r.x<=p.x+p.w+9&&r.vy>=0&&previousY<=top+Math.max(10,Math.abs(p.vy)*dt+4)&&r.y>=top){r.y=top;r.vy=p.vy;r.grounded=true;r.platform=p.pad;if(p.id===2||p.id===7){r.vy=p.id===7?-560:-500;r.grounded=false;}if(p.pad<0)r.checkpoint=Math.max(r.checkpoint,p.x+35);}}
 for(let i=0;i<3;i++){const p=friendPosition(i,island);if(!r.found.includes(i)&&Math.hypot(r.x-p.x,(r.y-28)-p.y)<48)r.found.push(i);}
 if(r.y>600){r.x=r.checkpoint;r.y=320;r.vy=0;r.grounded=false;r.falls++;}
 if(r.x>1975&&r.found.length===3)r.completed=true;
}
