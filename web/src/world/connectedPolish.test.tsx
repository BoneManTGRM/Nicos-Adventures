import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { createProfile } from '../storage';
import { WorldMap } from './WorldMap';
import { BottomNavigation } from './common';
import { RobotHome } from './RobotHome';
const noop = () => {};

describe('connected adventure visible entry and navigation', () => {
  it.each(['en','es-MX'] as const)('offers direct mission start and separate create/explore choices in %s', language => {
    const profile = createProfile('Test', language);
    const html = renderToStaticMarkup(createElement(WorldMap, {profile, open:noop, beginStarBridge:noop, advanceStarBridge:noop}));
    expect(html).toContain(language === 'en' ? 'Start my adventure' : 'Empezar mi aventura');
    expect(html).toContain('data-testid="world-create"');
    expect(html).toContain('data-testid="world-explore"');
  });
  it.each(['en','es-MX'] as const)('has four consistently labeled navigation actions in %s', language => {
    const html = renderToStaticMarkup(createElement(BottomNavigation, {profile:createProfile('Test',language), open:noop}));
    for (const action of ['explore','create','home','more']) expect(html).toContain(`data-journey-nav="${action}"`);
    expect((html.match(/data-journey-nav=/g)||[]).length).toBe(4);
  });
  it('offers actionable empty states instead of an unattainable robot-team goal', () => {
    const profile = createProfile('Test');
    const html = renderToStaticMarkup(createElement(RobotHome, {profile, update:noop, announce:noop, open:noop}));
    expect(html).toContain('data-testid="home-create-art"');
    expect(html).toContain('data-testid="home-create-pet"');
    expect(html).not.toContain('Build a two-robot team');
  });
});

import { ArtStudio } from './ArtStudio';
import { StoryCastle as StoryBook } from './StoryCastleBook';
import type { ArtworkRecord, StoryRecord } from '../types';

describe('contextual mission entry and exact saved creations', () => {
  it.each([
    ['map_revealed', 'Prepare BoltBot'], ['robot_configured', 'Try the movement test'],
    ['movement_passed', 'Try the scanner test'], ['scanner_passed', 'Try the logic test'],
    ['logic_passed', 'Inspect the Star Bridge'], ['bridge_inspected', 'Install the Star Core'],
    ['star_core_installed', 'Light up the bridge'], ['complete', 'Bring the adventure home'],
  ] as const)('names the next playable objective for %s', (step, label) => {
    const profile = createProfile('Test'); profile.adventures.starBridge.step = step;
    const html = renderToStaticMarkup(createElement(WorldMap, {profile, open:noop, beginStarBridge:noop, advanceStarBridge:noop}));
    expect(html).toContain(`data-next-objective="${step}"`);
    expect(html).toContain(label);
    expect(profile.adventures.starBridge.step).toBe(step);
  });
  it('opens the exact saved artwork, without changing saved content or stars', () => {
    const profile = createProfile('Test');
    const artwork: ArtworkRecord = {id:'kept-art', title:'Our constellation',subject:'Nico',background:'Starry Space',frame:'Gold Frame',caption:'Keep every detail'};
    profile.artwork = [artwork]; const before=JSON.stringify(profile);
    const html=renderToStaticMarkup(createElement(ArtStudio,{profile,update:noop,announce:noop, initialArtworkId:'kept-art'}));
    expect(html).toContain('Our constellation');
    expect(html).toContain('value="Our constellation"');
    expect(JSON.stringify(profile)).toBe(before);
  });
  it('opens an original saved story with its exact pages and language', () => {
    const profile=createProfile('Test');
    profile.stories=[{id:'old-story',title:'My original book',hero:'Nico',language:'en',pages:['A page that must never be regenerated.','The saved ending.']} as StoryRecord];
    const html=renderToStaticMarkup(createElement(StoryBook,{profile,update:noop,announce:noop, initialStoryId:'old-story'}));
    expect(html).toContain('A page that must never be regenerated.');
    expect(html).toContain('value="My original book"');
  });
});

import { WORLD_SECTIONS } from './catalogs';
describe('navigation orientation',()=>{
  it.each(WORLD_SECTIONS.map(item=>item.id))('marks exactly one current navigation group in %s',selectedSection=>{
    const profile={...createProfile('Test'),selectedSection};
    const html=renderToStaticMarkup(createElement(BottomNavigation,{profile,open:noop}));
    expect((html.match(/aria-current="page"/g)||[]).length).toBe(1);
  });
});

it('preserves the existing two-robot goal for returning players who can complete it',()=>{
 const profile=createProfile('Returning');profile.robots.push({...profile.robot,id:'older-robot'});
 const html=renderToStaticMarkup(createElement(RobotHome,{profile,update:noop,announce:noop,open:noop}));
 expect(html).toContain('Build a two-robot team');
});
