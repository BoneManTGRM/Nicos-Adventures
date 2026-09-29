import {useEffect,useState} from 'react';
import {loadUnicornArt,unicornArtReady} from './unicornSprite';
export function useUnicornArt() {
  const [status,setStatus]=useState<'loading'|'ready'|'error'>(unicornArtReady()?'ready':'loading');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;
    loadUnicornArt().then(()=>{if(active)setStatus('ready');}).catch(()=>{if(active)setStatus('error');});
    return()=>{active=false;};
  },[attempt]);
  return {status,retry:()=>{setStatus('loading');setAttempt(value=>value+1);}};
}
