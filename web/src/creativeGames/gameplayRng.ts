/** Gameplay RNG is saved with the run and never used by particles or artwork. */
let runNonce=0;
export function gameplaySeed(){
 const a=new Uint32Array(1);
 if(globalThis.crypto?.getRandomValues){globalThis.crypto.getRandomValues(a);return a[0]||1;}
 return ((Date.now()^Math.imul(++runNonce,2654435761))>>>0)||1;
}
export function nextSeed(seed:number){let n=seed>>>0||1;n^=n<<13;n^=n>>>17;n^=n<<5;return n>>>0||1;}
