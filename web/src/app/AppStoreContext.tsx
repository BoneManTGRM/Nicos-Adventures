import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  loadLocalStore,
  normalizeStore,
  PROFILE_EVENT,
  saveLocalStore,
  touchProfile,
  type ProfileEventDetail,
} from "../storage";
import type { LocalProfile, LocalSaveStore } from "../types";

export type SaveState = {
  status: "idle" | "saved" | "error";
  lastSavedAt: string | null;
  message: string | null;
};

export type AppStoreContextValue = {
  store: LocalSaveStore;
  profile: LocalProfile;
  setStore: Dispatch<SetStateAction<LocalSaveStore>>;
  updateProfile: (profile: LocalProfile) => void;
  commitProfile: (mutate: (profile: LocalProfile) => LocalProfile) => void;
  refreshStore: () => void;
  saveState: SaveState;
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function getActiveProfile(store: LocalSaveStore): LocalProfile {
  return store.profiles.find((profile) => profile.id === store.activeProfileId) ?? store.profiles[0];
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStoreState] = useState<LocalSaveStore>(() => loadLocalStore());
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    lastSavedAt: null,
    message: null,
  });

  const setStore = useCallback<Dispatch<SetStateAction<LocalSaveStore>>>((action) => {
    setStoreState((current) => normalizeStore(
      typeof action === "function"
        ? (action as (value: LocalSaveStore) => LocalSaveStore)(current)
        : action,
    ));
  }, []);

  const refreshStore = useCallback(() => {
    setStoreState(loadLocalStore());
  }, []);

  useEffect(() => {
    const saved = saveLocalStore(store, "app");
    setSaveState(saved
      ? { status: "saved", lastSavedAt: new Date().toISOString(), message: null }
      : {
          status: "error",
          lastSavedAt: null,
          message: "Nico's World could not save this change in the browser.",
        });
  }, [store]);

  useEffect(() => {
    const synchronize = (event: Event) => {
      if (event.type === "storage") {
        refreshStore();
        return;
      }
      const detail = event instanceof CustomEvent
        ? event.detail as ProfileEventDetail | undefined
        : undefined;
      if (!detail || detail.source === "app") return;
      setStoreState(normalizeStore(detail.store));
    };

    window.addEventListener("storage", synchronize);
    window.addEventListener(PROFILE_EVENT, synchronize);
    return () => {
      window.removeEventListener("storage", synchronize);
      window.removeEventListener(PROFILE_EVENT, synchronize);
    };
  }, [refreshStore]);

  const profile = useMemo(() => getActiveProfile(store), [store]);

  const updateProfile = useCallback((nextProfile: LocalProfile) => {
    setStore((current) => ({
      ...current,
      profiles: current.profiles.map((profile) => profile.id === current.activeProfileId
        ? touchProfile(nextProfile)
        : profile),
    }));
  }, [setStore]);

  const commitProfile = useCallback((mutate: (profile: LocalProfile) => LocalProfile) => {
    setStore((current) => {
      const active = getActiveProfile(current);
      const nextProfile = touchProfile(mutate(active));
      return {
        ...current,
        profiles: current.profiles.map((profile) => profile.id === current.activeProfileId
          ? nextProfile
          : profile),
      };
    });
  }, [setStore]);

  const value = useMemo<AppStoreContextValue>(() => ({
    store,
    profile,
    setStore,
    updateProfile,
    commitProfile,
    refreshStore,
    saveState,
  }), [commitProfile, profile, refreshStore, saveState, setStore, store, updateProfile]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreContextValue {
  const value = useContext(AppStoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
}
