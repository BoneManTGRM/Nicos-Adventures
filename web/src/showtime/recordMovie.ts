export type MovieRecordingResult={blob:Blob;mimeType:string;durationMs:number};
export type RecordCanvasMovieOptions={canvas:HTMLCanvasElement;durationMs:number;drawFrame:(elapsedMs:number)=>void|Promise<void>;fps?:number;onProgress?:(progress:number)=>void;signal?:AbortSignal};
// VP8 is usually cheaper than VP9 to encode. MP4 remains available where WebM is not.
export const MOVIE_MIME_TYPES=['video/webm;codecs=vp8','video/webm','video/mp4;codecs=avc1.42E01E','video/mp4'] as const;
export function selectSupportedMimeType(recorder:Pick<typeof MediaRecorder,'isTypeSupported'>|undefined=globalThis.MediaRecorder):string|null{return recorder&&typeof recorder.isTypeSupported==='function'?MOVIE_MIME_TYPES.find(m=>recorder.isTypeSupported(m))??null:null;}
export function canRecordCanvasMovie():boolean{return typeof window!=='undefined'&&typeof MediaRecorder!=='undefined'&&typeof document.createElement('canvas').captureStream==='function'&&selectSupportedMimeType()!==null;}
export async function recordCanvasMovie({canvas,durationMs,drawFrame,fps=24,onProgress,signal}:RecordCanvasMovieOptions):Promise<MovieRecordingResult>{
 const mimeType=selectSupportedMimeType();if(!canvas.captureStream||!mimeType)throw new Error('Video recording is unavailable.');
 const aborted=()=>new DOMException('Recording cancelled','AbortError');if(signal?.aborted)throw aborted();
 const safeDuration=Math.max(1000,Math.min(24000,Number.isFinite(durationMs)?Math.round(durationMs):6000)),rate=Math.max(12,Math.min(30,Number.isFinite(fps)?Math.round(fps):24));
 await drawFrame(0);const stream=canvas.captureStream(rate);let recorder:MediaRecorder|null=null;
 let frame=0,timer=0,watchdog=0,stopWatch=0,stopResolve=()=>{},rejectFrame:(reason:unknown)=>void=()=>{};
 let failure:unknown=null;const chunks:BlobPart[]=[];
 const cancel=()=>{failure=aborted();rejectFrame(failure);};
 const hidden=()=>{if(document.hidden)cancel();};
 try{
  recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2_000_000});
  const stopped=new Promise<void>(resolve=>{stopResolve=resolve;recorder!.addEventListener('stop',()=>resolve(),{once:true});});
  recorder.addEventListener('dataavailable',e=>{if(e.data.size)chunks.push(e.data);});recorder.addEventListener('error',()=>{failure=new Error('Video encoder failed.');rejectFrame(failure);});
  signal?.addEventListener('abort',cancel,{once:true});document.addEventListener('visibilitychange',hidden);recorder.start(250);
  try{await new Promise<void>((resolve,reject)=>{
    rejectFrame=reject;const start=performance.now();let last=0,lastProgress=-1;
    const schedule=()=>{timer=window.setTimeout(()=>{frame=requestAnimationFrame(tick);},Math.max(1,1000/rate-(performance.now()-last)));};
    const tick=async()=>{if(signal?.aborted||document.hidden){reject(aborted());return;}if(failure){reject(failure);return;}const now=performance.now();if(last&&now-last<1000/rate){schedule();return;}last=now;const elapsed=Math.min(safeDuration,now-start);
      try{await drawFrame(elapsed);const progress=elapsed/safeDuration;if(progress-lastProgress>=.04||progress===1){onProgress?.(progress);lastProgress=progress;}}catch(e){reject(e);return;}
      if(elapsed>=safeDuration)resolve();else schedule();
    };watchdog=window.setTimeout(()=>reject(new Error('Recording timed out.')),safeDuration+10000);schedule();
  });}finally{clearTimeout(timer);clearTimeout(watchdog);cancelAnimationFrame(frame);if(recorder.state!=='inactive')recorder.stop();stopWatch=window.setTimeout(stopResolve,5000);await stopped;clearTimeout(stopWatch);}
  if(failure)throw failure;if(signal?.aborted)throw aborted();if(!chunks.length)throw new Error('No video data was produced.');return{blob:new Blob(chunks,{type:mimeType}),mimeType,durationMs:safeDuration};
 }finally{clearTimeout(timer);clearTimeout(watchdog);clearTimeout(stopWatch);cancelAnimationFrame(frame);signal?.removeEventListener('abort',cancel);document.removeEventListener('visibilitychange',hidden);if(recorder&&recorder.state!=='inactive')recorder.stop();stream.getTracks().forEach(t=>t.stop());}
}
export function downloadMovieBlob(blob:Blob,fileName:string){const name=fileName.trim().replace(/[^a-z0-9-_]+/gi,'-').replace(/^-+|-+$/g,'').slice(0,60)||'nicos-world-movie';const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${name}.${blob.type.includes('mp4')?'mp4':'webm'}`;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);}
