import { PILOT_X, VOYAGES } from './voyage';
import type { Flight, SkyObject } from './voyage';
export const laneHeight = (lane: number) => .25 + lane * .24;
type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

function ellipse(c: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fillStyle = color; c.fill();
}
function star(c: Ctx, x: number, y: number, r: number, color: string, points = 4) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = i * Math.PI / points - Math.PI / 2, size = i % 2 ? r * .38 : r;
    c.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
  }
  c.closePath(); c.fillStyle = color; c.fill();
}
function ring(c: Ctx, rx: number, ry: number, color: string, line: number) {
  c.beginPath(); c.ellipse(0, 0, rx, ry, -.14, 0, TAU); c.strokeStyle = color; c.lineWidth = line; c.stroke();
}
function bird(c: Ctx, t: number, color: string) {
  const wing = Math.sin(t) * 8;
  c.fillStyle = color; c.beginPath(); c.moveTo(-12, 4); c.quadraticCurveTo(-6, wing - 12, 1, 1);
  c.quadraticCurveTo(9, wing - 14, 14, -6); c.quadraticCurveTo(7, -4, 3, 3);
  c.quadraticCurveTo(0, 6, -7, 4); c.lineTo(-15, 9); c.closePath(); c.fill();
}
function object(c: Ctx, s: Flight, o: SkyObject, x: number, y: number, size: number) {
  c.save(); c.translate(x, y); c.scale(size, size);
  const color = VOYAGES[s.chapter].color;
  if (o.kind === 'storm') {
    const gradient = c.createLinearGradient(0, -22, 0, 15); gradient.addColorStop(0, '#9ea2c5'); gradient.addColorStop(.45, '#635b8b'); gradient.addColorStop(1, '#342c58');
    c.fillStyle = gradient; c.strokeStyle = '#d3c6e2'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-22, 9); c.bezierCurveTo(-43, 6, -35, -14, -23, -12); c.bezierCurveTo(-15, -31, 4, -28, 10, -15); c.bezierCurveTo(25, -20, 38, -5, 31, 5); c.bezierCurveTo(23, 14, 4, 9, -22, 9); c.fill(); c.stroke();
    c.fillStyle = '#ffd575'; c.beginPath(); c.moveTo(-3, 5); c.lineTo(-11, 22); c.lineTo(-1, 18); c.lineTo(-7, 34); c.lineTo(14, 10); c.lineTo(3, 15); c.lineTo(8, 5); c.fill();
  } else if (o.kind === 'bonus') {
    c.rotate(s.time * .4); star(c, 0, 0, 13, '#774320'); star(c, 0, 0, 10, '#ffe58d');
  } else {
    const halo = c.createRadialGradient(0,0,2,0,0,38); halo.addColorStop(0, color + 'aa'); halo.addColorStop(1, color + '00'); c.fillStyle = halo; c.fillRect(-38,-38,76,76);
    if (s.chapter === 0) {
      c.rotate(Math.sin(s.time + o.id) * .2);
      for (let i = 0; i < 5; i++) { c.rotate(TAU / 5); ellipse(c, 0, -10, 7, 12, '#ff9e8a'); ellipse(c, 0, -12, 4, 8, '#ffdcaa'); }
      ellipse(c, 0, 0, 7, 7, '#fff398');
    } else if (s.chapter === 1 || s.chapter === 5) {
      ring(c, 16, 24, '#322c40', 7); ring(c, 16, 24, o.lit || s.chapter === 5 ? '#98fff2' : '#eaa566', 4);
      for (let n = 0; n < 8; n++) ellipse(c, Math.cos(n * TAU/8) * 16, Math.sin(n * TAU/8) * 24, 2, 2, '#fff0ac');
      c.fillStyle = '#fff8c8'; c.textAlign = 'center'; c.font = 'bold 23px system-ui'; c.fillText(s.chapter === 5 ? '♪' : 'ϟ',0,8);
    } else if (s.chapter === 2) {
      c.scale(1.38,1.38); bird(c, s.time * 10 + o.id, o.lit ? '#ffea99' : '#f2f6ea'); if (o.lit) star(c, 0,-17,4,'#ffffcf');
    } else if (s.chapter === 3) {
      c.beginPath(); c.moveTo(8,-21); c.bezierCurveTo(-21,-24,-27,18,-2,23); c.bezierCurveTo(11,26,21,15,23,7); c.bezierCurveTo(1,16,-9,-7,8,-21);
      c.fillStyle = '#ffe7a4'; c.fill(); c.strokeStyle = '#a87ca0'; c.lineWidth = 2; c.stroke(); star(c,14,-8,5,'#fdf1be');
    } else {
      const correct = o.number === s.collected + 1;
      star(c,0,0,25,correct ? '#ffd883' : '#a7a9bc',5); ellipse(c,0,0,11,11,correct ? '#704c3b':'#495065');
      c.textAlign = 'center'; c.font = 'bold 14px system-ui'; c.fillStyle = '#fff'; c.fillText(String(o.number),0,5);
    }
  }
  c.restore();
}
export function paintFlight(c: Ctx, w: number, h: number, s: Flight, ship: HTMLImageElement, whale: HTMLImageElement, pilot?: HTMLCanvasElement, sky?: HTMLImageElement) {
  c.clearRect(0,0,w,h);
  if (sky?.naturalWidth) {
    const zoom = Math.max(w/sky.naturalWidth,h/sky.naturalHeight)*1.09;
    const sw = sky.naturalWidth*zoom, sh=sky.naturalHeight*zoom;
    const px=(sw-w)*(.5 + Math.sin(s.time*.043)*.36);
    c.drawImage(sky,-px,-(sh-h)*(.46+s.altitude*.05),sw,sh);
    c.fillStyle='#17294145'; c.fillRect(0,0,w,h);
  }
  const size = Math.min(1.55, Math.max(.74, Math.min(w / 460, h / 315)));
  const posY = (lane: number) => laneHeight(lane) * h;
  // Air currents provide a moving depth reference even above the painted cloud deck.
  for (let n = 0; n < 26; n++) {
    const x = w - ((n * 173 + s.time * (9 + n % 5 * 9)) % (w + 36));
    const y = h * (.13 + ((n * 37) % 76) / 100) + Math.sin(s.time + n) * 2;
    c.globalAlpha = .35 + (Math.sin(n + s.time) + 1) * .17;
    if (n % 3 === 0) star(c,x,y,3 * size,'#fff1b7'); else ellipse(c,x,y,5 * size,1,'#e7f9ff');
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    c.strokeStyle = i === s.lane ? '#fff5cd32' : '#f3ffff14'; c.lineWidth = 1;
    c.setLineDash([4,12]); c.lineDashOffset = s.time * 15; c.beginPath(); c.moveTo(0,posY(i)); c.lineTo(w,posY(i)); c.stroke();
  }
  c.setLineDash([]);
  const x = w * PILOT_X, y = posY(s.altitude) + Math.sin(s.time * 2.9) * 2 * size;
  if (s.chapter === 2) for (let i = 0; i < Math.min(s.collected,5); i++) {
    c.save(); c.translate(x - (30 + i * 11) * size,y + (12 + Math.sin(s.time * 3.7 + i) * 5 + i * 4) * size);
    c.scale(size * .62,size * .62); bird(c,s.time * 12 + i,'#fff2bf'); c.restore();
  }
  c.save(); c.translate(x,y); c.rotate((s.lane - s.altitude) * .14 + Math.sin(s.time * 2) * .018);
  const riding = s.chapter === 5, craft = riding ? whale : ship;
  const width = (riding ? 132 : 105) * size;
  const height = craft.naturalWidth ? width * craft.naturalHeight / craft.naturalWidth : width * .65;
  if (s.hit > .8) c.globalAlpha = .7;
  for (let n = 0; n < 3; n++) {
    c.beginPath(); c.moveTo(-width * .36,-2+n*3); c.quadraticCurveTo(-width*.61,-8 + n*5 + Math.sin(s.time*5)*4,-width*(.8+n*.07),5+n*2);
    c.strokeStyle = riding ? '#91f3e794' : '#ffd99e94'; c.lineWidth = size * (2 - n * .4); c.stroke();
  }
  if (craft.complete && craft.naturalWidth) {
    if (riding) {
      // A travelling wave bends the tail while the whale's face stays stable.
      const pieces=22;
      for (let i=0;i<pieces;i++) {
        const left=Math.floor(i*craft.naturalWidth/pieces),right=Math.floor((i+1)*craft.naturalWidth/pieces);
        const t=i/pieces, lift=Math.pow(1-t,2)*Math.sin(s.time*4.3-t*4)*height*.15;
        c.drawImage(craft,left,0,right-left,craft.naturalHeight,-width/2+width*left/craft.naturalWidth,-height*.54+lift,width*(right-left)/craft.naturalWidth+.45,height);
      }
    } else c.drawImage(craft,-width/2,-height*.54,width,height);
  }
  if (pilot) {
    const ph = (riding ? 24 : 20) * size, pw = ph * pilot.width / pilot.height;
    c.drawImage(pilot,width*(riding ? .17 : .12)-pw/2,riding ? -height*.3-ph : height*.22-ph,pw,ph);
  }
  if (s.shield > 0 || s.glow > 0) {
    c.globalAlpha = .72; const r = width*(.51+(1-Math.min(1,s.glow/.7))*.25); ring(c,r,r*.75,VOYAGES[s.chapter].color,2.4);
  }
  c.restore();
  for (const o of s.objects) object(c,s,o,o.x*w,posY(o.y),size);
  for (const p of s.motes) {
    const d = (.65-p.life)*65*size; c.globalAlpha = p.life/.65;
    star(c,p.x*w+Math.cos(p.angle)*d,posY(p.y)+Math.sin(p.angle)*d,4*size,p.color);
  }
  c.globalAlpha = 1;
}
