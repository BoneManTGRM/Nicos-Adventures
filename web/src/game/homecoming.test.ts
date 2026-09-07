import { describe, expect, it } from 'vitest';
import { createProfile, exportProfile, importProfile } from '../storage';
import { applyStarBridgeEvent, awardHomecoming, CONSTELLATION } from './goldenAdventureProfile';
import type { StarBridgeEvent } from './goldenAdventure';
const events: StarBridgeEvent['type'][] = ['REVEAL_BRIDGE','CONFIGURE_ROBOT','PASS_MOVEMENT_TEST','PASS_SCANNER_TEST','PASS_LOGIC_TEST','INSPECT_BRIDGE','INSTALL_STAR_CORE','COMPLETE_ADVENTURE'];
describe('connected adventure persistence', () => {
  it.each(['en', 'es-MX'] as const)('brings the actual team and keepsake home, once, through backup (%s)', language => {
    let profile = createProfile('Nico', language);
    profile.robot.name = 'Azure';
    profile.pets = [{ id: 'p', name: 'Luna', species: 'Robot Cat', color: 'Blue', accessory: 'Bow', personality: 'Playful', bond: 1, tricks: [] }];
    profile.activePetId = 'p';
    expect(applyStarBridgeEvent(profile, { type: 'COMPLETE_ADVENTURE' })).toBe(profile);
    for (const type of events) profile = applyStarBridgeEvent(profile, { type });
    expect(profile.decorations).toContain(CONSTELLATION);
    expect(profile.stories[0].pages?.join(' ')).toContain('Azure');
    expect(profile.stories[0].pages?.join(' ')).toContain('Luna');
    profile.homeLayout = { [CONSTELLATION]: 8 };
    const restored = importProfile(exportProfile(profile));
    expect(restored.homeLayout?.[CONSTELLATION]).toBe(8);
    expect(restored.stories).toEqual(profile.stories);
    expect(awardHomecoming(restored)).toBe(restored);
    expect(applyStarBridgeEvent(restored, { type: 'COMPLETE_ADVENTURE' })).toBe(restored);
  });
  it('drops invalid placement positions and preserves older profiles', () => {
    const profile = createProfile('Nico');
    expect(importProfile(exportProfile(profile)).homeLayout).toEqual({});
    const raw = JSON.stringify({ ...profile, homeLayout: { valid: 4, bad: 10, negative: -1, fraction: 1.2, string: '2' } });
    expect(importProfile(raw).homeLayout).toEqual({ valid: 4 });
  });
});
