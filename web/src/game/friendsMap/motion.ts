import type { Friend } from './simulation';
export type MotionSheets = Partial<Record<Friend,HTMLImageElement>>;
const rhythm: Record<Friend,number> = { nico: 10, becca: 11.2, lua: 9.5, boltbot: 7.5, sparky: 15 };
const phaseOffset: Record<Friend,number> = { nico: 0, becca: 1.4, lua: 3.2, boltbot: .8, sparky: 2.4 };
export function paintFriend(c: CanvasRenderingContext2D, art: HTMLCanvasElement, sheets: MotionSheets, friend: Friend, x: number, y: number, facing: number, moving: boolean, time: number, lift = 0, dash = false, trick = 0) {
  const phase = time * rhythm[friend] + phaseOffset[friend], bounce = moving ? Math.abs(Math.sin(phase)) : 0;
  c.save(); c.translate(x,y - lift - bounce * (friend === 'sparky' ? 4 : 2)); c.scale(facing,1);
  if (trick > 0) {
    const phase = 1-trick/.58, curve=Math.sin(phase*Math.PI);
    c.translate(0,-art.height*.46);
    if (friend==='nico' || friend==='sparky') c.rotate(phase*Math.PI*2);
    else if (friend==='boltbot') {
      for (const side of [-1,1]) {
        c.fillStyle='#83f7f3';c.beginPath();c.moveTo(side*9-3,art.height*.37);c.lineTo(side*9,art.height*(.51+curve*.22));c.lineTo(side*9+3,art.height*.37);c.fill();
      }
      c.rotate(curve*-.22);
    } else { c.scale(Math.cos(phase*Math.PI*2),1); c.rotate(curve*(friend==='lua'?.18:-.26)); }
    c.translate(0,art.height*.46);
  }
  const sheet = sheets[friend];
  if (sheet && (moving || lift > 2)) {
    const frame = lift > 3 ? 3 : [0,2,1,2][Math.floor(phase * (dash ? 1.8 : 1.3)) % 4];
    const side = sheet.naturalHeight, drawSize = art.height * (friend === 'sparky' ? 1.35 : 1.14);
    c.rotate(dash ? .08 : 0); c.drawImage(sheet,frame*side,0,side,side,-drawSize/2,-drawSize*151/160,drawSize,drawSize);
  } else {
    // Keep the selected Nico outfit. Pivot the two legs independently below the jacket.
    c.rotate(dash ? .13 : moving ? Math.sin(phase)*.034 : 0);
    const w=art.width,h=art.height,hip=Math.round(h*.69),leg=h-hip,half=Math.floor(w/2);
    if (friend==='nico' && (moving || lift>1)) {
      for (let i=0;i<2;i++) {
        const left=i?half:0, width=i?w-half:half;
        c.save(); c.translate(-w/2+left+width/2,-leg); c.rotate((i?1:-1)*(lift? .20:Math.sin(phase)*.18));
        c.drawImage(art,left,hip,width,leg,-width/2,-1,width,leg+1); c.restore();
      }
      c.drawImage(art,0,0,w,hip+1,-w/2,-h,w,hip+1);
    } else c.drawImage(art,-w/2,-h,w,h);
  }
  c.restore();
}
