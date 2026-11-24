import "./starfall-entry.css";

export function StarfallEntry({es}: {es: boolean}) {
 return (
  <article className="starfall-entry" aria-labelledby="starfall-title">
   <img className="starfall-entry__coast" src="/games/starfall-anglers/assets/cabo.png" alt="" width="512" height="256" />
   <div className="starfall-entry__copy">
    <h2 id="starfall-title">Starfall Anglers</h2>
    <p>{es?'Pesca bajo el Arco de Cabo o acompaña a Nico en busca del grifo estelar.':'Fish beneath Cabo Arch or join Nico on the trail of the Starwing Griffin.'}</p>
    <div className="starfall-entry__activities"><a href="/games/starfall-anglers/" data-testid="open-starfall-anglers">{es?'Ir a pescar':'Go fishing'} <span aria-hidden="true">→</span></a>
    <a className="starfall-entry__hunt" href="/games/starfall-anglers/#hunting" data-testid="open-starfall-hunting">{es?'Ir de cacería':'Go hunting'}</a>
    <a className="starfall-entry__hunt" href="/games/starfall-anglers/#expedition" data-testid="open-starfall-expedition">{es?'Expedición estelar':'Starlight Expedition'}</a></div>
   </div>
  </article>
 );
}
