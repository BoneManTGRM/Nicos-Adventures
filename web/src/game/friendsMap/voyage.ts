import type { Friend } from './simulation';

type Copy = readonly [english: string, spanish: string];
type Chapter = { id: string; pilot: Friend; title: Copy; instruction: Copy; power: Copy; reward: Copy; color: string; goal: number };
export const VOYAGES: readonly Chapter[] = [
  { id: 'garden', pilot: 'becca', title: ['Lantern Orchard', 'Huerto de faroles'], instruction: ['Gather six lantern blossoms. Bloom draws nearby flowers to your sail.', 'Junta seis flores de luz. Florecer atrae las flores cercanas a tu vela.'], power: ['Bloom', 'Florecer'], reward: ['The first lantern blooms. A little whale answers from the clouds.', 'Se enciende el primer farol. Una ballenita responde desde las nubes.'], color: '#ffcf8d', goal: 6 },
  { id: 'workshop', pilot: 'boltbot', title: ['Copper Skyway', 'Ruta de cobre'], instruction: ['Line up with each copper coil. Use Spark as it approaches to light it, then fly through.', 'Alinéate con cada bobina. Usa Chispa cuando se acerque para encenderla y pasa por el aro.'], power: ['Spark', 'Chispa'], reward: ['The lighthouse wakes up. Copper rings carry its signal past the cliffs.', 'El faro se enciende. Los aros llevan su señal más allá de los acantilados.'], color: '#8ce9fc', goal: 4 },
  { id: 'treehouse', pilot: 'sparky', title: ['Swallow Hollow', 'Valle de golondrinas'], instruction: ['Call the lost swallows as you approach. Fly close to guide them into your flock.', 'Llama a las golondrinas cuando te acerques. Vuela cerca para que te sigan.'], power: ['Call the flock', 'Llamar'], reward: ['The swallows know the way! Watch them circle the next beacon.', '¡Las golondrinas conocen el camino! Ya rodean el siguiente faro.'], color: '#ade9a1', goal: 5 },
  { id: 'castle', pilot: 'lua', title: ['Moonveil Narrows', 'Paso del velo lunar'], instruction: ['Catch drifting moons. Use Moonveil to sail safely through thunderclouds.', 'Atrapa las lunas que suben y bajan. Usa Velo lunar para atravesar las nubes de tormenta.'], power: ['Moonveil', 'Velo lunar'], reward: ['Lua parts the storm. Beyond its silver edges, a constellation is missing.', 'Lua abre la tormenta. Al otro lado falta una constelación.'], color: '#d6b5ff', goal: 5 },
  { id: 'observatory', pilot: 'nico', title: ['Compass of Stars', 'Brújula de estrellas'], instruction: ['Follow the numbered stars in order. Starcall draws the next number closer.', 'Sigue las estrellas numeradas en orden. Llamada estelar acerca el siguiente número.'], power: ['Starcall', 'Llamada estelar'], reward: ['The constellation sings back. The starwhale dips a fin for you to climb aboard.', 'La constelación canta. La ballena baja una aleta para que subas.'], color: '#ffdf78', goal: 5 },
  { id: 'whale', pilot: 'nico', title: ['Ride the Starwhale', 'Cabalga la ballena estelar'], instruction: ['Ride through six song rings. Sing to scatter the storm and bring the starwhale home.', 'Atraviesa seis aros de canto. Canta para dispersar la tormenta y guiar a la ballena a casa.'], power: ['Whale song', 'Canto'], reward: ['Under the island lights, the starwhale finds her pod. The skyway is yours to fly again.', 'Bajo las luces de la isla, la ballena encuentra a su familia. Puedes volver a recorrer el cielo.'], color: '#82f1e8', goal: 6 },
];
export const flightMission = (chapter: number) => 'friends-map:voyage:' + VOYAGES[chapter].id;
export const finaleUnlocked = (missions: readonly string[]) => VOYAGES.slice(0, 5).every((_, i) => missions.includes(flightMission(i)));
export const flightBestKey = (i: number, wild: boolean) => 'starwhale:' + VOYAGES[i].id + (wild ? ':wild' : ':calm');
export type SkyObject = { id: number; kind: 'target' | 'storm' | 'bonus'; x: number; lane: number; y: number; lit: boolean; number: number };
export type Flight = ReturnType<typeof newFlight>;
export function newFlight(chapter: number, wild = false) {
  return { chapter, wild, lane: 1, altitude: 1, time: 0, hull: 3, collected: 0, score: 0, streak: 0, maxStreak: 0,
    cooldown: 0, glow: 0, shield: 0, hit: 0, wave: 0, nextWave: .1, spark: 0, result: 'flying' as 'flying' | 'won' | 'lost',
    objects: [] as SkyObject[], motes: [] as { x: number; y: number; life: number; color: string; angle: number }[] };
}
export function steer(s: Flight, lane: number) { if (s.result === 'flying') s.lane = Math.min(2, Math.max(0, Math.round(lane))); }
export const PILOT_X = .215;
function burst(s: Flight, x: number, y: number, color: string) {
  for (let n = 0; n < 10; n++) s.motes.push({ x, y, color, life: .65, angle: n * Math.PI / 5 });
}
export function usePower(s: Flight) {
  if (s.cooldown > 0 || s.result !== 'flying') return false;
  s.cooldown = 1.35; s.glow = .7;
  if (s.chapter === 3 || s.chapter === 5) s.shield = 1.6;
  for (const o of s.objects) {
    if (o.x < PILOT_X - .055 || o.x > PILOT_X + .46) continue;
    if (s.chapter === 5 && o.kind === 'storm') { burst(s, o.x, o.y, '#b7edff'); o.x = -1; continue; }
    if (o.kind !== 'target' || (s.chapter === 4 && o.number !== s.collected + 1)) continue;
    if (s.chapter === 1 && Math.abs(o.y - s.altitude) > .62) continue;
    if (s.chapter === 0 || s.chapter === 2 || s.chapter === 4) o.lane = s.lane;
    o.lit = true;
  }
  return true;
}
const pattern = [1,0,2,1,2,0,1,0,2,0,1,2];
function spawn(s: Flight) {
  const n = s.wave++;
  const lane = pattern[(n + s.chapter * 2) % pattern.length];
  const kind = (type: SkyObject['kind'], at: number, x: number, number = 0): SkyObject =>
    ({ id: n * 4 + (type === 'target' ? 0 : type === 'bonus' ? 1 : 2), kind: type, lane: at, y: at, x, number, lit: false });
  s.objects.push(kind('target', lane, 1.06, s.chapter === 4 ? s.collected + 1 : 0));
  if (n % 2 === 1 || s.chapter === 3 || s.wild) s.objects.push(kind('storm', (lane + 1 + n % 2) % 3, 1.08));
  if (s.chapter === 4) s.objects.push({ ...kind('target', (lane + 2) % 3, 1.19, (s.collected + 2) % 5 + 1), id: n * 4 + 3 });
  else if (n % 2 === 0) s.objects.push(kind('bonus', (lane + 1) % 3, 1.28));
}
export function advanceFlight(s: Flight, seconds: number) {
  if (s.result !== 'flying' || !Number.isFinite(seconds) || seconds <= 0) return;
  const dt = Math.min(.05, seconds);
  s.time += dt; s.nextWave -= dt;
  for (const key of ['glow','cooldown','shield','hit','spark'] as const) s[key] = Math.max(0, s[key] - dt);
  s.altitude += (s.lane - s.altitude) * (1 - Math.exp(-8 * dt));
  const speed = s.wild ? .244 : .193;
  if (s.nextWave <= 0) { spawn(s); s.nextWave += s.wild ? 1.68 : 2.05; }
  for (const o of s.objects) {
    o.x -= dt * speed;
    const bob = o.kind === 'target' && s.chapter === 3 ? Math.sin(s.time * 1.4 + o.id) * .40 : 0;
    o.y += (o.lane + bob - o.y) * (1 - Math.exp(-6 * dt));
    if (Math.abs(o.x - PILOT_X) > .054 || Math.abs(o.y - s.altitude) > .49) continue;
    if (o.kind === 'storm') {
      if (s.hit === 0 && s.shield === 0) { s.streak = 0; s.hit = 1.1; if (s.wild) s.hull--; }
      burst(s, o.x, o.y, s.shield ? '#93faff' : '#c4afdb');
    } else if (o.kind === 'bonus') { s.score += 15; burst(s, o.x, o.y, '#fff297'); s.spark = .35; }
    else {
      if ((s.chapter === 1 || s.chapter === 2) && !o.lit) continue;
      if (s.chapter === 4 && o.number !== s.collected + 1) continue;
      s.collected++; s.streak++; s.maxStreak = Math.max(s.streak, s.maxStreak);
      s.score += 70 + Math.min(5, s.streak) * 10; s.spark = .5;
      burst(s, o.x, o.y, VOYAGES[s.chapter].color);
    }
    o.x = -1;
    if (s.hull === 0 || s.collected === VOYAGES[s.chapter].goal) { s.result = s.hull === 0 ? 'lost' : 'won'; break; }
  }
  s.objects = s.objects.filter(o => o.x > -.1);
  s.motes = s.motes.filter(p => (p.life -= dt) > 0);
}
