import { paintFriend } from '../friendsMap/motion';
import type { MapAssets } from '../friendsMap/renderer';
import { COURSES, ledgeAt, POWERS, relicAt } from './levels';
import { count, gustAt, nextObjective } from './platformer';
import type { Run } from './platformer';
import grove from '../../assets/canopy/grove.webp';
import grotto from '../../assets/canopy/grotto.webp';
import roost from '../../assets/canopy/roost.webp';
import ledges from '../../assets/canopy/ledges.webp';
import guardian from '../../assets/canopy/guardian.webp';
import owlet from '../../assets/canopy/owlet.webp';
import relay from '../../assets/canopy/relay.webp';
export const scenery = [grove, grotto, roost];
type C = CanvasRenderingContext2D;
export type Painting = {
  sky: HTMLImageElement;
  terrain: HTMLImageElement;
  guardian: HTMLImageElement;
  chick: HTMLImageElement;
  lamp: HTMLImageElement | null;
};
function load(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error('Scene artwork unavailable'));
    im.src = url;
  });
}
export async function loadPainting(stage: number): Promise<Painting> {
  const [sky, terrain, owl, chick, lamp] = await Promise.all([
    load(scenery[stage]),
    load(ledges),
    load(guardian),
    load(owlet),
    load(relay).catch(() => null),
  ]);
  return { sky, terrain, guardian: owl, chick, lamp };
}
export function viewFor(width: number, height: number) {
  const scale = Math.min(width / 337, height / 300, 1.85);
  return { scale, width: width / scale, height: height / scale };
}
const tau = Math.PI * 2;
function oval(c: C, x: number, y: number, rx: number, ry: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, tau);
  c.fill();
}
function glint(c: C, x: number, y: number, r: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4,
      v = k % 2 ? r * 0.25 : r;
    c.lineTo(x + Math.cos(a) * v, y + Math.sin(a) * v);
  }
  c.closePath();
  c.fill();
}
function glow(c: C, x: number, y: number, r: number, color: string) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color + 'b0');
  g.addColorStop(1, color + '00');
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}
function owl(
  c: C,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  t: number,
  big = false,
  facingLeft = true,
) {
  const cell = img.height,
    frame = big ? [0, 1, 2, 1][Math.floor(t * 4) % 4] : Math.floor(t * 5) % 2;
  c.save();
  c.translate(x, y);
  c.scale(facingLeft ? 1 : -1, 1);
  c.drawImage(
    img,
    cell * frame,
    0,
    cell,
    cell,
    -size * (big ? 103 / 256 : 0.5),
    -size * (big ? 145 / 256 : 89 / 128),
    size,
    size,
  );
  c.restore();
}
function feather(c: C, x: number, y: number, t: number) {
  c.save();
  c.translate(x, y);
  c.rotate(0.45 + Math.sin(t * 2) * 0.12);
  glow(c, 0, 0, 22, '#ffc56b');
  c.fillStyle = '#ffdd7a';
  c.strokeStyle = '#754d28';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(0, 15);
  c.bezierCurveTo(-18, 1, -8, -15, 5, -21);
  c.bezierCurveTo(13, -7, 12, 2, 3, 8);
  c.lineTo(6, 1);
  c.lineTo(0, 10);
  c.closePath();
  c.fill();
  c.stroke();
  c.strokeStyle = '#fffaac';
  c.beginPath();
  c.moveTo(-2, 17);
  c.quadraticCurveTo(5, 0, 5, -14);
  c.stroke();
  c.restore();
}
function chime(c: C, x: number, y: number, t: number, lit: boolean) {
  c.save();
  c.translate(x, y);
  c.rotate(Math.sin(t * 2) * 0.08);
  glow(c, 0, 0, lit ? 23 : 32, lit ? '#7ef2e0' : '#ffda78');
  c.fillStyle = lit ? '#71a7a1' : '#e4a94d';
  c.strokeStyle = '#603d25';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-12, 7);
  c.quadraticCurveTo(-7, 1, -7, -5);
  c.bezierCurveTo(-6, -17, 7, -17, 8, -4);
  c.quadraticCurveTo(8, 1, 12, 7);
  c.closePath();
  c.fill();
  c.stroke();
  oval(c, 1, 9, 3, 3, '#ffe39a');
  c.restore();
}
function lamp(c: C, art: Painting, x: number, y: number, lit: boolean, finish: boolean, t: number) {
  const h = finish ? 79 : 49,
    frame = lit ? 2 : finish ? 1 : 0;
  if (lit) glow(c, x, y - h * 0.61, h * 0.6, '#86ffe1');
  if (art.lamp) c.drawImage(art.lamp, frame * 128, 0, 128, 160, x - h * 0.4, y - h, h * 0.8, h);
  else {
    c.fillStyle = '#6e4a29';
    c.fillRect(x - 3, y - h + 10, 6, h - 10);
    glow(c, x, y - h + 8, 18, lit ? '#9affdf' : '#ffc774');
    oval(c, x, y - h + 8, 7, 9, lit ? '#aeffe9' : '#ffd989');
  }
  if (finish) glint(c, x, y - h - 4 + Math.sin(t * 3) * 3, 6, '#fff4b7');
}
export function paintCanopy(
  c: C,
  w: number,
  h: number,
  art: Painting,
  cast: MapAssets,
  s: Run,
  cam: number,
  reduced: boolean,
) {
  const level = COURSES[s.stage],
    v = viewFor(w, h),
    time = s.time,
    sw = v.width,
    sh = v.height;
  const horizon = Math.max(0, sh - 420) * 0.52 + Math.min(0, sh - 420) * 0.69;
  const groundOffset = horizon;
  const bgZoom = Math.max(w / art.sky.width, h / art.sky.height) * 1.12;
  const bw = art.sky.width * bgZoom,
    bh = art.sky.height * bgZoom;
  const pan = Math.min(1, Math.max(0, cam / (level.end - sw * 0.65)));
  c.drawImage(art.sky, -(bw - w) * (0.06 + 0.88 * pan), -(bh - h) * 0.43, bw, bh);
  c.fillStyle = s.stage === 1 ? '#05113223' : '#14302c1d';
  c.fillRect(0, 0, w, h);
  c.save();
  c.scale(v.scale, v.scale);
  c.translate(0, groundOffset);
  // Distant motes move at a fraction of the foreground speed.
  for (let i = 0; i < (reduced ? 8 : 25); i++) {
    const px =
      ((((i * 127 - cam * 0.16 + (reduced ? 0 : time * ((i % 3) + 1) * 2)) % (sw + 40)) + sw + 40) %
        (sw + 40)) -
      15;
    const py = 75 + ((i * 41) % 236) + (reduced ? 0 : Math.sin(time + i) * 5);
    if (i % 4 === 0) glint(c, px, py, 2.8, '#fff1bba8');
    else oval(c, px, py, 1.5, 1.5, '#e4faff99');
  }
  c.translate(-cam, 0);
  const visible = (x: number, margin = 120) => x > cam - margin && x < cam + sw + margin;
  const nestGround = level.ledges.filter((p) => p.kind !== 'perch').at(-1)!.y;
  // The guardian banks above the landing platform as her chicks approach.
  if (visible(level.end, 270) && !s.won) {
    const gx = level.end - 22 + Math.sin(time * 0.76) * 25,
      gy = nestGround - 125 + Math.sin(time * 1.8) * 9;
    glow(c, gx, gy - 12, 48, level.color);
    owl(c, art.guardian, gx, gy, s.stage === 2 ? 158 : 113, time, true);
  }
  for (let i = 0; i < level.ledges.length; i++) {
    const ledge = level.ledges[i],
      p = ledgeAt(ledge, time);
    if (p.x + p.width < cam - 5 || p.x > cam + sw + 5) continue;
    const clock = s.crumbles[i];
    if (clock > 0 && clock < 1.75) {
      c.globalAlpha = 0.19;
      c.setLineDash([4, 5]);
      c.strokeStyle = '#a4ffec';
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x + p.width, p.y);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      continue;
    }
    let ly = p.y;
    if (clock > 1.75 && !reduced) ly += Math.sin(time * 48) * 2;
    if (ledge.kind === 'lift') {
      c.strokeStyle = '#f2e8b88c';
      c.lineWidth = 1.5;
      for (const q of [0.22, 0.78]) {
        c.beginPath();
        c.moveTo(p.x + p.width * q, ly + 5);
        c.lineTo(ledge.x + ledge.width * q, ly - 80);
        c.stroke();
        oval(c, ledge.x + ledge.width * q, ly - 80, 3, 3, '#f4cd8a');
      }
    }
    const height = Math.min(125, Math.max(61, p.width * 0.55)),
      top = ly - (14 * height) / 144;
    c.drawImage(art.terrain, 1, s.stage * 144, 510, 144, p.x - 2, top, p.width + 4, height);
    if (ledge.kind === 'crumble') {
      c.strokeStyle = clock ? '#fff3c4' : '#8bfff3';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(p.x + p.width * 0.38, ly + 3);
      c.lineTo(p.x + p.width * 0.46, ly + 14);
      c.lineTo(p.x + p.width * 0.43, ly + 19);
      c.lineTo(p.x + p.width * 0.51, ly + 28);
      c.stroke();
    }
    if (ledge.kind === 'spring') {
      for (let j = 0; j < 3; j++) {
        const px = p.x + p.width * (0.28 + j * 0.22);
        c.strokeStyle = '#cdf6da';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(px - 5, ly - 6);
        c.lineTo(px, ly - 11);
        c.lineTo(px + 5, ly - 6);
        c.stroke();
      }
    }
    if (level.saves.includes(i)) lamp(c, art, p.x + 26, ly, s.checkpoint >= i, false, time);
  }
  for (const x of level.gusts)
    if (visible(x)) {
      const gust = gustAt(x, time);
      if (gust.warning || gust.active)
        for (let j = 0; j < 5; j++) {
          const y = 290 - (((reduced ? 0 : time * (gust.active ? 90 : 33)) + j * 21) % 100);
          c.strokeStyle = gust.active ? '#e0fff6a6' : '#fff4c85c';
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(x - 12 + j * 6, y + 15);
          c.quadraticCurveTo(x + 7 + j * 5, y + 5, x - 5 + j * 6, y - 7);
          c.stroke();
        }
    }
  level.owlets.forEach((r, i) => {
    const p = relicAt(level, r, time);
    if (!s.owls[i] && visible(p.x)) {
      const y = p.y + Math.sin(time * 3 + i) * 4;
      glow(c, p.x, y - 9, 24, '#afece7');
      owl(c, art.chick, p.x, y, 45, time + i);
      if (!reduced && i % 2 === 0) glint(c, p.x + 16, y - 23, 3, '#fff5bd');
    }
  });
  level.feathers.forEach((r, i) => {
    const p = relicAt(level, r, time);
    if (!s.feathers[i] && visible(p.x)) feather(c, p.x, p.y + Math.sin(time * 2 + i) * 4, time + i);
  });
  level.chimes.forEach((r, i) => {
    const p = relicAt(level, r, time);
    if (visible(p.x)) chime(c, p.x, p.y, time + i, s.chimes[i]);
  });
  if (visible(level.end)) lamp(c, art, level.end + 22, nestGround, s.won, true, time);
  const collected = count(s.owls);
  for (let i = 0; i < collected; i++) {
    const pos = s.trail[Math.min(s.trail.length - 1, 5 + i * 6)];
    if (!pos) continue;
    owl(
      c,
      art.chick,
      pos.x - s.facing * (15 + i * 4),
      pos.y - 16 + Math.sin(time * 4 + i) * 6,
      26,
      time + i,
      false,
      s.facing < 0,
    );
  }
  if (!s.won) {
    const flying = s.ground < 0,
      active = s.ability > 0 ? s.abilityFriend : null;
    if (active === 'becca') {
      const ax = (s.originX + s.anchorX) / 2,
        ay = Math.min(s.anchorY, s.originY) - 145;
      c.strokeStyle = '#365832';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(ax, ay);
      c.quadraticCurveTo(s.x - 18, s.y - 95, s.x + 4, s.y - 32);
      c.stroke();
      oval(c, ax, ay, 6, 4, '#9ddd89');
      oval(c, ax + 3, ay - 4, 3, 7, '#b3df85');
    }
    if (active === 'boltbot' || active === 'lua' || active === 'sparky') {
      const col = POWERS[active].color;
      for (let i = 0; i < 7; i++) {
        const px = s.x - s.facing * (6 + i * 3),
          py = s.y + (active === 'boltbot' ? i * 3 : -10 + Math.sin(time * 9 + i) * 4);
        glint(c, px, py, 4 - i * 0.35, col);
      }
    }
    if (s.ground >= 0) oval(c, s.x, s.y + 1, 15, 3, '#21282d69');
    c.save();
    c.translate(s.x, s.y);
    const squash = s.land / 0.14;
    c.scale(0.78 * (1 + squash * 0.1), 0.78 * (1 - squash * 0.1));
    const poseTime = s.ground >= 0 ? s.travel * 0.0045 : time;
    if (active === 'lua' || active === 'sparky' || active === 'becca' || active === 'boltbot') {
      const lean =
        active === 'lua'
          ? 0.24
          : active === 'sparky'
            ? 0.34
            : active === 'becca'
              ? (s.anchorX - s.originX) * 0.0018 * Math.cos((1 - s.ability / 0.64) * Math.PI)
              : 0.12;
      c.translate(0, -24);
      c.rotate(s.facing * lean);
      c.translate(0, 24);
    }
    if (active === 'nico') {
      c.translate(0, -33);
      c.rotate(s.facing * (1 - s.ability / 0.52) * tau);
      c.translate(0, 33);
    }
    paintFriend(
      c,
      cast.sprites[s.friend],
      cast.sheets,
      s.friend,
      0,
      0,
      s.facing,
      Math.abs(s.vx) > 9,
      poseTime,
      flying ? 4 : 0,
      active === 'sparky',
    );
    c.restore();
  } else {
    const a = Math.min(3.2, s.arrival),
      rise = Math.sin((Math.min(1, a / 1.6) * Math.PI) / 2);
    const x = s.x - 35 + a * 26,
      y = nestGround - 26 - 70 * rise + Math.sin(time * 2) * 4;
    owl(c, art.guardian, x, y, 138, time, true, false);
    c.save();
    c.translate(x + 4, y - 26);
    c.scale(0.44, 0.44);
    paintFriend(c, cast.sprites[s.friend], cast.sheets, s.friend, 0, 0, 1, false, time);
    c.restore();
    for (let i = 0; i < 3; i++)
      owl(c, art.chick, x - 45 - i * 25, y + 4 + Math.sin(time * 4 + i) * 7, 30, time + i, false, false);
  }
  for (const p of s.particles) {
    c.globalAlpha = Math.min(1, p.life * 3);
    glint(c, p.x, p.y, 2.8, p.color);
  }
  c.globalAlpha = 1;
  c.restore();
}
export function cameraTarget(s: Run, width: number) {
  const preview = Math.min(width * 0.3, 142);
  return Math.max(
    -5,
    Math.min(
      COURSES[s.stage].end + 95 - width,
      s.x - width * 0.43 + (s.facing > 0 ? preview * 0.4 : -preview * 0.35),
    ),
  );
}
export function trailHint(s: Run, es: boolean) {
  if (s.won) return es ? '¡Familia reunida!' : 'Family reunited!';
  if (s.feedbackTime > 0) {
    const messages = {
      owl: ['Owlet rescued!', '¡Polluelo rescatado!'],
      feather: ['Golden feather!', '¡Pluma dorada!'],
      chime: ['Clock bell restored!', '¡Campana restaurada!'],
      save: ['Checkpoint lit', 'Punto de guardado'],
      fall: ['Back at the lantern', 'De vuelta en el farol'],
      gust: ['Updraft!', '¡Corriente de aire!'],
      finish: ['Family reunited!', '¡Familia reunida!'],
      '': ['', ''],
    };
    return messages[s.feedback][es ? 1 : 0];
  }
  if (s.x < 125 && s.stage === 0 && s.elapsed < 12)
    return es ? 'Muévete hacia el primer polluelo.' : 'Move toward the first owlet.';
  const o = nextObjective(s),
    name =
      o.kind === 'owl'
        ? es
          ? 'Polluelo'
          : 'Owlet'
        : o.kind === 'chime'
          ? es
            ? 'Campana'
            : 'Clock bell'
          : es
            ? 'Nido'
            : 'Nest';
  return (o.x < s.x - 15 ? '◀ ' : '') + name + (o.x >= s.x - 15 ? ' ▶' : '');
}
