// The browser has one speech engine. Acquiring it invalidates every older owner.
let owner: (() => void) | null = null;
export function cancelNarration(): void {
 const stop = owner; owner = null; stop?.();
}
export function acquireNarration(stop: () => void): () => void {
 cancelNarration(); owner = stop;
 return () => { if (owner === stop) owner = null; };
}
