'use strict';

const wormholeSpell = (() => {
  const transit = .34;
  const lifetime = 1.0;
  const circle = Math.PI * 2;
  const inlet = '#62efff';
  const outlet = '#ff9cdd';

  function surfacePoint(x, y) {
    return {x, y, z: Math.sqrt(Math.max(0, 1 - x*x - y*y))};
  }

  function rotatePoint(point, initialTurn) {
    const angle = (spinAngle() - initialTurn) * circle;
    return {
      x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
      y: point.y,
      z: point.x * Math.sin(angle) + point.z * Math.cos(angle)
    };
  }

  function cast(spot, power) {
    if (!flight || flight.phase !== 'fight') return;
    const entry = surfacePoint(spot.x, spot.y);
    // Fold toward the opposite visible limb. A central tap has no obvious
    // antipode on screen, so give it a separate exit along a rotating bearing.
    const bearing = Math.hypot(spot.x, spot.y) < .12
      ? flight.scars * 2.4
      : Math.atan2(spot.y, spot.x) + Math.PI + .18;
    const exit = surfacePoint(.81 * Math.cos(bearing), .81 * Math.sin(bearing));
    flight.specialAttackFX.push({
      kind: 'wormhole', entry, exit, turn: spinAngle(), age: 0, landed: false, power
    });
    cooldown = .88;
    castFlash = 1;
    strikeSurface(entry, 'cryo', .50 + power * .47, 'wormhole');
    tone(230, 820, .17, 'sine', .055);
    gainEnergy(8);
    applyWorldDamage(power);
  }

  function update(dt) {
    if (!flight || flight.phase !== 'fight') return;
    const effects = flight.specialAttackFX;
    for (let i = effects.length - 1; i >= 0; i--) {
      const fx = effects[i];
      if (fx.kind !== 'wormhole') continue;
      fx.age += dt;
      if (!fx.landed && fx.age >= transit) {
        fx.landed = true;
        const exit = rotatePoint(fx.exit, fx.turn);
        strikeSurface(exit, 'nova', .75 + fx.power * .56, 'wormhole');
        hitSound('gravity', fx.power);
        tone(740, 175, .23, 'triangle', .047);
        gainEnergy(9 + fx.power);
        applyWorldDamage(2 + fx.power);
        if (flight.phase !== 'fight') return;
      }
      if (fx.age >= lifetime) effects.splice(i, 1);
    }
  }

  function drawMouth(x, y, point, radius, color, motion, phase, opacity) {
    if (point.z <= 0 || opacity <= 0 || radius < .5) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(point.y, point.x));
    ctx.scale(.53 + point.z * .47, 1);
    ctx.globalAlpha = opacity;
    const throat = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.34);
    throat.addColorStop(0, '#120e2bcc');
    throat.addColorStop(.59, '#150c2fa0');
    throat.addColorStop(.72, color + '66');
    throat.addColorStop(.79, '#f9f3ffcb');
    throat.addColorStop(.86, color + '90');
    throat.addColorStop(1, color + '00');
    ctx.fillStyle = throat;
    ctx.fillRect(-radius * 1.35, -radius * 1.35, radius * 2.7, radius * 2.7);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, radius * .075);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = phase + motion + i * circle/3;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.18, a, a + 1.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(radius * .69 * Math.cos(a), radius * .69 * Math.sin(a));
      ctx.quadraticCurveTo(radius * .27 * Math.cos(a + 1.1), radius * .27 * Math.sin(a + 1.1),
        radius * .15 * Math.cos(a + 1.85), radius * .15 * Math.sin(a + 1.85));
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    if (!flight || flight.phase !== 'fight') return;
    const planet = orbitTarget();
    for (const fx of flight.specialAttackFX) {
      if (fx.kind !== 'wormhole') continue;
      const entry = rotatePoint(fx.entry, fx.turn), exit = rotatePoint(fx.exit, fx.turn);
      const ax = planet.x + entry.x * planet.r, ay = planet.y + entry.y * planet.r;
      const bx = planet.x + exit.x * planet.r, by = planet.y + exit.y * planet.r;
      const t = Math.min(1, fx.age / transit);
      const fade = Math.min(1, Math.max(0, (lifetime - fx.age) / .39));
      const radius = planet.r * (.134 + fx.power * .035);
      const bend = planet.r * .24;
      const cx = (ax + bx) / 2 + (exit.y - entry.y) * bend;
      const cy = (ay + by) / 2 - (exit.x - entry.x) * bend;
      ctx.save();
      ctx.lineCap = 'round';
      const color = ctx.createLinearGradient(ax, ay, bx, by);
      color.addColorStop(0, inlet);
      color.addColorStop(.5, '#e8d8ff');
      color.addColorStop(1, outlet);
      ctx.strokeStyle = color;
      ctx.globalAlpha = .55 * fade;
      ctx.lineWidth = Math.max(1, radius * .11);
      ctx.beginPath();ctx.moveTo(ax, ay);ctx.quadraticCurveTo(cx, cy, bx, by);ctx.stroke();
      if (!reduceMotion && t < 1) {
        const paw = castingPaw(), u = 1 - t;
        ctx.strokeStyle = inlet;
        ctx.globalAlpha = .55 * u;
        ctx.beginPath();ctx.moveTo(paw.x, paw.y);ctx.lineTo(ax, ay);ctx.stroke();
        const px = u*u*ax + 2*u*t*cx + t*t*bx;
        const py = u*u*ay + 2*u*t*cy + t*t*by;
        ctx.translate(px, py);
        ctx.rotate(Math.atan2(u * (cy - ay) + t * (by - cy), u * (cx - ax) + t * (bx - cx)) + Math.PI/2);
        ctx.globalAlpha = .96;
        ctx.fillStyle = '#fffbf0';
        ctx.beginPath();
        ctx.ellipse(0, radius * .10, radius * .33, radius * .23, 0, 0, circle);
        ctx.fill();
        for (let toe = -1; toe <= 1; toe++) {
          ctx.beginPath();
          ctx.ellipse(toe * radius * .24, radius * (-.24 + .09 * Math.abs(toe)),
            radius * .10, radius * .14, toe * .28, 0, circle);
          ctx.fill();
        }
      }
      ctx.restore();
      const sweep = reduceMotion ? 0 : fx.age * 3.5;
      const exitSize = reduceMotion ? 1 : .5 + t * .5 + .23 * Math.max(0, 1 - Math.abs(fx.age - transit) / .16);
      drawMouth(ax, ay, entry, radius, inlet, sweep, 0, fade);
      drawMouth(bx, by, exit, radius * exitSize, outlet, -sweep, 1, fade * (.52 + .48 * t));
    }
  }

  return {cast, update, draw};
})();
