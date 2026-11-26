import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const scripts = ['bout.js', 'team-bout.js'].map(file =>
  readFileSync(new URL('../public/games/mascaras-del-volcan/' + file, import.meta.url), 'utf8'));
const Team = runInNewContext([...scripts, 'LuchaTeamBout'].join('\n'));

function advance(bout, seconds) {
  for (let i = 0; i < Math.ceil(60 * seconds); i++) bout.update(1 / 60);
}

function start(hero = 0, partner = 4) {
  const bout = new Team(0, () => {}, () => 0.4, { hero, partner });
  advance(bout, 1.7);
  return bout;
}

describe('Volcán tag teams', () => {
  it('keeps each partner’s health across a tag and prevents a duplicate exchange', () => {
    const bout = start();
    bout.hero.hp = 35;
    bout.partner.hp = 89;
    bout.action('tag');
    bout.action('tag');
    advance(bout, 1.12);
    expect(bout.hero).toMatchObject({ id: 4, hp: 89 });
    expect(bout.partner.id).toBe(0);
    expect(bout.partner.hp).toBeCloseTo(35, 0);
    bout.action('tag');
    expect(bout.mode).toBe('fight');
  });

  it.each([[0, 4, 52, 0], [0, 5, 43, 0], [4, 5, 44, 22]])(
    'resolves one finisher for masks %s and %s', (hero, partner, damage, energy) => {
      const bout = start(hero, partner);
      bout.energy = 100;
      bout.action('tag');
      advance(bout, 1.5);
      expect(bout.rival.hp).toBe(100 - damage);
      expect(bout.rival.state).toBe('down');
      expect(bout.energy).toBe(energy);
      expect(bout.stats.specials).toBe(1);
      expect(bout.hero.id).toBe(partner);
    });

  it.each(['hero', 'rival'])('allows one two-count rescue for the %s team', side => {
    const bout = start();
    const defender = bout[side], attacker = side === 'hero' ? bout.rival : bout.hero;
    const cover = () => {
      defender.hp = 0;
      bout.startPin(attacker, defender);
      advance(bout, 1.9);
      expect(bout.pin.count).toBe(2);
    };
    cover();
    if (side === 'hero') bout.action('tag');
    advance(bout, 1.4);
    expect(bout.rescue[side]).toBe(false);
    expect(bout.mode).toBe('fight');
    cover();
    if (side === 'hero') bout.action('tag');
    advance(bout, 1);
    expect(bout.mode).toBe('end');
    expect(attacker.state).toBe('win');
  });
});
