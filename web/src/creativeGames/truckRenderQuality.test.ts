import {it,expect} from 'vitest';
import {recordFrame,type FrameMetrics} from './truckRenderQuality';
const metrics=():FrameMetrics=>({frames:0,slow:0,total:0,max:0,low:false});
it('keeps full detail when the measured renderer sustains60Hz',()=>{const m=metrics();for(let i=0;i<600;i++)recordFrame(m,1/60);expect(m.low).toBe(false);expect(m.slow).toBe(0);});
it('keeps fallback stable after a loaded renderer briefly recovers its cadence',()=>{const m=metrics();for(let i=0;i<70;i++)recordFrame(m,.045);expect(m.low).toBe(true);for(let i=0;i<1000;i++)recordFrame(m,1/60);expect(m.slow/m.frames).toBeLessThan(.2);expect(m.low).toBe(true);});
