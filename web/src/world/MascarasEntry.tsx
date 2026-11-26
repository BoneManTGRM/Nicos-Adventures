import "./starfall-entry.css";

export function MascarasEntry({ es }: { es: boolean }) {
  return (
    <article className="starfall-entry mascaras-entry" aria-labelledby="mascaras-title">
      <img className="starfall-entry__coast" src="/games/mascaras-del-volcan/cover.webp" alt="" width="560" height="373" loading="lazy" />
      <div className="starfall-entry__copy">
        <h2 id="mascaras-title">Máscaras del Volcán</h2>
        <p>{es ? "Lucha en pareja por el cinturón en cinco arenas de México. Da el relevo, salva a tu compañero y prepara un remate doble." : "Team up for the belt across five Mexican arenas. Tag in a fresh wrestler, save your partner at two, and land a double-team finisher."}</p>
        <a data-testid="open-mascaras" href={es ? "/games/mascaras-del-volcan/?lang=es-MX" : "/games/mascaras-del-volcan/?lang=en"}>
          {es ? "Jugar Máscaras del Volcán" : "Play Máscaras del Volcán"}
        </a>
      </div>
    </article>
  );
}
