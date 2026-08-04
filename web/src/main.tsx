import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AppShell from "./AppShell";
import "./nico/nico-art-compat.css";
import "./nico/nico-phase2.css";
import "./nico/approved-nico-art.css";
import "./nico/nico-drag-studio.css";
import "./nico/nico-about.css";
import "./nico/system-stabilization.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
