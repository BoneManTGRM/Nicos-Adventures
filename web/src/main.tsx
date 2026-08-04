import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullAppSync from "./FullAppSync";
import NicoGuide from "./NicoGuide";
import ServiceWorkerRefresh from "./ServiceWorkerRefresh";
import NicoPortalArt from "./nico/NicoPortalArt";
import NicoWorldExperience from "./nico/NicoWorldExperience";
import "./nico/nico-art-compat.css";
import "./nico/nico-phase2.css";
import "./nico/approved-nico-art.css";
import "./nico/nico-drag-studio.css";
import "./nico/nico-about.css";
import "./nico/system-stabilization.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServiceWorkerRefresh />
    <FullAppSync />
    <NicoGuide />
    <NicoWorldExperience />
    <NicoPortalArt />
  </StrictMode>
);
