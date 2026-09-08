import {describe,expect,it} from 'vitest';
import {buildAdventurePages} from './storyAdventure';
import {STORY_OPTIONS,storyPages} from './storyBook';
import {normalizeStore} from '../storage';
import type {Language,StoryRecord} from '../types';
const book=(l:Language,i=0):StoryRecord=>({id:'book',title:'The test adventure',hero:'Nico',companion:'Becca',language:l,place:STORY_OPTIONS.place[l][0],problem:STORY_OPTIONS.problem[l][i],ending:STORY_OPTIONS.ending[l][0],theme:STORY_OPTIONS.theme[l][0],magicItem:STORY_OPTIONS.magicItem[l][0],adventureVersion:1,adventureChoices:[1,1]});
describe('illustrated branching storybook',()=>{
 it('builds six substantial pages for every authored challenge in both languages',()=>{for(const l of ['en','es-MX'] as const)for(let i=0;i<STORY_OPTIONS.problem[l].length;i++){const pages=buildAdventurePages(book(l,i));expect(pages).toHaveLength(6);expect(pages.every(p=>p.length>250&&p.length<=1800)).toBe(true);expect(pages.join(' ')).toContain('Becca');expect(pages.join(' ')).not.toContain('undefined');}});
 it('choices change later story events rather than only highlighting a button',()=>{const a=buildAdventurePages(book('en'),[0,0]),b=buildAdventurePages(book('en'),[1,1]);expect(a[0]).toBe(b[0]);expect(a[2]).not.toBe(b[2]);expect(a[4]).not.toBe(b[4]);});
 it('saves both branch decisions and exact page text without losing old books',()=>{const b=book('es-MX');b.specialDetail='Un dragón azul encontró la pista.';b.pages=buildAdventurePages(b,[1,1]);const old={...book('en'),id:'old',adventureVersion:undefined,adventureChoices:undefined,pages:['My original page.','My original ending.']};const p=normalizeStore({profiles:[{id:'a',stories:[b,old]}],activeProfileId:'a'}).profiles[0];expect(p.stories[0].pages).toEqual(b.pages);expect(p.stories[0].adventureChoices).toEqual([1,1]);expect(storyPages(p.stories[1])).toEqual(old.pages);expect(p.stories[1].adventureVersion).toBeUndefined();});
});
