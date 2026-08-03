import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultStore, PROFILE_EVENT, saveLocalStore, STORAGE_KEY } from "./storage";

class TestCustomEvent<T> extends Event {
  detail: T;

  constructor(type: string, init?: CustomEventInit<T>) {
    super(type);
    this.detail = init?.detail as T;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("same-tab profile synchronization", () => {
  it("emits one event only when the normalized store actually changes", () => {
    const values = new Map<string, string>();
    const target = new EventTarget();
    let events = 0;
    target.addEventListener(PROFILE_EVENT, () => { events += 1; });

    vi.stubGlobal("CustomEvent", TestCustomEvent);
    vi.stubGlobal("window", target);
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    const store = createDefaultStore();
    expect(saveLocalStore(store)).toBe(true);
    expect(events).toBe(1);
    expect(values.has(STORAGE_KEY)).toBe(true);

    expect(saveLocalStore(store)).toBe(true);
    expect(events).toBe(1);

    store.profiles[0].stars = 5;
    expect(saveLocalStore(store)).toBe(true);
    expect(events).toBe(2);
  });
});
