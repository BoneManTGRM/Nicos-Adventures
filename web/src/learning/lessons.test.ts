import { describe, expect, it } from 'vitest'
import { lessonItem, missions, workedExample, type Band } from './lessons'
const expected = [
  [['3','left','5','right'],['12','right','15','left']],
  [['5','3','7','4'],['15','9','17','8']],
  [['blue','circle','red','triangle'],['15','18','21','20']],
  [['abc','bac','cab','acb'],['abcd','bcad','cadb','bdac']],
  [['2','1','3','2'],['3','4','2','1']],
  [['6','3','8','5'],['19','8','23','12']],
]
describe('reviewed Robot Rescue lessons', () => {
  it('has six complete bilingual missions and 48 uniquely identified items', () => {
    const ids = new Set<string>(); expect(missions).toHaveLength(6)
    missions.forEach((mission, m) => {
      for (const text of [mission.title, mission.objective, mission.example, mission.alternative]) {
        expect(text.en.length).toBeGreaterThan(10); expect(text['es-MX'].length).toBeGreaterThan(10)
      }
      ;(['gentle','challenge'] as Band[]).forEach((band,b) => {
        expect(workedExample(m,band).en.length).toBeGreaterThan(20)
        for(let p=0;p<4;p++) {
          const item=lessonItem(m,p,band)
          expect(item.answer).toBe(expected[m][b][p]); expect(item.check).toBe(p>=2); expect(item.transfer).toBe(p===3)
          expect(ids.has(item.id)).toBe(false); ids.add(item.id)
          expect(item.options.filter(o=>o.id===item.answer)).toHaveLength(1)
          expect(new Set(item.options.map(o=>o.id)).size).toBe(item.options.length)
          expect(item.hints).toHaveLength(2)
          for(const text of [item.prompt,item.visual,item.alternative,...item.hints,...item.options.map(o=>o.label),...Object.values(item.feedback)]) {
            expect(text.en.trim()).not.toBe(''); expect(text['es-MX'].trim()).not.toBe('')
          }
          for(const option of item.options) expect(item.feedback[option.id]).toBeDefined()
        }
      })
    }); expect(ids.size).toBe(48)
  })
  it('rejects invalid content coordinates',()=>{
    expect(()=>lessonItem(-1,0,'gentle')).toThrow();expect(()=>lessonItem(0,4,'gentle')).toThrow()
  })
})
