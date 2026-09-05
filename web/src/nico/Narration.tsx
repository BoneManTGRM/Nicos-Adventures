import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types';
import './narration.css';
export type VoiceInfo = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'voiceURI' | 'localService' | 'default'>;
export type ReadingPart = { text: string; page?: number };
const KEY = 'nico:narration:v1';
/** Remote voices never receive children's text. Quality is limited by installed voices. */
export function localVoices<T extends VoiceInfo>(voices: readonly T[], language: Language): T[] {
  const prefix = language === 'es-MX' ? 'es' : 'en', exact = language === 'es-MX' ? 'es-mx' : 'en-us';
  const rank = (v: T) => (/premium|enhanced|natural|neural/i.test(v.name) ? 100 : 0) + (v.lang.toLowerCase().replace('_','-') === exact ? 25 : 0) + (v.default ? 5 : 0) - (/compact|robot|novelty|whisper|bells/i.test(v.name) ? 30 : 0);
  return voices.filter(v => v.localService === true && v.lang.toLowerCase().replace('_','-').split('-')[0] === prefix).sort((a,b) => rank(b)-rank(a) || a.name.localeCompare(b.name));
}
export function readingChunks(parts: readonly ReadingPart[]): ReadingPart[] {
  return parts.flatMap(part => (part.text.match(/[^.!?]+[.!?]+[”"’']*|[^.!?]+$/g) ?? []).flatMap(sentence => {
    const chunks: ReadingPart[] = []; let text = sentence.trim();
    while(text.length > 220) { let at = text.lastIndexOf(' ',220); if(at < 60) at = 220; chunks.push({ text: text.slice(0,at).trim(), page: part.page }); text = text.slice(at).trim(); }
    if(text) chunks.push({ text, page: part.page }); return chunks;
  })).slice(0,240);
}
type Preference = { en?: string; 'es-MX'?: string; rate: number };
function preferences(): Preference {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return { en: typeof v.en === 'string' ? v.en : '', 'es-MX': typeof v['es-MX'] === 'string' ? v['es-MX'] : '', rate: Number.isFinite(v.rate) ? Math.min(1.2,Math.max(.75,v.rate)) : .92 }; } catch { return { rate: .92 }; }
}
export function useNarration(language: Language, enabled = true) {
  const [voices,setVoices] = useState<SpeechSynthesisVoice[]>([]), [pref,setPref] = useState(preferences);
  const [status,setStatus] = useState<'idle'|'speaking'|'paused'|'error'>('idle');
  const [current,setCurrent] = useState<ReadingPart | null>(null), [error,setError] = useState('');
  const session = useRef(0), active = useRef<SpeechSynthesisUtterance | null>(null), queue = useRef<ReadingPart[]>([]), index = useRef(0), mounted = useRef(true);
  const available = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const voice = voices.find(v => v.voiceURI === pref[language]) ?? voices[0];
  const stop = useCallback(() => { session.current++; queue.current=[]; if(active.current) { active.current.onend=null; active.current.onerror=null; if(available) window.speechSynthesis.cancel(); } active.current=null; if(mounted.current){setStatus('idle');setCurrent(null);} },[available]);
  useEffect(() => {
    mounted.current=true;
    if(!available)return;
    const load=()=>setVoices(localVoices(window.speechSynthesis.getVoices(),language)); load();
    window.speechSynthesis.addEventListener('voiceschanged',load);
    const hide=()=>{if(document.hidden)stop();}; document.addEventListener('visibilitychange',hide);
    return()=>{mounted.current=false;stop();window.speechSynthesis.removeEventListener('voiceschanged',load);document.removeEventListener('visibilitychange',hide);};
  },[language,available,stop]);
  useEffect(()=>{if(!enabled)stop();},[enabled,stop]);
  const speak = (parts: readonly ReadingPart[]) => {
    stop(); if(!enabled || !available || !voice) { setError(language==='es-MX'?'No hay una voz local de este idioma. Instala una voz en los ajustes de voz del dispositivo y vuelve a abrir la app.':'No local voice for this language is available. Install a voice in your device’s speech settings, then reopen the app.');setStatus('error');return; }
    queue.current=readingChunks(parts); index.current=0; if(!queue.current.length)return;
    const token=++session.current; setError('');
    const next=()=>{
      if(token!==session.current || !mounted.current)return;
      const part=queue.current[index.current]; if(!part){active.current=null;setCurrent(null);setStatus('idle');return;}
      const utterance=new SpeechSynthesisUtterance(part.text);active.current=utterance;
      utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=pref.rate;utterance.pitch=1;utterance.volume=1;
      utterance.onstart=()=>{if(token===session.current){setCurrent(part);setStatus('speaking');}};
      utterance.onend=()=>{if(token===session.current){index.current++;next();}};
      utterance.onerror=e=>{if(token!==session.current)return;active.current=null;setCurrent(null);if(e.error==='canceled'||e.error==='interrupted'){setStatus('idle');return;}setStatus('error');setError(language==='es-MX'?'La voz se detuvo. Prueba otra voz o vuelve a pulsar Leer.':'Narration stopped. Try another voice or press Read again.');};
      window.speechSynthesis.resume();window.speechSynthesis.speak(utterance);
    }; next();
  };
  const change = (patch: Partial<Preference>) => { stop(); const next={...pref,...patch};setPref(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{/* Playback remains usable without storage. */} };
  return { voices,voice,status,current,error,rate:pref.rate,enabled,available,canSpeak:enabled&&available&&Boolean(voice),stop,speak,
    choose:(uri:string)=>change({[language]:uri}),speed:(rate:number)=>change({rate:Math.max(.75,Math.min(1.2,rate))}),
    pause:()=>{if(status==='speaking'){window.speechSynthesis.pause();setStatus('paused');}else if(status==='paused'){window.speechSynthesis.resume();setStatus('speaking');}},
  };
}
export type Narrator = ReturnType<typeof useNarration>;
export function NarrationControls({ narrator:n, language }: { narrator:Narrator;language:Language }) {
  const es=language==='es-MX';
  return <div className="nico-narration" data-narration-status={n.status}>
    {(n.status==='speaking'||n.status==='paused')&&<div className="nico-narration__transport"><button type="button" onClick={n.pause}>{n.status==='paused'?(es?'Continuar voz':'Resume voice'):(es?'Pausar voz':'Pause voice')}</button><button type="button" onClick={n.stop}>{es?'Detener voz':'Stop voice'}</button></div>}
    <details><summary>{es?'Voz y lectura':'Voice & reading'}</summary>
      <p>{es?'Solo voces del dispositivo. Se elige primero una voz mejorada cuando está instalada. No es una imitación de la voz real de Nico.':'Device voices only. An enhanced voice is preferred when installed. This is not an imitation of Nico’s real voice.'}</p>
      {!n.enabled&&<p role="status">{es?'La voz está apagada en los ajustes de Nico.':'Speech is turned off in Nico’s settings.'}</p>}
      <label>{es?'Narrador':'Narrator'}<select value={n.voice?.voiceURI??''} disabled={!n.voices.length||!n.enabled} onChange={e=>n.choose(e.target.value)}>{!n.voices.length&&<option value="">{es?'No hay voces locales':'No local voices available'}</option>}{n.voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}</select></label>
      <label>{es?'Velocidad':'Reading speed'}<select value={n.rate} onChange={e=>n.speed(Number(e.target.value))}><option value={.8}>{es?'Tranquila':'Gentle'}</option><option value={.92}>{es?'Cuentacuentos':'Storyteller'}</option><option value={1}>{es?'Normal':'Normal'}</option><option value={1.1}>{es?'Ágil':'Lively'}</option></select></label>
      <button type="button" disabled={!n.canSpeak} onClick={()=>n.speak([{text:es?'¡Hola! Soy Nico. ¿Listos para descubrir algo increíble?':'Hi! I’m Nico. Ready to discover something amazing?'}])}>{es?'Probar voz':'Preview voice'}</button>
      {!n.voices.length&&<p>{es?'Las voces dependen del dispositivo. Descarga una voz mejorada en sus ajustes de accesibilidad o voz. La lectura en pantalla sigue funcionando.':'Voice choices depend on your device. Download an enhanced voice in its accessibility or speech settings. On-screen reading still works.'}</p>}
    </details>{n.error&&<p role="status">{n.error}</p>}
  </div>;
}
