import { useEffect } from "react";

const SERVICE_WORKER_VERSION = "v22";

export default function ServiceWorkerRefresh() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register(`/sw.js?release=${SERVICE_WORKER_VERSION}`, {
        scope: "/",
        updateViaCache: "none",
      })
      .then((registration) => registration.update())
      .catch(() => undefined);
  }, []);

  return null;
}
