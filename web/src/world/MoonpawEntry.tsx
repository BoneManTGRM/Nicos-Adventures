import "./starfall-entry.css";

export function MoonpawEntry({ es }: { es: boolean }) {
  return (
    <article className="starfall-entry moonpaw-entry" aria-labelledby="moonpaw-title">
      <img className="starfall-entry__coast" src="/games/moonpaw/assets/astral-jacket-keyart.webp" alt="" width="1800" height="817" loading="lazy" />
      <div className="starfall-entry__copy">
        <h2 id="moonpaw-title">Moonpaw: Star Breaker</h2>
        <p>{es
          ? "Vuela con Moonpaw, el gato mago, y abre túneles en nueve planetas. Explora a tu ritmo en Fácil o esquiva asteroides en Difícil."
          : "Fly with Moonpaw the spellcat and blast tunnels through nine planets. Explore at your own pace on Easy or dodge asteroids on Hard."}</p>
        <a href="/games/moonpaw/" data-testid="open-moonpaw">{es ? "Jugar Moonpaw" : "Play Moonpaw"}</a>
      </div>
    </article>
  );
}
