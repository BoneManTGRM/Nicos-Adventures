'use strict';

const pinballSpell = (() => {
  const tau = Math.PI * 2;
  const durations = [.43, .33, .36, .60];
  const returnWindow = 1.0;
  const maxPasses = 3;
  const lamps = ['#ffbc5f', '#80f4f1', '#ff93d8'];
  const notes = [494, 622, 740];

  function newBumpers(spot) {
    const aim = Math.hypot(spot.x, spot.y) > .08
      ? Math.atan2(spot.y, spot.x) : -.87;
    return lamps.map((color, i) => {
      const angle = aim + i * tau / 3;
      return {x: .58*Math.cos(angle) + spot.x*.22, y: .58*Math.sin(angle) + spot.y*.22,
        color, heat: 0};
    });
  }

  function activeBall() {
    if (!flight || flight.phase !== 'fight') return null;
    return flight.specialAttackFX.find(effect => effect.kind === 'pinball');
  }

  function cast(spot, power) {
    if (!flight || flight.phase !== 'fight' || activeBall()) return;
    const paw = castingPaw();
    flight.specialAttackFX.push({
      kind: 'pinball', power, pass: 1, leg: 0, elapsed: 0, age: 0,
      bumpers: newBumpers(spot), order: [0,1,2], launch: {x:paw.x/W,y:paw.y/H}
    });
    castFlash = 1;
    cooldown = .65;
    tone(180, 760, .19, 'triangle', .06);
  }

  function bumperPosition(fx, i, planet) {
    const b = fx.bumpers[fx.order[i]];
    return {x: planet.x + b.x * planet.r, y: planet.y + b.y * planet.r};
  }

  // The inbound ball arcs into the paw, hangs in batting range for a beat,
  // then drops past the player. A miss is harmless in either difficulty.
  function position(fx, planet, at = fx.elapsed) {
    const paw = castingPaw();
    if (fx.leg === 4) {
      const t = Math.max(0, at / returnWindow);
      const drop = Math.max(0, t - 1);
      return {x: paw.x + planet.r*(.09 - .13*Math.min(t,1) - 2.2*drop),
        y: paw.y + planet.r*(-.12 + .10*Math.min(t,1) + 2.5*drop)};
    }
    const t = Math.max(0, Math.min(1, at / durations[fx.leg]));
    const from = fx.leg ? bumperPosition(fx, fx.leg - 1, planet)
      : {x: fx.launch.x * W, y: fx.launch.y * H};
    const to = fx.leg === 3 ? {x:paw.x+planet.r*.09,y:paw.y-planet.r*.12}
      : bumperPosition(fx, fx.leg, planet);
    const arch = fx.leg === 3 ? .37 : fx.leg === 0 ? .22 : .045;
    return {x: from.x + (to.x - from.x)*t, y: from.y + (to.y-from.y)*t - 4*t*(1-t)*arch*planet.r};
  }

  function tryBat() {
    const fx = activeBall();
    if (mode !== 'play' || selectedSpell !== 'pinball' || !fx || fx.pass >= maxPasses) return false;
    const returning = fx.leg === 3 && fx.elapsed >= durations[3]*.78;
    if (!returning && !(fx.leg === 4 && fx.elapsed <= returnWindow)) return false;
    const p = position(fx, orbitTarget());
    fx.launch = {x:p.x/W, y:p.y/H};
    fx.pass++;
    fx.order = fx.pass === 2 ? [1,0,2] : [2,1,0];
    fx.leg = 0;
    fx.elapsed = 0;
    flight.charge = 0;
    castFlash = 1;
    cooldown = .55;
    beginGesture('pinball', fx.power, null);
    addScore(75*(fx.pass-1),p.x,p.y);
    showNotice(fx.pass === 2 ? 'BONUS PASS!' : 'FINAL PASS!', .73);
    tone(370, 1050, .20, 'triangle', .07);
    return true;
  }

  function update(dt) {
    const fx = activeBall();
    if (!fx) return;
    fx.age += dt;
    fx.elapsed += dt;
    for (const b of fx.bumpers) b.heat = Math.max(0, b.heat-dt*3.4);
    while (fx.leg < 4 && fx.elapsed >= durations[fx.leg]) {
      fx.elapsed -= durations[fx.leg];
      if (fx.leg < 3) {
        const i = fx.order[fx.leg], bumper = fx.bumpers[i];
        bumper.heat = 1;
        strikeSurface(bumper, 'nova', .46 + fx.power*.28 + (fx.pass-1)*.15, 'comet');
        tone(notes[i] * (1 + .08*(fx.pass-1)), notes[i]*1.64, .13, 'triangle', .06);
        gainEnergy(3 + (fx.leg === 2 ? fx.power : 0));
        applyWorldDamage(fx.leg === 2 ? fx.power + fx.pass - 1 : 1);
        if (flight.phase !== 'fight') return;
      }
      fx.leg++;
      if (fx.leg === 3 && fx.pass < maxPasses && selectedSpell === 'pinball') {
        showNotice('TAP AS THE METEOR RETURNS', durations[3] + returnWindow);
      }
      if (fx.leg === 4 && fx.pass === maxPasses) {
        fx.elapsed += returnWindow;
        showNotice('THREE-PASS VOLLEY!', .9);
      }
    }
    if (fx.leg === 4 && fx.elapsed > returnWindow + .44) {
      flight.specialAttackFX.splice(flight.specialAttackFX.indexOf(fx), 1);
    }
  }

  function shape(ctx, sides, r) {
    ctx.beginPath();
    if (!sides) ctx.arc(0,0,r,0,tau);
    else for (let j = 0; j < sides; j++) {
      const a = j*tau/sides - Math.PI/2;
      if (j) ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
      else ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r);
    }
    ctx.closePath();
  }

  function drawBumper(b, i, planet, opacity) {
    const r = Math.max(5,planet.r*.117)*(1+b.heat*.18);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(planet.x+b.x*planet.r, planet.y+b.y*planet.r);
    ctx.scale(1,.84);
    const shine = ctx.createLinearGradient(-r,-r,r,r);
    shine.addColorStop(0,'#fff9db');shine.addColorStop(.27,b.color);
    shine.addColorStop(.58,'#584068');shine.addColorStop(1,'#191c34');
    ctx.lineWidth = Math.max(1.1,r*.13);
    ctx.strokeStyle = shine;
    ctx.fillStyle = '#222039';
    shape(ctx,8,r);ctx.fill();ctx.stroke();
    ctx.fillStyle = b.heat > .55 ? '#fff5dc' : b.color;
    shape(ctx,[0,3,4][i],r*.58);ctx.fill();
    ctx.fillStyle = '#fff9d9';
    ctx.beginPath();ctx.arc(-r*.20,-r*.23,r*.12,0,tau);ctx.fill();
    if (b.heat > .03) {
      ctx.globalAlpha = opacity*b.heat;
      ctx.strokeStyle = b.color;
      shape(ctx,0,r*(1.1+.75*(1-b.heat)));ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    const fx = activeBall();
    if (!fx) return;
    const p = orbitTarget(), ball = position(fx,p);
    const opacity = fx.leg === 4 ? Math.min(1,Math.max(0,(returnWindow+.44-fx.elapsed)/.44)) : 1;
    fx.bumpers.forEach((b,i) => drawBumper(b,i,p,opacity));
    const r = Math.max(5, p.r*(.083 + fx.power*.011));
    ctx.save();ctx.globalAlpha = opacity;ctx.lineCap = 'round';
    if (!reduceMotion && fx.leg < 4) {
      const prev = position(fx,p,fx.elapsed-.16);
      const streak = ctx.createLinearGradient(prev.x,prev.y,ball.x,ball.y);
      streak.addColorStop(0,'#fb653900');streak.addColorStop(1,'#ffcc7e');
      ctx.strokeStyle = streak;ctx.lineWidth = r*.98;
      ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(ball.x,ball.y);ctx.stroke();
    }
    ctx.fillStyle = '#ff9d46';
    ctx.beginPath();ctx.arc(ball.x,ball.y,r,0,tau);ctx.fill();
    if (!drawRockArt('meteor',ball.x,ball.y,r*2.16,r*2,reduceMotion ? .35 : fx.age*4)) {
      ctx.fillStyle = '#845579';
      ctx.beginPath();ctx.arc(ball.x-r*.12,ball.y+r*.08,r*.8,0,tau);ctx.fill();
      ctx.fillStyle = '#e3a27f';
      ctx.fillRect(ball.x-r*.48,ball.y-r*.48,r*.5,r*.25);
    }
    if (fx.pass < maxPasses && (fx.leg === 3 || fx.leg === 4 && fx.elapsed < returnWindow)) {
      const paw = castingPaw(), ready = fx.leg === 4 || fx.elapsed >= durations[3]*.78;
      ctx.strokeStyle = ready ? '#fff19c' : '#b3e5faa6';
      ctx.lineWidth = ready ? 2.7 : 1.6;
      ctx.setLineDash(ready ? [] : [3,3]);
      ctx.beginPath();ctx.arc(paw.x,paw.y,r*1.95,0,tau);ctx.stroke();
    }
    ctx.restore();
  }

  return {cast, update, draw, tryBat};
})();
