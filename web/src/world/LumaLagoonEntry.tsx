import "./starfall-entry.css";

export function LumaLagoonEntry({ es }: { es: boolean }) {
  return (
    <article className="starfall-entry luma-entry" aria-labelledby="luma-title">
      <img className="starfall-entry__coast" src="/games/luma-lagoon/postcard.webp" alt="" width="500" height="248" loading="lazy" />
      <div className="starfall-entry__copy">
        <h2 id="luma-title">{es ? "Laguna Luma" : "Luma Lagoon"}</h2>
        <p>{es
          ? "Cría a tu propio ajolote. Dale bayas lunares, atrapen luciérnagas y descubre cómo crece."
          : "Hatch your own axolotl. Share moon berries, catch fireflies, and discover how your little friend grows."}</p>
        <a href={es ? "/games/luma-lagoon/?lang=es-MX" : "/games/luma-lagoon/?lang=en"} data-testid="open-luma-lagoon">
          {es ? "Visitar la laguna" : "Visit the lagoon"}
        </a>
      </div>
    </article>
  );
}
