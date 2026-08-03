import { NicoCostumeFigure } from "./NicoCostumeFigure";
import "./nico-restore-launcher.css";

const OPEN_EVENT = "nicos-world-open-nico";

export default function NicoRestoreLauncher() {
  const openClubhouse = () => {
    if (window.location.hash !== "#nico/ask") {
      window.location.hash = "nico/ask";
    }
    window.dispatchEvent(
      new CustomEvent(OPEN_EVENT, { detail: { tab: "ask" } }),
    );
  };

  return (
    <button
      type="button"
      className="nico-restore-launcher"
      onClick={openClubhouse}
      aria-label="Open Nico's Clubhouse / Abrir Casa Club de Nico"
    >
      <span className="nico-restore-launcher__portrait" aria-hidden="true">
        <NicoCostumeFigure
          artSource=""
          profession="explorer"
          compact
          alt=""
        />
      </span>
      <span className="nico-restore-launcher__copy">
        <strong>Nico</strong>
        <small>Clubhouse</small>
      </span>
    </button>
  );
}
