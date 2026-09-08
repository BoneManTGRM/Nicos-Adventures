import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { LocalProfile } from "../types";
import type { RenderableMovieCharacter } from "../showtime/movieRenderer";
import { loadDirectorArt, disposeDirectorArt, type DirectorArt } from "../showtime/directorArt";
import { mergeAnimalLibrary } from "../FeatureArt";
import { localizeAnimalCompat } from "../i18n/animalsCompat";
import "./illustrated-art.css";
import type { ArtworkRecord } from "../types";
export const BACKGROUNDS = [
  { id: "Starry Space", emoji: "🌌", en: "Starry Space", es: "Espacio estrellado", colors: ["#172554", "#4c1d95"] },
  { id: "Jungle Discovery", emoji: "🌿", en: "Jungle Discovery", es: "Descubrimiento en la selva", colors: ["#14532d", "#166534"] },
  { id: "Ocean Lab", emoji: "🌊", en: "Ocean Lab", es: "Laboratorio oceánico", colors: ["#075985", "#0e7490"] },
  { id: "Dinosaur Valley", emoji: "🦖", en: "Dinosaur Valley", es: "Valle de dinosaurios", colors: ["#713f12", "#365314"] },
  { id: "Robot Home", emoji: "🏠", en: "Robot Home", es: "Casa Robot", colors: ["#1e3a8a", "#0f766e"] },
  { id: "Sunset Stage", emoji: "🌅", en: "Sunset Stage", es: "Escenario al atardecer", colors: ["#9a3412", "#be123c"] },
] as const;

export const FRAMES = [
  { id: "Gold Frame", en: "Gold Frame", es: "Marco dorado", color: "#facc15" },
  { id: "Neon Frame", en: "Neon Frame", es: "Marco neón", color: "#22d3ee" },
  { id: "Leaf Frame", en: "Leaf Frame", es: "Marco de hojas", color: "#4ade80" },
  { id: "Space Frame", en: "Space Frame", es: "Marco espacial", color: "#c084fc" },
] as const;



export function ArtworkPreview({ artwork, profile, canvasRef }: { artwork: ArtworkRecord; profile: LocalProfile; canvasRef?: RefObject<HTMLCanvasElement | null> }) {
  const ownCanvas = useRef<HTMLCanvasElement>(null);
  const canvas = canvasRef ?? ownCanvas;
  const [art, setArt] = useState<DirectorArt | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const subject = useMemo<RenderableMovieCharacter | undefined>(() => {
    const characters: RenderableMovieCharacter[] = [
      {key:"nico",kind:"nico",id:"nico",name:"Nico"},
      ...["Becca","Lua"].map(name => ({key:name,kind:"friend" as const,id:name.toLowerCase(),name})),
      {key:profile.robot.id,kind:"robot",id:profile.robot.id,name:profile.robot.name,robot:profile.robot},
      ...profile.monsters.map(monster=>({key:monster.id,kind:"monster" as const,id:monster.id,name:monster.name,monster})),
      ...profile.pets.map(pet=>({key:pet.id,kind:"pet" as const,id:pet.id,name:pet.name,pet})),
      ...mergeAnimalLibrary(profile.animals).map(animal=>({key:animal.id,kind:"animal" as const,id:animal.id,name:localizeAnimalCompat(animal,profile.language).name,animal})),
    ];
    return characters.find(item => item.name === artwork.subject);
  }, [artwork.subject, profile.robot, profile.monsters, profile.pets, profile.animals, profile.language]);
  const scene = ({"Starry Space":"space","Jungle Discovery":"jungle","Ocean Lab":"ocean","Dinosaur Valley":"dinosaur-valley","Robot Home":"robot-home","Sunset Stage":"star-stage"} as Record<string,string>)[artwork.background] ?? "space";
  useEffect(() => {
    let cancelled = false, loaded: DirectorArt | null = null;
    setArt(null); setError(false);
    loadDirectorArt(subject ? [subject] : [], profile.nico.profession, [scene]).then(result => {
      if (cancelled) { disposeDirectorArt(result); return; }
      loaded = result; setArt(result);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; disposeDirectorArt(loaded); };
  }, [subject, scene, profile.nico.profession, retry]);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const c = target.getContext("2d"); if (!c) return;
    c.clearRect(0,0,900,1050);
    if (!art) return;
    const frame = FRAMES.find(item=>item.id===artwork.frame) ?? FRAMES[0];
    c.fillStyle=frame.color;c.fillRect(0,0,900,1050);
    const backdrop=art.scenes.get(scene)!;
    // Cover the portrait without stretching the original scene.
    const ratio=Math.max(852/backdrop.width,1002/backdrop.height);
    c.save();c.beginPath();c.rect(24,24,852,1002);c.clip();
    c.drawImage(backdrop,450-backdrop.width*ratio/2,525-backdrop.height*ratio/2,backdrop.width*ratio,backdrop.height*ratio);
    const shade=c.createLinearGradient(0,0,0,1050);shade.addColorStop(0,"#071426dd");shade.addColorStop(.3,"#07142600");shade.addColorStop(.73,"#07142600");shade.addColorStop(1,"#071426ed");c.fillStyle=shade;c.fillRect(24,24,852,1002);
    const figure=subject && art.cast.get(subject.key);
    if(figure){const h=560*(artwork.scale ?? 1),w=h*figure.width/figure.height,x=450+(artwork.offset ?? 0)*2;
      c.save();c.shadowColor="#08172b99";c.shadowBlur=28;c.shadowOffsetY=14;c.drawImage(figure,x-w/2,805-h,w,h);c.restore();}
    c.fillStyle="#fff7dc";c.textAlign="center";c.font="bold 48px sans-serif";
    const wrap=(text:string,y:number,maxWidth:number,lineHeight:number,maxLines:number)=>{let line="",lines:string[]=[];for(const word of text.split(/\s+/)){const next=line?line+" "+word:word;if(c.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);lines.slice(0,maxLines).forEach((v,i)=>c.fillText(v,450,y+i*lineHeight,maxWidth));};
    wrap(artwork.title,110,730,56,2);
    c.font="bold 32px sans-serif";c.fillText(artwork.subject,450,864,720);
    c.font="26px sans-serif";wrap(artwork.caption,919,730,34,3);
    c.restore();
  }, [art, artwork, subject, scene, canvas]);
  return <article className="creative-poster-preview illustrated-poster" data-artwork-id={artwork.id} data-art-ready={Boolean(art)} aria-label={`${artwork.title}. ${artwork.subject}. ${artwork.caption}`}>
    <canvas ref={canvas} width={900} height={1050} role="img" aria-label={`${artwork.subject}: ${artwork.background}`} />
    <span className="illustrated-poster__text">{artwork.title}. {artwork.subject}. {artwork.caption}</span>
    {!art && <p className="illustrated-poster__status" role="status">{error ? (profile.language === "es-MX" ? "No se pudo cargar el arte." : "Artwork could not load.") : (profile.language === "es-MX" ? "Preparando tu lienzo…" : "Preparing your canvas…")}{error && <button type="button" onClick={()=>setRetry(n=>n+1)}>{profile.language === "es-MX" ? "Reintentar" : "Retry"}</button>}</p>}
  </article>;
}
