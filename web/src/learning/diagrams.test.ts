import { expect, it } from 'vitest';
import { lessonItem } from './lessons';
it('draws the authored counting and comparison amounts without changing grading', () => {
 expect(lessonItem(0,0,'gentle').diagram).toEqual({kind:'groups',groups:[3]});
 expect(lessonItem(0,1,'gentle').diagram).toEqual({kind:'groups',groups:[6,4]});
 expect(lessonItem(0,2,'challenge').diagram).toEqual({kind:'groups',groups:[15]});
});
it('retains both debug rows so the incorrect position is not revealed', () => {
 expect(lessonItem(4,0,'gentle').diagram).toEqual({kind:'tiles',rows:[['A','B','C'],['A','C','C']]});
});
it('keeps visual arrays bounded across every authored variant', () => {
 for (let m=0;m<6;m++) for (let p=0;p<4;p++) for (const b of ['gentle','challenge'] as const) {
  const d=lessonItem(m,p,b).diagram;
  if(d?.kind==='groups') for(const n of d.groups){expect(Number.isInteger(n)).toBe(true);expect(n).toBeGreaterThanOrEqual(0);expect(n).toBeLessThanOrEqual(25);}
  if(d?.kind==='tiles') for(const row of d.rows) expect(row.length).toBeLessThanOrEqual(8);
 }
});
