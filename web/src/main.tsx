import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullAppSync from "./FullAppSync";
import NicoGuide from "./NicoGuide";
import NicoWorldExperience from "./nico/NicoWorldExperience";
import "./nico/nico-art-compat.css";
import "./nico/nico-phase2.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FullAppSync />
    <NicoGuide />
    <NicoWorldExperience />
  </StrictMode>
);
