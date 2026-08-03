import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import NicoEnhancedApp from "./NicoEnhancedApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NicoEnhancedApp />
  </StrictMode>
);
