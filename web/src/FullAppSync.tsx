import { useEffect, useState } from "react";
import FullApp from "./FullApp";
import { PROFILE_EVENT } from "./storage";

type ProfileEventDetail = { source?: string };

export default function FullAppSync() {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const synchronize = (event: Event) => {
      const detail = event instanceof CustomEvent
        ? event.detail as ProfileEventDetail | undefined
        : undefined;
      if (detail?.source === "app") return;
      setRevision((current) => current + 1);
    };

    window.addEventListener(PROFILE_EVENT, synchronize);
    return () => window.removeEventListener(PROFILE_EVENT, synchronize);
  }, []);

  return <FullApp key={revision} />;
}
