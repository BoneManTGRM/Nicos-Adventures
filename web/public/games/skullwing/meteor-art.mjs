// The streaks taper toward the wing tips. The fist stays visible at the head of the fall.
export function drawMeteorTrail(c,a,t,reduced) {
  const strength=Math.min(1,Math.max(0,-a.vy/410));
  if(!strength)return;
  c.save();c.translate(a.x,-a.y);c.scale(a.face,1);c.globalAlpha=(reduced?.40:.88)*strength;
  const length=reduced?65:145;
  for(let i=0;i<4;i++){
    const x=57-i*15,y=-18-i*24,w=7+i*.68;
    const tailX=x-length*(.28+i*.09),tailY=y-length*(.95+i*.08);
    const gradient=c.createLinearGradient(x,y,tailX,tailY);
    gradient.addColorStop(0,i%2?'#c4ffff':'#ffc6ff');gradient.addColorStop(.38,i%2?'#21c9ff':'#c354ff');gradient.addColorStop(1,'rgba(120,70,255,0)');
    c.fillStyle=gradient;c.beginPath();c.moveTo(x+w,y);
    c.quadraticCurveTo(x-9,y-22,tailX+Math.sin(t*15+i)*2,tailY);
    c.quadraticCurveTo(x-24,y-15,x-w,y+2);c.closePath();c.fill();
  }
  c.save();c.translate(58,-16);c.rotate(-.66);
  c.strokeStyle='#75f4ff';c.lineWidth=2.1;
  c.beginPath();c.ellipse(0,0,30,11,0,.10,Math.PI*.91);c.stroke();
  c.strokeStyle='#e2afff';c.lineWidth=1.2;
  c.beginPath();c.ellipse(0,-6,36,13,0,.05,Math.PI*.86);c.stroke();c.restore();
  c.restore();
}
export function drawMeteorImpact(c,ring,reduced) {
  const k=ring.age/ring.max,r=8+(1-(1-k)**2)*ring.size;
  c.save();c.globalAlpha=(1-k)*(reduced?.58:.92);
  for(let j=0;j<2;j++){
    c.strokeStyle=j?'#d5fbff':'#b273ff';c.lineWidth=(j?2:5)*(1-k)+.6;
    c.beginPath();c.ellipse(0,0,r*(j?.79:1),Math.max(1,r*.12),0,0,2*Math.PI);c.stroke();
  }
  for(let i=0;i<8;i++){
    const dir=i%2?1:-1,dist=r*(.35+(i%4)*.12),rise=(reduced?12:39)*Math.sin(k*Math.PI)*(.6+i%3*.2);
    c.fillStyle=i%3?'#a56bff':'#71e3ff';c.beginPath();
    c.moveTo(dir*dist,-rise-5);c.lineTo(dir*(dist+3),-rise);c.lineTo(dir*(dist+1),-rise+5);c.lineTo(dir*(dist-2),-rise);c.fill();
  }
  c.restore();
}
