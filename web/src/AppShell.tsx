import FullApp from "./FullApp";
import NicoGuide from "./NicoGuide";
import ServiceWorkerRefresh from "./ServiceWorkerRefresh";
import { AppErrorBoundary } from "./app/AppErrorBoundary";
import { AppStoreProvider, useAppStore } from "./app/AppStoreContext";
import NicoPortalArt from "./nico/NicoPortalArt";
import NicoWorldExperience from "./nico/NicoWorldExperience";
import "./app/app-shell.css";

function SaveFailureNotice() {
  const { profile, saveState } = useAppStore();
  if (saveState.status !== "error") return null;
  return (
    <div className="app-save-failure" role="alert">
      <strong>{profile.language === "es-MX" ? "No se pudo guardar" : "Save failed"}</strong>
      <span>{profile.language === "es-MX"
        ? "El almacenamiento del navegador puede estar lleno o bloqueado. Descarga un respaldo antes de continuar."
        : "Browser storage may be full or blocked. Download a backup before continuing."}</span>
    </div>
  );
}

function AppExperience() {
  return (
    <AppErrorBoundary>
      <ServiceWorkerRefresh />
      <SaveFailureNotice />
      <FullApp />
      <NicoGuide />
      <NicoWorldExperience />
      <NicoPortalArt />
    </AppErrorBoundary>
  );
}

export default function AppShell() {
  return (
    <AppStoreProvider>
      <AppExperience />
    </AppStoreProvider>
  );
}
