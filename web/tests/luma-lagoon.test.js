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

import {canVisit, completeTrip, discoveries, dress, grantWish, journey, moveHome, solvedCircuit, traceCircuit} from '../public/games/luma-lagoon/expeditions.mjs';

describe('Luma Lagoon expeditions', () => {
  it('starts an existing guardian at home with their original identity and bond', () => {
    const old = {...testPet(), bond: 34};
    const next = completeTrip(old, 0, hour);
    expect(next).toMatchObject({born: old.born, name: old.name, color:'violet', bond:37});
    expect(journey(old)).toEqual({wins:[0,0,0,0],pearls:0,wishes:0,home:0,wear:0,owned:1});
    expect(journey(next)).toMatchObject({wins:[1,0,0,0],pearls:4});
    expect(completeTrip(old, 2, hour)).toBeNull();
    expect(completeTrip(care(old,'nap',hour).pet,0,hour)).toBeNull();
  });
  it('unlocks all four habitats and twelve treasures, charges once for each accessory, and preserves them through the world backup', () => {
    let pet=testPet();
    expect(dress(pet, 1)).toBeNull();
    expect(moveHome(pet, 2)).toBeNull();
    for(const route of [0,1,2,3,0,1,2,3,0,1,2,3,0]) {
      expect(canVisit(journey(pet),route)).toBe(true);
      pet=completeTrip(pet,route,hour);
    }
    expect(discoveries(journey(pet))).toBe(12);
    pet=dress(pet,4);
    expect(journey(pet).pearls).toBe(40);
    expect(dress(pet,4)).toEqual(pet);
    pet=moveHome(pet,4);
    const profile = {...createProfile('Nico'),lumaLagoon:pet};
    expect(importProfile(exportProfile(profile)).lumaLagoon).toEqual(pet);
  });
  it('rewards the requested interaction once and retains the next wish on return', () => {
    const pet=testPet();
    expect(grantWish(pet,'trip')).toBeNull();
    const next=grantWish(pet,'love');
    expect(grantWish(next,'love')).toBeNull();
    expect(journey(next)).toMatchObject({pearls:2,wishes:1});
    const storage=memory();openLagoon(storage).write(grantWish(next,'feed'));
    expect(journey(openLagoon(storage).read())).toMatchObject({pearls:4,wishes:2});
  });
  it('traces the continuous path from the moon to the final star and stops at a broken link', () => {
    expect(traceCircuit(solvedCircuit)).toEqual({lit:[0,3,4,1,2,5],complete:true});
    expect(traceCircuit([0,...solvedCircuit.slice(1)])).toEqual({lit:[],complete:false});
  });
});
