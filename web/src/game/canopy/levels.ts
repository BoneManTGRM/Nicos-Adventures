import type { Friend } from '../friendsMap/simulation';

export type Words = readonly [string, string];
export type Ledge = {
  x: number;
  y: number;
  width: number;
  kind?: 'lift' | 'spring' | 'crumble' | 'perch';
  glideX?: number;
  glideY?: number;
  phase?: number;
};
export type Relic = { ledge: number; offset: number; rise: number };
export type Course = {
  key: string;
  name: Words;
  subtitle: Words;
  color: string;
  end: number;
  ledges: Ledge[];
  owlets: Relic[];
  feathers: Relic[];
  chimes: Relic[];
  saves: number[];
  gusts: number[];
};
export const COURSES: Course[] = [
  {
    key: 'grove',
    name: ['Windmill Grove', 'Arboleda de molinos'],
    subtitle: [
      'Three chicks tumbled from the nest. Follow their calls through the treetops.',
      'Tres polluelos cayeron del nido. Sigue sus cantos por las copas de los árboles.',
    ],
    color: '#ffcf73',
    end: 1800,
    ledges: [
      { x: -90, y: 326, width: 430 },
      { x: 398, y: 306, width: 195 },
      { x: 650, y: 270, width: 170, kind: 'spring' },
      { x: 895, y: 275, width: 240 },
      { x: 1190, y: 301, width: 175, kind: 'lift', glideX: 26, phase: 1 },
      { x: 1410, y: 280, width: 135 },
      { x: 1595, y: 308, width: 285 },
      { x: 476, y: 221, width: 110, kind: 'perch' },
      { x: 773, y: 166, width: 130, kind: 'perch' },
      { x: 1490, y: 190, width: 95, kind: 'perch' },
    ],
    owlets: [
      { ledge: 0, offset: 235, rise: 25 },
      { ledge: 3, offset: 79, rise: 24 },
      { ledge: 5, offset: 70, rise: 26 },
    ],
    feathers: [
      { ledge: 1, offset: 125, rise: 93 },
      { ledge: 8, offset: 71, rise: 26 },
      { ledge: 9, offset: 54, rise: 29 },
    ],
    saves: [3],
    chimes: [],
    gusts: [],
  },
  {
    key: 'grotto',
    name: ['Echo Grotto', 'Gruta del eco'],
    subtitle: [
      'Crystal ferries cross the flooded cavern. The bright seams mark fragile ledges.',
      'Cruza la caverna inundada en los cristales móviles. Las grietas brillantes marcan las rocas frágiles.',
    ],
    color: '#89f0e0',
    end: 1990,
    ledges: [
      { x: -80, y: 325, width: 340 },
      { x: 325, y: 305, width: 146, kind: 'lift', glideY: 27 },
      { x: 520, y: 275, width: 171 },
      { x: 750, y: 286, width: 129, kind: 'crumble' },
      { x: 940, y: 307, width: 208 },
      { x: 1195, y: 279, width: 151, kind: 'lift', glideX: 30, phase: 0.8 },
      { x: 1412, y: 253, width: 155, kind: 'crumble' },
      { x: 1620, y: 278, width: 136, kind: 'spring' },
      { x: 1817, y: 304, width: 260 },
      { x: 578, y: 185, width: 122, kind: 'perch' },
      { x: 1018, y: 208, width: 105, kind: 'perch' },
      { x: 1685, y: 160, width: 108, kind: 'perch' },
    ],
    owlets: [
      { ledge: 2, offset: 78, rise: 23 },
      { ledge: 4, offset: 85, rise: 27 },
      { ledge: 7, offset: 50, rise: 27 },
    ],
    feathers: [
      { ledge: 9, offset: 64, rise: 25 },
      { ledge: 10, offset: 50, rise: 22 },
      { ledge: 11, offset: 52, rise: 25 },
    ],
    saves: [2, 4, 8],
    chimes: [],
    gusts: [],
  },
  {
    key: 'roost',
    name: ['The Brass Roost', 'El nido de latón'],
    subtitle: [
      'The old clock fell silent. Bring back the chicks and jump through three bells to wake the guardian.',
      'El reloj dejó de sonar. Reúne a los polluelos y salta para tocar tres campanas y despertar al guardián.',
    ],
    color: '#ffbd91',
    end: 2150,
    ledges: [
      { x: -100, y: 325, width: 390 },
      { x: 338, y: 299, width: 168 },
      { x: 561, y: 267, width: 163, kind: 'lift', glideY: 23, phase: 0.6 },
      { x: 783, y: 290, width: 184 },
      { x: 1023, y: 307, width: 197 },
      { x: 1270, y: 276, width: 142, kind: 'crumble' },
      { x: 1463, y: 288, width: 178, kind: 'spring' },
      { x: 1690, y: 252, width: 124, kind: 'lift', glideX: 23 },
      { x: 1850, y: 295, width: 390 },
      { x: 403, y: 211, width: 96, kind: 'perch' },
      { x: 1066, y: 211, width: 110, kind: 'perch' },
      { x: 1540, y: 180, width: 122, kind: 'perch' },
    ],
    owlets: [
      { ledge: 1, offset: 65, rise: 26 },
      { ledge: 4, offset: 65, rise: 24 },
      { ledge: 8, offset: 77, rise: 25 },
    ],
    feathers: [
      { ledge: 9, offset: 49, rise: 28 },
      { ledge: 10, offset: 64, rise: 34 },
      { ledge: 11, offset: 65, rise: 26 },
    ],
    saves: [3, 4, 8],
    chimes: [
      { ledge: 2, offset: 75, rise: 86 },
      { ledge: 4, offset: 140, rise: 81 },
      { ledge: 8, offset: 175, rise: 85 },
    ],
    gusts: [884, 1570],
  },
];
export const POWERS: Record<Friend, { name: Words; hint: Words; color: string; mark: string }> = {
  nico: {
    name: ['Sky flip', 'Salto mortal'],
    hint: ['Flip in midair for a second jump.', 'Da otra voltereta en el aire para subir más.'],
    color: '#fcd078',
    mark: '✦',
  },
  becca: {
    name: ['Vine swing', 'Liana'],
    hint: [
      'Cast a vine to swing toward the next ledge.',
      'Lanza una liana para llegar a la siguiente plataforma.',
    ],
    color: '#9de3a9',
    mark: '❧',
  },
  lua: {
    name: ['Moon glide', 'Planeo lunar'],
    hint: [
      'Float across a gap on a trail of moonlight.',
      'Planea sobre el vacío con una estela de luz lunar.',
    ],
    color: '#e3bdf7',
    mark: '☾',
  },
  boltbot: {
    name: ['Jet boost', 'Propulsores'],
    hint: [
      'Fire the boot thrusters to rise and steer.',
      'Enciende los propulsores para subir y cambiar de dirección.',
    ],
    color: '#87e9fc',
    mark: 'ϟ',
  },
  sparky: {
    name: ['Rescue pounce', 'Brinco de rescate'],
    hint: [
      'Leap forward and call nearby chicks to you.',
      'Salta hacia delante y llama a los polluelos cercanos.',
    ],
    color: '#ffba97',
    mark: '✧',
  },
};
export const chapterKey = (i: number) => 'friends-map:canopy:' + COURSES[i].key;
export function ledgeAt(p: Ledge, time: number) {
  const wave = Math.sin(time * 1.55 + (p.phase ?? 0));
  return { x: p.x + wave * (p.glideX ?? 0), y: p.y + wave * (p.glideY ?? 0), width: p.width };
}
export function relicAt(level: Course, r: Relic, time: number) {
  const p = ledgeAt(level.ledges[r.ledge], time);
  return { x: p.x + r.offset, y: p.y - r.rise };
}
