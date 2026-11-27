import { useState } from "react";
import { tr } from "../i18n/core";
import { learningLabEnabled } from "../learning/enabled";
import type { LocalProfile, SectionId } from "../types";
import { WORLD_SECTIONS } from "./catalogs";
import { atlasGroups, destinationArt, destinationGroup, type AtlasFilter } from "./destinationAtlas";

export function DestinationDirectory({ profile, open, valleyUnlocked }: {
  profile: LocalProfile;
  open: (id: SectionId) => void;
  valleyUnlocked: boolean;
}) {
  const [filter, setFilter] = useState<AtlasFilter>("all");
  const language = profile.language;
  const es = language === "es-MX";
  const destinations = WORLD_SECTIONS.flatMap(section => {
    if (section.id === "world-map" || (section.id === "learning-lab" && !learningLabEnabled)) return [];
    return [{ ...section, id: section.id, group: destinationGroup[section.id] }];
  });
  const total = destinations.length + 1;
  const visited = destinations.filter(place => profile.sectionVisits[place.id]).length + Number(!!profile.nico.clubhouseVisited);
  const visible = destinations.filter(place => filter === "all" || place.group === filter);
  const showClubhouse = filter === "all" || filter === "home";
  const count = visible.length + Number(showClubhouse);
  return <>
    <header className="atlas-directory-head" id="destinations">
      <div className="atlas-directory-heading">
        <h2 tabIndex={-1} id="atlas-directory-title">{es ? "Guía de destinos" : "Destination guide"}</h2>
        <span className="atlas-passport" aria-label={es ? `Pasaporte: ${visited} de ${total} lugares visitados` : `Passport: ${visited} of ${total} places visited`}>
          <span aria-hidden="true">✧</span> {es ? "Pasaporte" : "Passport"} <b>{visited}/{total}</b>
        </span>
      </div>
      <div className="atlas-filters" role="group" aria-label={es ? "Filtrar destinos" : "Filter destinations"}>
        {(Object.keys(atlasGroups) as AtlasFilter[]).map(key => <button key={key} type="button" aria-controls="atlas-places" aria-pressed={key === filter} onClick={() => setFilter(key)}>{tr(atlasGroups[key], language)}</button>)}
      </div>
      <span role="status" className="sr-only">{es ? `${count} destinos` : `${count} destinations`}</span>
    </header>
    <section id="atlas-places" className="fw-destination-grid atlas-directory" aria-labelledby="atlas-directory-title" data-clubhouse={showClubhouse}>
      {visible.map(place => {
        const locked = place.id === "dinosaur-valley" && !valleyUnlocked;
        const title = tr(place.name, language);
        const description = locked
          ? es ? "Completa El Puente Estelar Roto para desbloquearlo." : "Complete The Broken Star Bridge to unlock."
          : tr(place.description, language);
        const stamped = !!profile.sectionVisits[place.id];
        return <button type="button" className={`fw-destination atlas-place${locked ? " is-locked" : ""}`} data-group={place.group} key={place.id}
          disabled={locked} onClick={() => open(place.id)} aria-label={`${title}. ${description}${stamped ? es ? " Ya visitado." : " Visited." : ""}`}>
          <span className="atlas-place__picture" aria-hidden="true">
            <img src={destinationArt(place.id)} alt="" loading="lazy" decoding="async" width="380" height="252" />
            {(locked || stamped) && <span className="atlas-place__stamp">{locked ? (es ? "Bloqueado" : "Locked") : (es ? "✓ Visitado" : "✓ Visited")}</span>}
          </span>
          <strong>{title}</strong>
          <small>{description}</small>
        </button>;
      })}
    </section>
  </>;
}
