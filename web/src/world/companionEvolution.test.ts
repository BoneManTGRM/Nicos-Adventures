import { describe, expect, it } from 'vitest';
import { createProfile, normalizeStore } from '../storage';
import type { LocalProfile, MonsterRecord, PetRecord } from '../types';
import { evolveMonster, evolvePet, monsterCanEvolve, petCanEvolve, upgradeRobot } from './companionEvolution';
import { addPetBond, savePetStyle } from './petPlay';
import { createRift, stepRift } from '../game/monsterRift';

const pet: PetRecord = { id:'p', name:'Sparky', species:'Robot Dog', color:'Blue', accessory:'Explorer Scarf', personality:'Playful', bond:70, tricks:['Sit','Spin','Dance'] };
const monster: MonsterRecord = { id:'m', name:'Glimmer', body:'Dragon', eyes:'Two eyes', horns:'Crystal horns', wings:'Star wings', color:'Aqua', pattern:'Galaxy', power:'Rainbow shield', personality:'Curious', friendship:80, habitat:'Crystal Cave' };
describe('companion progression', () => {
  it('evolves pets twice, preserves their form across style saves and awards each form once', () => {
    let profile: LocalProfile = { ...createProfile('Nico'), pets:[pet], activePetId:'p' };
    expect(petCanEvolve({ ...pet, bond:29 })).toBe(false);
    profile = evolvePet(profile,'p');
    expect(profile.pets[0].evolutionTier).toBe(2);
    profile = evolvePet(profile,'p');
    expect(profile.pets[0].evolutionTier).toBe(3);
    expect(petCanEvolve(profile.pets[0])).toBe(false);
    expect(evolvePet(profile,'p')).toBe(profile);
    expect(profile.stars).toBe(5);
    expect(addPetBond(profile,'p',6)!.pets[0].bond).toBe(76);
    expect(savePetStyle(profile,{...pet,name:'Sparky II'},true)!.pets[0].evolutionTier).toBe(3);
  });
  it('keeps monster evolution when friendship increases and grants shorter Rift cooldowns', () => {
    let profile = { ...createProfile('Nico'), monsters:[monster] };
    expect(monsterCanEvolve({ ...monster, friendship:39 })).toBe(false);
    profile = evolveMonster(evolveMonster(profile,'m'),'m');
    expect(profile.monsters[0].evolutionTier).toBe(3);
    expect(profile.stars).toBe(5);
    const game = createRift(); game.status='playing';
    stepRift(game,{x:0,y:0,fire:false,power:true},.01,monster.power,3);
    expect(game.powerCooldown).toBeLessThan(3);
    expect(game.powerCooldown).toBeGreaterThan(2.9);
  });
  it('unlocks and reloads BoltBot upgrades without granting repeated rewards', () => {
    const base = createProfile('Nico');
    let profile = { ...base, completedMissions:['arcade:signal-run:0'], robots:[base.robot] };
    expect(upgradeRobot(profile,base.robot.id,'turbo')).toBe(profile);
    profile = upgradeRobot(profile,base.robot.id,'battery');
    expect(profile.robot.upgrades).toEqual(['battery']);
    expect(upgradeRobot(profile,base.robot.id,'battery')).toBe(profile);
    profile = { ...profile, completedMissions:[...profile.completedMissions,'arcade:signal-run:1','arcade:signal-run:2'] };
    profile = upgradeRobot(profile,base.robot.id,'turbo');
    const restored = normalizeStore({schemaVersion:4,activeProfileId:profile.id,profiles:[profile]}).profiles[0];
    expect(restored.robot.upgrades).toEqual(['battery','turbo']);
    expect(restored.robots[0].upgrades).toEqual(['battery','turbo']);
  });
});
