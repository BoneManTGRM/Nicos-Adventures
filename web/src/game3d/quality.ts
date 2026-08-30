export type QualityTier = "low" | "medium" | "high";

export type QualityCapabilities = {
  hardwareConcurrency: number;
  deviceMemory: number | null;
  viewportWidth: number;
  saveData: boolean;
  reducedMotion: boolean;
};

export type QualityProfile = {
  tier: QualityTier;
  maxDpr: number;
  antialias: boolean;
  shadows: boolean;
  reducedMotion: boolean;
};

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function selectQualityProfile(capabilities: QualityCapabilities): QualityProfile {
  const constrained = capabilities.saveData ||
    capabilities.hardwareConcurrency <= 4 ||
    (capabilities.deviceMemory !== null && capabilities.deviceMemory <= 4);
  const compact = capabilities.viewportWidth <= 820;
  const tier: QualityTier = constrained
    ? "low"
    : compact || capabilities.hardwareConcurrency <= 8
      ? "medium"
      : "high";

  return {
    tier,
    maxDpr: tier === "low" ? 1 : tier === "medium" ? 1.5 : 2,
    antialias: tier !== "low",
    shadows: tier === "high",
    reducedMotion: capabilities.reducedMotion,
  };
}

export function readQualityProfile(): QualityProfile {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return selectQualityProfile({
      hardwareConcurrency: 4,
      deviceMemory: null,
      viewportWidth: 820,
      saveData: false,
      reducedMotion: false,
    });
  }

  const hints = navigator as NavigatorWithHints;
  return selectQualityProfile({
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
    deviceMemory: typeof hints.deviceMemory === "number" ? hints.deviceMemory : null,
    viewportWidth: window.innerWidth,
    saveData: hints.connection?.saveData === true,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  });
}
