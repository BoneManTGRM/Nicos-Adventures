import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullApp from "./FullApp";
import NicoGuide from "./NicoGuide";
import NicoWorldExperience from "./nico/NicoWorldExperience";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FullApp />
    <NicoGuide />
    <NicoWorldExperience />
  </StrictMode>
);
