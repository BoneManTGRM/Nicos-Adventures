import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullApp from "./FullApp";
import NicoGuide from "./NicoGuide";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FullApp />
    <NicoGuide />
  </StrictMode>
);
