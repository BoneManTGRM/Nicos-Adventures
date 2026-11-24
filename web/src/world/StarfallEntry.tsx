import "./starfall-entry.css";

export function StarfallEntry({es}: {es: boolean}) {
 return (
  <article className="starfall-entry" aria-labelledby="starfall-title">
   <img className="starfall-entry__coast" src="/games/starfall-anglers/assets/cabo.png" alt="" width="512" height="256" />
   <div className="starfall-entry__copy">
    <h2 id="starfall-title">Starfall Anglers</h2>
    <p>{es?'Navega bajo el Arco de Cabo, pesca una mantarraya legendaria y alimenta a tus peces en el acuario.':'Sail beneath Cabo Arch, catch a legendary manta, and hand-feed the fish in your aquarium.'}</p>
    <a href="/games/starfall-anglers/" data-testid="open-starfall-anglers">{es?'Ir a pescar':'Go fishing'} <span aria-hidden="true">→</span></a>
   </div>
  </article>
 );
}
