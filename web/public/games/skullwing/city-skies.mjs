const paintings=new Map();
const tau=Math.PI*2;
const wrap=(n,m)=>((n%m)+m)%m;
function load(city){
  if(!paintings.has(city.slug)&&typeof Image==='function'){
    const image=new Image();image.src=new URL(city.painting,import.meta.url).href;paintings.set(city.slug,image);
  }
  return paintings.get(city.slug);
}
function glow(c,x,y,r,color){
  c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,tau);c.fill();
}
function lantern(c,x,y,size){
  c.save();c.translate(x,y);c.scale(size,size);
  c.fillStyle='#5d3b60';c.fillRect(-2,-5,4,1.5);
  c.fillStyle='#e7996e';c.beginPath();c.ellipse(0,-.5,3.6,4,0,0,tau);c.fill();
  c.fillStyle='#ffd79b';c.fillRect(-.7,-3,1.4,4.9);c.fillStyle='#ac5f66';c.fillRect(-.65,3,.9,3.4);c.restore();
}
function satellite(c,x,y){
  c.save();c.translate(x,y);c.rotate(-.31);c.strokeStyle='#add3e9';c.lineWidth=.9;
  c.beginPath();c.moveTo(-8,0);c.lineTo(8,0);c.stroke();
  c.fillStyle='#8b9ec6';c.fillRect(-9,-2,6,3.4);c.fillRect(4,-2,6,3.4);
  c.fillStyle='#f3ddb9';c.fillRect(-1.6,-2,3.2,4);c.restore();
}
function balloon(c,x,y){
  c.fillStyle='#84695e';c.beginPath();c.ellipse(x,y,9,5.6,-.08,0,tau);c.fill();
  c.fillStyle='#c69f66';c.beginPath();c.ellipse(x,y-1.3,8,3.25,-.08,0,tau);c.fill();
  c.fillStyle='#685b50';c.fillRect(x-2,y+5,4,2.4);
}
export function drawCitySky(c,v,city,p){
  const {width,height,ground,camera=0,time=0,reduced=false}=v,t=reduced?0:time;
  const img=load(city);
  const sky=c.createLinearGradient(0,0,0,Math.max(ground,1));p.sky.forEach((color,i)=>sky.addColorStop(i/3,color));
  c.fillStyle=sky;c.fillRect(0,0,width,height);
  if(img?.complete&&img.naturalWidth){
    const ratio=Math.max((width+66)/img.naturalWidth,ground/img.naturalHeight);
    const w=img.naturalWidth*ratio,h=img.naturalHeight*ratio,margin=w-width;
    const travel=Math.min(margin*.65,Math.max(65,v.levelWidth? v.levelWidth*.095:160));
    const start=Math.max(0,Math.min(margin-travel,w*city.focus-width*.50-travel*.15));
    const pan=start+travel*Math.min(1,camera/Math.max(1,(v.levelWidth||1900)-width));
    c.drawImage(img,-pan,ground-h,w,h);
  }else{
    // A local silhouette keeps the street legible while its painting decodes.
    for(let i=-1;i<width/32+1;i++){
      const x=i*32-wrap(camera*.16,32),h=ground*(.17+.13*(1+Math.sin(i*2.5+v.district))*.5);
      c.fillStyle=p.skySide;c.fillRect(x,ground-h,24,h);
    }
  }
  c.save();
  const span=480,n=city.slug==='caldera-del-sol'||city.slug==='emerald-canopy'?13:4;
  for(let i=0;i<n;i++){
    const drift=city.slug==='orbit-city'?7:city.slug==='coral-keys'?9:2.2;
    const x=wrap(i*(span/n)+58-camera*.18+t*drift,span)-13;
    const y=ground*(.23+.35*wrap(i*.373+.15,1));
    for(let xx=x;xx<width+12;xx+=span){
      if(city.slug==='lantern-bay')lantern(c,xx,y+4*Math.sin(t*.39+i),.64+.14*(i%3));
      else if(city.slug==='orbit-city')satellite(c,xx,y+Math.sin(t*.45+i)*2);
      else if(city.slug==='clockwork-heights')balloon(c,xx,y+Math.sin(t*.44+i)*2);
      else if(city.slug==='coral-keys'){
        const flap=2+Math.sin(t*2.8+i)*1.2;
        c.strokeStyle='#526979';c.lineWidth=1;c.beginPath();c.moveTo(xx-5,y-flap);
        c.quadraticCurveTo(xx-2,y-flap*.8,xx,y);c.quadraticCurveTo(xx+2,y-flap,xx+5,y-flap);c.stroke();
      }else{
        const firefly=city.slug==='emerald-canopy';
        const yy=firefly?y+Math.sin(t*.73+i)*5:ground*(.64-wrap(i*.23+t*.035,.48));
        c.globalAlpha=.34+.35*(1+Math.sin(i+t*1.1))*.5;
        glow(c,xx,yy,firefly?1.35:.85,firefly?'#fcf29c':'#ffad71');c.globalAlpha=1;
      }
    }
  }
  c.restore();
}
