import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FullApp from "./FullApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FullApp />
  </StrictMode>
);
