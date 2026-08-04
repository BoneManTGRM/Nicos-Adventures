import { useCallback, useEffect, useMemo, useState } from "react";
import {
  loadLocalStore,
  normalizeStore,
  PROFILE_EVENT,
  saveLocalStore,
  touchProfile,
} from "../storage";
import type { LocalProfile, LocalSaveStore } from "../types";

export type ActiveProfileStore = {
  store: LocalSaveStore;
  profile: LocalProfile;
  commitProfile: (mutate: (profile: LocalProfile) => LocalProfile) => void;
  refresh: () => void;
};

export function getActiveProfile(store: LocalSaveStore): LocalProfile {
  return store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0];
}

export function useActiveProfileStore(): ActiveProfileStore {
  const [store, setStore] = useState<LocalSaveStore>(() => loadLocalStore());

  const refresh = useCallback(() => {
    setStore(loadLocalStore());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refresh);
    window.addEventListener(PROFILE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(PROFILE_EVENT, refresh);
    };
  }, [refresh]);

  const commitProfile = useCallback((mutate: (profile: LocalProfile) => LocalProfile) => {
    setStore((currentStore) => {
      const profiles = currentStore.profiles.map((profile) => profile.id === currentStore.activeProfileId
        ? touchProfile(mutate(profile))
        : profile);
      const next = normalizeStore({ ...currentStore, profiles });
      saveLocalStore(next);
      return next;
    });
  }, []);

  const profile = useMemo(() => getActiveProfile(store), [store]);

  return { store, profile, commitProfile, refresh };
}
