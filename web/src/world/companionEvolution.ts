import type { LocalProfile, MonsterRecord, PetRecord, Robot } from '../types';
import { completeOnce } from './progression';
import { knownTrickCount } from './petPlay';

export const tier = (companion: PetRecord | MonsterRecord) => Math.max(1, Math.min(3, companion.evolutionTier ?? 1));
export function petCanEvolve(pet: PetRecord): boolean {
  const next = tier(pet) + 1;
  return next <= 3 && pet.bond >= (next === 2 ? 30 : 70) && knownTrickCount(pet) >= (next === 2 ? 1 : 3);
}
export function monsterCanEvolve(monster: MonsterRecord): boolean {
  const next = tier(monster) + 1;
  return next <= 3 && monster.friendship >= (next === 2 ? 40 : 80);
}
export function evolvePet(profile: LocalProfile, id: string): LocalProfile {
  const pet = profile.pets.find(item => item.id === id);
  if (!pet || !petCanEvolve(pet)) return profile;
  const next = tier(pet) + 1;
  return completeOnce({ ...profile, pets: profile.pets.map(item => item.id === id ? { ...item, evolutionTier: next } : item) }, `pet:evolution:${id}:${next}`, next).profile;
}
export function evolveMonster(profile: LocalProfile, id: string): LocalProfile {
  const monster = profile.monsters.find(item => item.id === id);
  if (!monster || !monsterCanEvolve(monster)) return profile;
  const next = tier(monster) + 1;
  return completeOnce({ ...profile, monsters: profile.monsters.map(item => item.id === id ? { ...item, evolutionTier: next } : item) }, `monster:evolution:${id}:${next}`, next).profile;
}
export const DASH_UPGRADES = [
  { id: 'battery', checkpoints: 1, en: 'Extra battery · +1 heart', es: 'Batería extra · +1 vida' },
  { id: 'turbo', checkpoints: 3, en: 'Turbo clock · +10 seconds', es: 'Reloj turbo · +10 segundos' },
] as const;
export function upgradeRobot(profile: LocalProfile, id: string, upgrade: 'battery' | 'turbo'): LocalProfile {
  const config = DASH_UPGRADES.find(item => item.id === upgrade);
  const robot = profile.robots.find(item => item.id === id) ?? (profile.robot.id === id ? profile.robot : undefined);
  const cleared = Array.from({ length: 12 }, (_, index) => profile.completedMissions.includes(`arcade:signal-run:${index}`)).filter(Boolean).length;
  if (!robot || !config || cleared < config.checkpoints || robot.upgrades?.includes(upgrade)) return profile;
  const updated: Robot = { ...robot, upgrades: [...(robot.upgrades ?? []), upgrade] };
  return { ...profile, robot: profile.robot.id === id ? updated : profile.robot,
    robots: profile.robots.map(item => item.id === id ? updated : item) };
}
