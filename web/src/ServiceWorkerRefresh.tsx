import { useEffect } from "react";

const LEGACY_SERVICE_WORKER_VERSION = "v18";
const SERVICE_WORKER_VERSION = "v19";
const RELOAD_KEY = `nicos-world-${SERVICE_WORKER_VERSION}-reloaded`;

export default function ServiceWorkerRefresh() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let disposed = false;
    const onControllerChange = () => {
      if (disposed || sessionStorage.getItem(RELOAD_KEY) === "1") return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void navigator.serviceWorker
      .register(`/sw.js?release=${SERVICE_WORKER_VERSION}`, {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => registration.update())
      .catch(() => undefined);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}

void LEGACY_SERVICE_WORKER_VERSION;
