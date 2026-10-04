/** Fixed-step simulation stays separate from this bounded rendering policy. */
export type FrameMetrics={frames:number;slow:number;total:number;max:number;low:boolean};
export function recordFrame(m:FrameMetrics,seconds:number){
 m.frames++;m.total+=seconds;m.max=Math.max(m.max,seconds);if(seconds>1/30)m.slow++;
 // Enter fallback after enough frames to discriminate sustained load. Keep it
 // for this run: repeatedly reallocating DPR1/DPR2 canvases causes new stalls.
 if(m.frames>60&&m.slow/m.frames>.2)m.low=true;
}
