import { describe, it, expect } from 'vitest';
import { advance, care, hatch, stage, valid } from '../public/games/luma-lagoon/pet.mjs';
import { openLagoon } from '../public/games/luma-lagoon/save.mjs';
import { createProfile, exportProfile, importProfile, normalizeStore, STORAGE_KEY } from '../src/storage';

const hour = 3_600_000;
const testPet = () => hatch('Nube', 'violet', hour);
function memory() {
  const values = new Map();
  return {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)};
}
describe('Luma Lagoon', () => {
  it('preserves a healthy pet across a long absence and resists a backwards clock', () => {
    const pet = testPet();
    expect(advance(pet, 0)).toBe(pet);
    const later = advance(pet, hour * 1000);
    expect(valid(later)).toBe(true);
    expect(later.belly).toBe(24);
    expect(later.bond).toBe(0);
  });
  it('awards meaningful care, evolves twice, sleeps and can wake without losing progress', () => {
    let pet = testPet();
    pet = care(pet, 'feed', hour).pet;
    expect(pet.belly).toBe(84);
    pet = care(pet, 'feed', hour).pet;
    expect(care(pet, 'feed', hour).pet.bond).toBe(2);
    pet = care(care(pet, 'play', hour).pet, 'play', hour).pet;
    expect(stage(pet.bond)).toBe(2);
    const nap = care(pet, 'nap', hour).pet;
    expect(nap.sleeping).toBe(true);
    expect(care(nap, 'feed', hour).note).toBe('asleep');
    expect(care(nap, 'nap', hour).note).toBe('woke');
    expect(advance(nap, hour*3).sleeping).toBe(false);
    for(let i=0;i<5;i++) pet = care(pet,'play',hour).pet;
    expect(stage(pet.bond)).toBe(3);
  });
  it('adopts a direct-link pet once and keeps other world profiles separate', () => {
    const storage = memory();
    openLagoon(storage).write(testPet());
    const first = createProfile('Nico','es-MX'), second = createProfile('Explorer','en');
    storage.setItem(STORAGE_KEY,JSON.stringify({profiles:[first,second],activeProfileId:first.id}));
    const own = openLagoon(storage);
    expect(own.read()).toEqual(testPet());
    const data = JSON.parse(storage.getItem(STORAGE_KEY));
    data.activeProfileId = second.id;
    storage.setItem(STORAGE_KEY,JSON.stringify(data));
    expect(openLagoon(storage).read()).toBeNull();
    own.write(care(own.read(),'play',hour).pet);
    expect(own.read().bond).toBe(3);
    expect(openLagoon(storage).read()).toBeNull();
  });
  it('round trips through the real world profile backup and drops unexpected fields on import', () => {
    const profile = {...createProfile('Nico'), lumaLagoon: {...testPet(), extra: 'discard'}};
    const restored = importProfile(exportProfile(profile));
    expect(restored.lumaLagoon).toEqual(testPet());
    const normalized = normalizeStore({profiles:[createProfile('Classic') ]});
    expect(normalized.profiles[0].lumaLagoon).toBeUndefined();
  });
});
