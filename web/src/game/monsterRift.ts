import type { MonsterRecord } from '../types';
export const RIFT_WIDTH=960,RIFT_HEIGHT=640;
export type Point={x:number;y:number};
export type RiftInput={x:number;y:number;fire:boolean;power:boolean};
export type Enemy=Point&{id:number;hp:number;maxHp:number;boss:boolean;clock:number;flash:number};
export type Bolt=Point&{id:number;vx:number;vy:number;life:number;friendly:boolean};
export type Pickup=Point&{id:number;kind:'baby'|'heart'|'gem'};
export type RiftState={status:'ready'|'playing'|'paused'|'rest'|'won';player:Point;facing:number;level:number;health:number;score:number;rescued:number;combo:number;comboTime:number;time:number;shotCooldown:number;powerCooldown:number;invulnerable:number;powerFlash:number;traveled:number;shotsFired:number;powerUses:number;nextId:number;enemies:Enemy[];bolts:Bolt[];pickups:Pickup[];portal:boolean;notice:string};
export const PILLARS=[{x:250,y:215,r:38},{x:710,y:215,r:38},{x:250,y:435,r:38},{x:710,y:435,r:38}];
export const RIFT_EXIT={x:480,y:66};
export const riftDistance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function riftFree(p:Point,r=20):boolean{return Number.isFinite(p.x+p.y)&&p.x>=r+20&&p.y>=r+20&&p.x<=RIFT_WIDTH-r-20&&p.y<=RIFT_HEIGHT-r-20&&!PILLARS.some(o=>riftDistance(o,p)<r+o.r);}
function move(p:Point,dx:number,dy:number,r=20):void{if(riftFree({x:p.x+dx,y:p.y},r))p.x+=dx;if(riftFree({x:p.x,y:p.y+dy},r))p.y+=dy;}
export function clearSight(a:Point,b:Point):boolean{const d=riftDistance(a,b),n=Math.ceil(d/18);for(let i=1;i<n;i++)if(!riftFree({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},2))return false;return true;}
function stage(s:RiftState){s.player={x:480,y:520};s.bolts=[];s.portal=false;s.notice='';s.invulnerable=1.5;s.enemies=Array.from({length:3+s.level},(_,i)=>({id:s.nextId++,x:130+i*140,y:i%2?115:160,hp:2+s.level,maxHp:2+s.level,boss:false,clock:2+i*.7,flash:0}));if(s.level===3)s.enemies.push({id:s.nextId++,x:480,y:185,hp:16,maxHp:16,boss:true,clock:2,flash:0});s.pickups=[{id:s.nextId++,x:105,y:320,kind:'baby'},{id:s.nextId++,x:855,y:320,kind:'baby'},{id:s.nextId++,x:480,y:280,kind:'baby'},{id:s.nextId++,x:125,y:540,kind:'heart'},{id:s.nextId++,x:835,y:540,kind:'heart'}];}
export function createRift():RiftState{const s:RiftState={status:'ready',player:{x:480,y:520},facing:1,level:1,health:100,score:0,rescued:0,combo:0,comboTime:0,time:0,shotCooldown:0,powerCooldown:0,invulnerable:0,powerFlash:0,traveled:0,shotsFired:0,powerUses:0,nextId:1,enemies:[],bolts:[],pickups:[],portal:false,notice:''};stage(s);return s;}
export function pauseRift(s:RiftState){if(s.status==='playing')s.status='paused';}
export function powerKind(power:string):'shield'|'heal'|'dash'|'burst'{return /shield|invisibility/i.test(power)?'shield':/healing|plant|moonlight/i.test(power)?'heal':/jump|teleport/i.test(power)?'dash':'burst';}
function hitPlayer(s:RiftState,n:number){if(s.invulnerable>0)return;s.health=Math.max(0,s.health-n);s.invulnerable=.8;s.combo=0;if(s.health===0){s.status='rest';s.bolts=[];}}
function hitEnemy(s:RiftState,e:Enemy,n:number){if(e.hp<=0)return;e.hp-=n;e.flash=.15;if(e.hp<=0){s.combo=s.comboTime>0?Math.min(5,s.combo+1):1;s.comboTime=3;s.score+=(e.boss?200:30)*s.combo;s.pickups.push({id:s.nextId++,x:e.x,y:e.y,kind:'gem'});}}
function tick(s:RiftState,input:RiftInput,dt:number,power:string){
 s.time+=dt;s.shotCooldown=Math.max(0,s.shotCooldown-dt);s.powerCooldown=Math.max(0,s.powerCooldown-dt);s.invulnerable=Math.max(0,s.invulnerable-dt);s.powerFlash=Math.max(0,s.powerFlash-dt);s.comboTime=Math.max(0,s.comboTime-dt);if(!s.comboTime)s.combo=0;
 const x=Number.isFinite(input.x)?clamp(input.x,-1,1):0,y=Number.isFinite(input.y)?clamp(input.y,-1,1):0,norm=Math.max(1,Math.hypot(x,y)),before={...s.player};
 if(input.power&&s.powerCooldown===0){input.power=false;s.powerCooldown=5;s.powerFlash=.5;s.powerUses++;const kind=powerKind(power);if(kind==='shield')s.invulnerable=2.5;else if(kind==='heal')s.health=Math.min(100,s.health+25);else if(kind==='dash'){s.invulnerable=1;for(let i=0;i<15;i++)move(s.player,(x||(!y?s.facing:0))/norm*7,y/norm*7);}else for(const e of s.enemies)if(riftDistance(e,s.player)<220&&clearSight(s.player,e))hitEnemy(s,e,5);}
 move(s.player,x/norm*220*dt,y/norm*220*dt);s.traveled+=riftDistance(before,s.player);if(x)s.facing=x<0?-1:1;
 const targets=s.enemies.filter(e=>e.hp>0&&clearSight(s.player,e)).sort((a,b)=>riftDistance(a,s.player)-riftDistance(b,s.player));
 if(input.fire&&s.shotCooldown===0&&s.bolts.length<36){const target=targets[0],d=target?Math.max(1,riftDistance(target,s.player)):1;s.bolts.push({id:s.nextId++,...s.player,vx:target?(target.x-s.player.x)/d*470:0,vy:target?(target.y-s.player.y)/d*470:-470,life:2,friendly:true});s.shotCooldown=.28;s.shotsFired++;}
 for(const e of s.enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-dt);e.clock-=dt;const d=Math.max(1,riftDistance(e,s.player)),radius=e.boss?40:21;if(d>radius+28)move(e,(s.player.x-e.x)/d*(e.boss?32:38+s.level*6)*dt,(s.player.y-e.y)/d*(e.boss?32:38+s.level*6)*dt,radius);else hitPlayer(s,8);if(e.clock<=0&&s.bolts.length<36&&clearSight(e,s.player)){e.clock=e.boss?1.8:4.5;s.bolts.push({id:s.nextId++,x:e.x,y:e.y,vx:(s.player.x-e.x)/d*(e.boss?110:82),vy:(s.player.y-e.y)/d*(e.boss?110:82),life:5,friendly:false});}}
 for(const b of s.bolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(!riftFree(b,4)){b.life=0;continue;}if(b.friendly){const e=s.enemies.find(e=>e.hp>0&&riftDistance(e,b)<(e.boss?44:25));if(e){hitEnemy(s,e,1);b.life=0;}}else if(riftDistance(b,s.player)<25){hitPlayer(s,9);b.life=0;}}
 s.bolts=s.bolts.filter(b=>b.life>0);s.enemies=s.enemies.filter(e=>e.hp>0);
 s.pickups=s.pickups.filter(p=>{if(riftDistance(p,s.player)>32)return true;if(p.kind==='baby'){s.rescued++;s.score+=75;}else if(p.kind==='heart'){if(s.health>=100)return true;s.health=Math.min(100,s.health+25);}else s.score+=10;return false;});
 s.portal=s.enemies.length===0&&!s.pickups.some(p=>p.kind==='baby');
 if(s.status==='playing'&&s.portal&&riftDistance(s.player,RIFT_EXIT)<45){if(s.level===3){s.status='won';s.score+=Math.round(s.health)*5;s.bolts=[];}else{s.level++;s.health=Math.min(100,s.health+30);s.powerCooldown=0;stage(s);}}
}
export function stepRift(s:RiftState,input:RiftInput,delta:number,power:string){if(s.status!=='playing'||!Number.isFinite(delta)||delta<=0)return;let left=Math.min(delta,.05);while(left>1e-6&&s.status==='playing'){const dt=Math.min(left,1/120);tick(s,input,dt,power);left-=dt;}}
export const RIFT_SAMPLE:MonsterRecord={id:'rift-guest',name:'Glimmer',body:'Dragon',eyes:'Three eyes',horns:'Crystal horns',wings:'Star wings',color:'Aqua',pattern:'Galaxy',power:'Rainbow shield',personality:'Curious',friendship:1,habitat:'Crystal Cave',mouth:'Fang smile',arms:'Claw arms',legs:'Dinosaur legs',tail:'Dragon tail',texture:'Crystal',animation:'Bounce'};
