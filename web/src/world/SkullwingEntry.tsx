import "./starfall-entry.css";

export function SkullwingEntry({ es }: { es: boolean }) {
  return (
    <article className="starfall-entry skullwing-entry" aria-labelledby="skullwing-title">
      <img className="starfall-entry__coast" src="/games/skullwing/poster.webp" alt="" width="500" height="281" loading="lazy" />
      <div className="starfall-entry__copy">
        <h2 id="skullwing-title">Skullwing</h2>
        <p>{es ? "Conviértete en un gorila azul con alas. Planea sobre los techos y derriba tres ciudades con tus puños, tus clavados y tu rugido." : "Become a giant winged gorilla. Glide over rooftops and bring down three cities with punches, diving stomps, and a thunderous roar."}</p>
        <a data-testid="open-skullwing" href={es ? "/games/skullwing/?lang=es-MX" : "/games/skullwing/?lang=en"}>
          {es ? "Jugar Skullwing" : "Play Skullwing"}
        </a>
      </div>
    </article>
  );
}
