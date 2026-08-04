import { useAppStore } from "../app/AppStoreContext";
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

/**
 * Compatibility adapter for feature modules that have not yet moved to useAppStore.
 * AppShell owns the only live store instance; this hook never creates a second store.
 */
export function useActiveProfileStore(): ActiveProfileStore {
  const { store, profile, commitProfile, refreshStore } = useAppStore();
  return { store, profile, commitProfile, refresh: refreshStore };
}
