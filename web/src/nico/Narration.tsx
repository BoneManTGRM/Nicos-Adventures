import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types';
import './narration.css';
import { acquireNarration } from './speechCoordinator';
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
  const voice = voices.find(v => v.voiceURI === pref[language]) ?? (language === 'es-MX' ? voices.find(v => v.lang.toLowerCase().replace('_','-') === 'es-mx') : voices[0]);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const release = useRef<(() => void) | undefined>(undefined);
  const stop = useCallback(() => { session.current++; queue.current=[]; clearTimeout(timeout.current); release.current?.(); release.current=undefined; if(active.current) { active.current.onend=null; active.current.onerror=null; if(available) window.speechSynthesis.cancel(); } active.current=null; if(mounted.current){setStatus('idle');setCurrent(null);} },[available]);
  useEffect(() => {
    mounted.current=true;
    setStatus('idle'); setCurrent(null); setError('');
    if(!available)return;
    const load=()=>{const next=localVoices(window.speechSynthesis.getVoices(),language); if(active.current&&!next.some(v=>v.voiceURI===active.current?.voice?.voiceURI))stop();setVoices(next);}; load();
    window.speechSynthesis.addEventListener('voiceschanged',load);
    const hide=()=>{if(document.hidden)stop();}; document.addEventListener('visibilitychange',hide);
    return()=>{mounted.current=false;stop();window.speechSynthesis.removeEventListener('voiceschanged',load);document.removeEventListener('visibilitychange',hide);};
  },[language,available,stop]);
  useEffect(()=>{if(!enabled)stop();},[enabled,stop]);
  const speak = (parts: readonly ReadingPart[]) => {
    stop(); if(!enabled || !available || !voice) { setError(language==='es-MX'?'No hay una voz local de este idioma. Instala una voz en los ajustes de voz del dispositivo y vuelve a abrir la app.':'No local voice for this language is available. Install a voice in your device’s speech settings, then reopen the app.');setStatus('error');return; }
    release.current=acquireNarration(stop);
    queue.current=readingChunks(parts); index.current=0; if(!queue.current.length)return;
    const token=++session.current; setError('');
    const next=()=>{
      if(token!==session.current || !mounted.current)return;
      clearTimeout(timeout.current);
      const part=queue.current[index.current]; if(!part){release.current?.();active.current=null;setCurrent(null);setStatus('idle');return;}
      if(!window.speechSynthesis.getVoices().some(v=>v.localService===true&&v.voiceURI===voice.voiceURI)){stop();setStatus('error');setError(language==='es-MX'?'La voz local ya no está disponible. Puedes seguir leyendo.':'The local voice is no longer available. You can keep reading.');return;}
      const utterance=new SpeechSynthesisUtterance(part.text);active.current=utterance;
      utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=pref.rate;utterance.pitch=1;utterance.volume=1;
      utterance.onstart=()=>{if(token===session.current&&active.current===utterance){setCurrent(part);setStatus('speaking');}};
      utterance.onend=()=>{if(token===session.current&&active.current===utterance){utterance.onend=null;utterance.onerror=null;index.current++;next();}};
      utterance.onerror=e=>{if(token!==session.current||active.current!==utterance)return;stop();if(e.error==='canceled'||e.error==='interrupted')return;setStatus('error');setError(language==='es-MX'?'La voz se detuvo. Prueba otra voz o vuelve a pulsar Leer.':'Narration stopped. Try another voice or press Read again.');};
      timeout.current=setTimeout(()=>{if(token!==session.current||active.current!==utterance)return;stop();setStatus('error');setError(language==='es-MX'?'La voz no terminó. Pulsa Repetir o continúa leyendo.':'Speech did not finish. Press Repeat or keep reading.');},30000);
      try { window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance); } catch { stop();setStatus('error');setError(language==='es-MX'?'No se pudo iniciar la voz. Continúa leyendo.':'Speech could not start. Keep reading.'); }
    }; next();
  };
  const change = (patch: Partial<Preference>) => { stop(); const next={...pref,...patch};setPref(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{/* Playback remains usable without storage. */} };
  return { voices,voice,status,current,error,rate:pref.rate,enabled,available,canSpeak:enabled&&available&&Boolean(voice),stop,speak,
    choose:(uri:string)=>change({[language]:uri}),speed:(rate:number)=>change({rate:Math.max(.75,Math.min(1.2,rate))}),
    pause:()=>{if(status==='speaking'){window.speechSynthesis.pause();setStatus('paused');}else if(status==='paused'){window.speechSynthesis.resume();setStatus('speaking');}},
  };
}
export type Narrator = ReturnType<typeof useNarration>;
export function NarrationControls({ narrator:n, language, uiLanguage = language, allowPause = true }: { narrator:Narrator;language:Language;uiLanguage?:Language;allowPause?:boolean }) {
  const es=uiLanguage==='es-MX';
  return <div className="nico-narration" data-narration-status={n.status}>
    {(n.status==='speaking'||n.status==='paused')&&<div className="nico-narration__transport">{allowPause&&<button type="button" onClick={n.pause}>{n.status==='paused'?(es?'Continuar voz':'Resume voice'):(es?'Pausar voz':'Pause voice')}</button>}<button type="button" onClick={n.stop}>{es?'Detener voz':'Stop voice'}</button></div>}
    <details><summary>{es?'Voz y lectura':'Voice & reading'}</summary>
      <p>{es?'Solo voces locales del dispositivo. La etiqueta indica la variante real del idioma. Es un guía por computadora, no una persona real.':'Local device voices only. Locale labels show the actual voice language. This is a computer guide, not a real person.'}</p>
      {!n.enabled&&<p role="status">{es?'La voz está apagada en los ajustes de Nico.':'Speech is turned off in Nico’s settings.'}</p>}
      <label>{es?'Narrador':'Narrator'}<select value={n.voice?.voiceURI??''} disabled={!n.voices.length||!n.enabled} onChange={e=>n.choose(e.target.value)}>{!n.voice&&<option value="">{es?'Elige una voz local':'Choose a local voice'}</option>}{n.voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}</select></label>
      <label>{es?'Velocidad':'Reading speed'}<select value={n.rate} onChange={e=>n.speed(Number(e.target.value))}><option value={.8}>{es?'Tranquila':'Gentle'}</option><option value={.92}>{es?'Cuentacuentos':'Storyteller'}</option><option value={1}>{es?'Normal':'Normal'}</option><option value={1.1}>{es?'Ágil':'Lively'}</option></select></label>
      <button type="button" disabled={!n.canSpeak} onClick={()=>n.speak([{text:language==='es-MX'?'¡Hola! Soy Nico. ¿Listos para descubrir algo increíble?':'Hi! I’m Nico. Ready to discover something amazing?'}])}>{es?'Probar voz':'Preview voice'}</button>
      {!n.voice&&<p>{es?'Modo de texto: no hay una voz local adecuada seleccionada. Las voces dependen del dispositivo. Debes elegir una voz de otra región si la deseas; su etiqueta no indica español mexicano.':'Text mode: no suitable local voice selected. Voices depend on the device. A Spanish voice from another region requires selection; its label is not Mexican Spanish.'}</p>}
    </details>{n.error&&<p role="status">{n.error}</p>}
  </div>;
}
