'use strict';

const crescentSpell = (() => {
  const tau = Math.PI * 2;
  const approach = .23;
  const afterglow = .19;

  function cast(spot, power) {
    const paw = castingPaw();
    const distance = Math.hypot(spot.x, spot.y);
    const heading = distance > .18 ? Math.atan2(-spot.y, -spot.x) : flight.scars * 2.40;
    const reach = .46 + .12 * power;
    const end = {x: Math.cos(heading) * reach, y: Math.sin(heading) * reach};
    const side = flight.scars % 2 ? 1 : -1;
    const bend = side * (.61 + .09 * power);
    const control = clipToDisc((spot.x + end.x) / 2 - Math.sin(heading) * bend,
                              (spot.y + end.y) / 2 + Math.cos(heading) * bend);
    flight.specialAttackFX.push({
      kind: 'crescent', power, start: spot, control, end, turn: spinAngle(), side,
      origin: {x: paw.x / W, y: paw.y / H}, age: 0, nextBite: 0,
      bites: 2 + power, sweep: .48 + .115 * power
    });
    cooldown = approach + .38 + .09 * power;
    castFlash = 1;
    tone(340, 980, .23, 'triangle', .045);
  }

  // The cut and blade follow the same curve in the turning planet's own coordinates.
  function surfacePoint(saw, t, rotation) {
    const s = 1 - t;
    const x = s*s*saw.start.x + 2*s*t*saw.control.x + t*t*saw.end.x;
    const y = s*s*saw.start.y + 2*s*t*saw.control.y + t*t*saw.end.y;
    const z = Math.sqrt(Math.max(0, 1 - x*x - y*y));
    return {x: x*rotation.cos - z*rotation.sin, y, z: x*rotation.sin + z*rotation.cos};
  }

  function rotationSinceCast(saw) {
    const angle = (spinAngle() - saw.turn) * tau;
    return {cos: Math.cos(angle), sin: Math.sin(angle)};
  }

  function cutTooth(saw, fraction, rotation) {
    const spot = surfacePoint(saw, fraction, rotation);
    const world = worlds[flight.index];
    // Compact thermal bores expose glowing walls. The travelling blade supplies the impact art.
    world.skin.impact('solar', spot.x, spot.y, spinAngle(), .28 + .12*saw.power, 1-flight.hp/world.health);
    ejectCrust(world, spot, 1, 'solar');
    gainEnergy(3);
    const last = saw.nextBite === saw.bites;
    const damage = last && saw.power === 3 ? 2 : 1;
    if (last) {
      const p = orbitTarget();
      labels.push({x: p.x + p.r*spot.x, y: p.y + p.r*(spot.y-.12), val: '−' + (saw.bites + damage - 1), life: .72});
      tone(790, 230, .16, 'triangle', .032);
    } else {
      tone(450 + saw.nextBite*115, 190, .065, 'triangle', .022);
    }
    applyWorldDamage(damage);
  }

  function update(dt) {
    if (!flight || flight.phase !== 'fight') return;
    const effects = flight.specialAttackFX;
    for (let i = effects.length - 1; i >= 0; i--) {
      const saw = effects[i];
      if (saw.kind !== 'crescent') continue;
      saw.age += dt;
      if (saw.age < approach) continue;
      const progress = (saw.age - approach) / saw.sweep;
      const rotation = rotationSinceCast(saw);
      while (saw.nextBite < saw.bites && saw.nextBite / (saw.bites - 1) <= progress) {
        const fraction = saw.nextBite++ / (saw.bites - 1);
        cutTooth(saw, fraction, rotation);
        if (flight.phase !== 'fight') return;
      }
      if (saw.age >= approach + saw.sweep + afterglow) effects.splice(i, 1);
    }
  }

  function drawBlade(x, y, radius, angle, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(radius, radius);
    ctx.globalAlpha = opacity;
    // One serrated convex edge and a deep concave back form an open crescent.
    const steel = ctx.createLinearGradient(-.7, -.9, .72, .9);
    steel.addColorStop(0, '#fcfff4');
    steel.addColorStop(.27, '#9efbd9');
    steel.addColorStop(.48, '#246c85');
    steel.addColorStop(.56, '#dfffee');
    steel.addColorStop(.79, '#8cd0bb');
    steel.addColorStop(1, '#ffd58d');
    ctx.fillStyle = steel;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#e9fff3';
    ctx.lineWidth = .049;
    ctx.beginPath();
    const startAngle = -2.11, arc = 4.22, teeth = 8;
    ctx.moveTo(Math.cos(startAngle), Math.sin(startAngle));
    for (let i = 0; i < teeth; i++) {
      const a = startAngle + (i + .76) * arc / teeth;
      const b = startAngle + (i + 1) * arc / teeth;
      ctx.lineTo(Math.cos(a)*1.09, Math.sin(a)*1.09);
      ctx.lineTo(Math.cos(b)*.94, Math.sin(b)*.94);
    }
    ctx.bezierCurveTo(.47, .47, .47, -.46, Math.cos(startAngle), Math.sin(startAngle));
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#275d77'; ctx.lineWidth = .055;
    ctx.beginPath(); ctx.arc(-.055, 0, .79, -1.45, 1.45); ctx.stroke();
    ctx.fillStyle = '#fff2a1';
    for (const a of [-.66, 0, .66]) {
      ctx.save(); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(.53, 0); ctx.lineTo(.65, -.056); ctx.lineTo(.75, 0);
      ctx.lineTo(.65, .056); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  function draw() {
    if (!flight || flight.phase !== 'fight') return;
    const p = orbitTarget();
    for (const saw of flight.specialAttackFX) {
      if (saw.kind !== 'crescent') continue;
      const rotation = rotationSinceCast(saw);
      const at = fraction => {
        const q = surfacePoint(saw, fraction, rotation);
        return {x: p.x + p.r*q.x, y: p.y + p.r*q.y};
      };
      const t = clamp((saw.age - approach) / saw.sweep, 0, 1);
      const fade = clamp((approach + saw.sweep + afterglow - saw.age) / afterglow, 0, 1);
      const radius = Math.max(7, p.r*(.115 + .031*saw.power));
      let tip = at(t);
      if (saw.age < approach) {
        const f = saw.age / approach;
        tip = {x: saw.origin.x*W*(1-f) + tip.x*f,
               y: saw.origin.y*H*(1-f) + tip.y*f - p.r*.31*Math.sin(Math.PI*f)};
      } else {
        const tail = Math.max(0, t-.54);
        const start = at(tail);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(start.x, start.y);
        for (let i = 1; i <= 15; i++) {
          const q = at(tail + (t-tail)*i/15);
          ctx.lineTo(q.x, q.y);
        }
        ctx.strokeStyle = '#50ffc4'; ctx.globalAlpha = .31*fade;
        ctx.lineWidth = radius*.47; ctx.stroke();
        ctx.strokeStyle = '#fff5b0'; ctx.globalAlpha = .92*fade;
        ctx.lineWidth = Math.max(1, radius*.095); ctx.stroke();
        // Sparks leave the hot edge tangentially and fade down the wake.
        const near = at(Math.max(0, t-.055));
        const heading = Math.atan2(tip.y-near.y, tip.x-near.x);
        const count = reduceMotion ? 3 : 8;
        ctx.translate(tip.x, tip.y); ctx.rotate(heading);
        ctx.strokeStyle = '#ffcf78'; ctx.lineWidth = Math.max(.85, radius*.055);
        for (let i = 0; i < count; i++) {
          const f = (saw.age*(1.75 + i*.077) + i*.381) % 1;
          const v = (i%2 ? 1 : -1) * (.13 + (i%3)*.42);
          ctx.globalAlpha = fade * (1-f);
          ctx.beginPath(); ctx.moveTo(-f*radius*2, v*f*radius);
          ctx.lineTo(-(f+.17)*radius*2, v*(f+.17)*radius); ctx.stroke();
        }
        ctx.restore();
      }
      const angle = saw.side*(saw.age*(reduceMotion ? 3.3 : 12.5) + t*.7);
      drawBlade(tip.x, tip.y, radius*(.75 + .25*fade), angle, fade);
    }
  }
  return {cast, update, draw};
})();
