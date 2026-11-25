import "./starfall-entry.css";

export function TimberlineEntry({ es }: { es: boolean }) {
  return (
    <article className="starfall-entry timberline-entry" aria-labelledby="timberline-title">
      <img className="starfall-entry__coast" src="/games/timberline-hunt/assets/trails/north.webp" alt="" loading="lazy" width="560" height="190" />
      <div className="starfall-entry__copy">
        <h2 id="timberline-title">Timberline Hunt</h2>
        <p>{es
          ? "Sigue las huellas de osos, leones y elefantes, y exhibe tus mejores trofeos."
          : "Track bears, lions, and elephants across wild reserves, then mount your best finds in the trophy room."}</p>
        <a href="/games/timberline-hunt/" data-testid="open-timberline-hunt">{es ? "Jugar en inglés" : "Go hunting"}</a>
      </div>
    </article>
  );
}
