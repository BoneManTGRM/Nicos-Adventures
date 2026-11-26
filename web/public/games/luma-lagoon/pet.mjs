export const colors = ['coral', 'mint', 'violet'];
export const thresholds = [0, 8, 22];
export const meters = ['belly', 'joy', 'energy', 'clean'];
const hour = 3_600_000;
const clamp = (value, floor = 0) => Math.max(floor, Math.min(100, value));

export function hatch(name, color, now) {
  return {
    version: 1, name: name.trim().slice(0, 18) || 'Luma',
    color: colors.includes(color) ? color : 'coral', bond: 0, born: now,
    updated: now, sleeping: false, belly: 58, joy: 60, energy: 72, clean: 72,
  };
}

export function valid(pet) {
  return pet?.version === 1 && typeof pet.name === 'string' && pet.name.trim().length > 0
    && pet.name.length <= 18 && colors.includes(pet.color)
    && [pet.born, pet.updated, pet.bond].every(value => Number.isSafeInteger(value) && value >= 0)
    && typeof pet.sleeping === 'boolean'
    && meters.every(key => Number.isFinite(pet[key]) && pet[key] >= 0 && pet[key] <= 100);
}

export function advance(pet, now) {
  if (now <= pet.updated) return pet;
  // A long absence makes a pet ready for care, never sick or lost.
  const elapsed = Math.min((now - pet.updated) / hour, 24);
  const sleepHours = pet.sleeping ? Math.min(elapsed, (100 - pet.energy) / 55) : 0;
  const energy = clamp(pet.energy + sleepHours * 55 - (elapsed - sleepHours) * 3, 24);
  return {...pet, updated: now, energy, sleeping: pet.sleeping && sleepHours === elapsed && energy < 100,
    belly: clamp(pet.belly - elapsed * 5, 24), joy: clamp(pet.joy - elapsed * 3, 28),
    clean: clamp(pet.clean - elapsed * 2.5, 28)};
}

export function stage(bond) {
  return bond >= thresholds[2] ? 3 : bond >= thresholds[1] ? 2 : 1;
}

export function care(pet, action, now) {
  const p = advance(pet, now);
  if (action === 'nap' && p.sleeping) return {pet: {...p, sleeping: false}, note: 'woke'};
  if (p.sleeping) return {pet: p, note: 'asleep'};
  if (action === 'nap') {
    if (p.energy >= 99) return {pet: p, note: 'rested'};
    return {pet: {...p, sleeping: true, energy: Math.min(99, p.energy + 10), bond: p.bond + (p.energy < 85 ? 1 : 0)}, note: 'napping'};
  }
  if (action === 'play') {
    return {pet: {...p, joy: clamp(p.joy + 22), energy: clamp(p.energy - 8, 24),
      belly: clamp(p.belly - 7, 24), clean: clamp(p.clean - 8, 28), bond: p.bond + 3}, note: 'played'};
  }
  const key = action === 'feed' ? 'belly' : action === 'wash' ? 'clean' : null;
  if (!key) return {pet: p, note: ''};
  if (p[key] > 96) return {pet: p, note: action === 'feed' ? 'full' : 'shiny'};
  return {pet: {...p, [key]: clamp(p[key] + 26), bond: p.bond + 1}, note: action === 'feed' ? 'fed' : 'washed'};
}
