import {valid} from './pet.mjs';

const worldKey = 'nicos-world-local-save-v4';
const guestKey = 'nico-luma-lagoon-guest-v1';

export function openLagoon(storage) {
  function world() {
    const raw = storage.getItem(worldKey);
    if (raw === null) return null;
    const store = JSON.parse(raw);
    if (!Array.isArray(store.profiles)) throw Error('Invalid world save');
    return store;
  }
  const initial = world();
  const profile = initial?.profiles.find(p => p.id === initial.activeProfileId);
  if (initial && !profile) throw Error('Missing profile');
  const id = profile?.id;
  const guest = () => JSON.parse(storage.getItem(guestKey) || 'null');
  const checked = value => {
    if (value != null && !valid(value)) throw Error('Invalid pet save');
    return value ?? null;
  };
  function current(store) {
    const p = store?.profiles.find(entry => entry.id === id);
    if (!p) throw Error('Profile no longer exists');
    return p;
  }
  function read() {
    return checked(id ? current(world()).lumaLagoon : guest());
  }
  function write(pet) {
    if (!valid(pet)) throw Error('Invalid pet');
    if (!id) { storage.setItem(guestKey, JSON.stringify(pet)); return; }
    const store = world();
    const owner = current(store);
    owner.lumaLagoon = pet;
    owner.updatedAt = new Date().toISOString();
    storage.setItem(worldKey, JSON.stringify(store));
  }
  // A child can visit the direct link before creating a Nico's World profile.
  // Move that guest pet once, only after the destination write succeeds.
  if (id && !read()) {
    const fromGuest = checked(guest());
    if (fromGuest) { write(fromGuest); storage.removeItem(guestKey); }
  }
  return {read, write, language: profile?.language, lock: 'luma-lagoon.' + (id || 'guest')};
}
