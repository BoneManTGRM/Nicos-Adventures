import { PILLARS, RIFT_EXIT, RIFT_HEIGHT, RIFT_WIDTH } from './monsterRift';
import type { RiftState } from './monsterRift';
const THEMES=[['#122b46','#28415a','#77dccc'],['#2e244a','#4b375c','#dcc480'],['#172e4f','#314567','#bdacf1']];
let cached:{level:number;art:HTMLCanvasElement}|null=null;
export function releaseRiftArt(){if(cached){cached.art.width=cached.art.height=1;cached=null;}}
function circle(c:CanvasRenderingContext2D,x:number,y:number,r:number,fill:string){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function background(level:number):HTMLCanvasElement{
 if(cached?.level===level)return cached.art;releaseRiftArt();const art=document.createElement('canvas');art.width=RIFT_WIDTH;art.height=RIFT_HEIGHT;const c=art.getContext('2d')!,[base,tile,accent]=THEMES[level-1];
 c.fillStyle=base;c.fillRect(0,0,art.width,art.height);c.strokeStyle=tile;c.lineWidth=1;
 for(let x=0;x<art.width;x+=64)for(let y=0;y<art.height;y+=64){c.strokeRect(x,y,64,64);if((x+y)%128===0){c.fillStyle=tile+'44';c.fillRect(x+2,y+2,60,60);}}
 c.strokeStyle=accent;c.lineWidth=4;c.strokeRect(20,20,920,600);c.strokeStyle=accent+'55';c.lineWidth=2;c.strokeRect(28,28,904,584);
 for(const p of PILLARS){c.fillStyle='#06142266';c.beginPath();c.ellipse(p.x,p.y+30,48,20,0,0,Math.PI*2);c.fill();c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(p.x+Math.cos(a)*p.r,p.y+Math.sin(a)*p.r);}c.closePath();c.fillStyle=tile;c.fill();c.strokeStyle=accent;c.lineWidth=3;c.stroke();c.beginPath();c.moveTo(p.x,p.y-30);c.lineTo(p.x+13,p.y);c.lineTo(p.x,p.y+15);c.lineTo(p.x-13,p.y);c.closePath();c.fillStyle=accent;c.fill();}
 for(let i=0;i<8;i++){const x=70+i*116;c.strokeStyle=accent+'77';c.beginPath();c.moveTo(x,32);c.lineTo(x+12,44);c.lineTo(x,56);c.lineTo(x-12,44);c.closePath();c.stroke();}
 cached={level,art};return art;
}
export function drawRift(c:CanvasRenderingContext2D,s:RiftState,w:number,h:number){
 const scale=Math.min(1.2,Math.max(.72,w/1000)),vw=w/scale,vh=h/scale;
 const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
 const x=vw>=RIFT_WIDTH?(RIFT_WIDTH-vw)/2:clamp(s.player.x-vw/2,0,RIFT_WIDTH-vw),y=vh>=RIFT_HEIGHT?(RIFT_HEIGHT-vh)/2:clamp(s.player.y-vh/2,0,RIFT_HEIGHT-vh);
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#081624';c.fillRect(0,0,w,h);c.setTransform(scale,0,0,scale,-x*scale,-y*scale);c.drawImage(background(s.level),0,0);
 c.strokeStyle=s.portal?'#a0f8cf':'#66848d';c.lineWidth=s.portal?8:3;c.beginPath();c.ellipse(RIFT_EXIT.x,RIFT_EXIT.y,42,27,0,0,Math.PI*2);c.stroke();
 if(s.portal){c.fillStyle='#112d3d';c.font='bold 20px system-ui';c.textAlign='center';c.fillStyle='#c3ffe0';c.fillText('↑',RIFT_EXIT.x,RIFT_EXIT.y+7);}
 for(const p of s.pickups){if(p.kind==='baby'){circle(c,p.x,p.y,21,'#eadcaf');circle(c,p.x-6,p.y-2,3,'#223442');circle(c,p.x+6,p.y-2,3,'#223442');c.strokeStyle='#ae89ce';c.lineWidth=3;c.strokeRect(p.x-25,p.y-25,50,50);c.beginPath();c.moveTo(p.x-25,p.y+8);c.lineTo(p.x+25,p.y+8);c.stroke();}else if(p.kind==='heart'){c.fillStyle='#83edbf';c.fillRect(p.x-6,p.y-16,12,32);c.fillRect(p.x-16,p.y-6,32,12);}else{c.beginPath();c.moveTo(p.x,p.y-11);c.lineTo(p.x+8,p.y);c.lineTo(p.x,p.y+11);c.lineTo(p.x-8,p.y);c.closePath();c.fillStyle='#ffdf7f';c.fill();}}
 for(const e of s.enemies){const r=e.boss?43:23,bob=Math.sin(s.time*3+e.id)*3;circle(c,e.x,e.y+12,r,'#030b2033');circle(c,e.x,e.y+bob,r,e.flash?'#ffefa8':e.boss?'#7964ad':'#ae80c0');circle(c,e.x-r*.3,e.y-4+bob,r*.2,'#e8f8fd');circle(c,e.x+r*.3,e.y-4+bob,r*.2,'#e8f8fd');circle(c,e.x-r*.3,e.y-4+bob,3,'#17203b');circle(c,e.x+r*.3,e.y-4+bob,3,'#17203b');c.strokeStyle='#2c2d50';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y+6+bob,r*.25,0,Math.PI);c.stroke();c.fillStyle='#15273b';c.fillRect(e.x-r,e.y-r-12,r*2,5);c.fillStyle='#ffe09b';c.fillRect(e.x-r,e.y-r-12,r*2*Math.max(0,e.hp/e.maxHp),5);if(e.boss){c.fillStyle='#f8cf70';c.beginPath();c.moveTo(e.x-28,e.y-43);c.lineTo(e.x-23,e.y-64);c.lineTo(e.x,e.y-51);c.lineTo(e.x+23,e.y-64);c.lineTo(e.x+28,e.y-43);c.closePath();c.fill();}}
 for(const b of s.bolts)circle(c,b.x,b.y,b.friendly?6:10,b.friendly?'#fff3b0':'#d097f0');
 if(s.invulnerable>0){c.strokeStyle='#8bf2dd';c.lineWidth=3;c.beginPath();c.arc(s.player.x,s.player.y-14,49,0,Math.PI*2);c.stroke();}
 if(s.powerFlash>0){c.strokeStyle='#fae8ad';c.lineWidth=3;c.beginPath();c.arc(s.player.x,s.player.y,180*(1-s.powerFlash/.5),0,Math.PI*2);c.stroke();}
 c.setTransform(1,0,0,1,0,0);return{scale,x,y};
}
