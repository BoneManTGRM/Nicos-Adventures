import brokenMap1672 from "../assets/world/nicos-world-map-1672.webp";
import brokenMap960 from "../assets/world/nicos-world-map-960.webp";
import restoredMap1672 from "../assets/world/nicos-world-map-restored-1672.webp";
import restoredMap960 from "../assets/world/nicos-world-map-restored-960.webp";

export function IllustratedWorldFallback({
  alt,
  unavailableMessage,
  dinosaurValleyAvailable,
}: {
  alt: string;
  unavailableMessage: string;
  dinosaurValleyAvailable: boolean;
}) {
  const map960 = dinosaurValleyAvailable ? restoredMap960 : brokenMap960;
  const map1672 = dinosaurValleyAvailable ? restoredMap1672 : brokenMap1672;

  return (
    <div className="world-atlas-fallback" role="alert" data-valley-status={dinosaurValleyAvailable ? "open" : "locked"}>
      <picture className="world-atlas-fallback__art" data-map-art="premium-storybook">
        <source media="(max-width: 700px)" srcSet={map960} />
        <img
          src={map1672}
          srcSet={`${map960} 960w, ${map1672} 1672w`}
          sizes="(max-width: 700px) 960px, 1672px"
          width="1672"
          height="941"
          alt={alt}
          decoding="async"
        />
      </picture>
      <p>{unavailableMessage}</p>
    </div>
  );
}
