import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullAppSync from "./FullAppSync";
import NicoGuide from "./NicoGuide";
import ServiceWorkerRefresh from "./ServiceWorkerRefresh";
import NicoWorldExperience from "./nico/NicoWorldExperience";
import "./nico/nico-art-compat.css";
import "./nico/nico-phase2.css";
import "./nico/approved-nico-art.css";
import "./nico/nico-drag-studio.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServiceWorkerRefresh />
    <FullAppSync />
    <NicoGuide />
    <NicoWorldExperience />
  </StrictMode>
);
