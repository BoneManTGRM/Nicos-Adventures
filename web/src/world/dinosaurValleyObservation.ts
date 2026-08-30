export const DINOSAUR_VALLEY_OBSERVATIONS = ["footprints", "canopy", "herd-path"] as const;

export type DinosaurValleyObservation = typeof DINOSAUR_VALLEY_OBSERVATIONS[number];

export type DinosaurValleyObservationState = {
  completed: DinosaurValleyObservation[];
};

export const initialDinosaurValleyObservationState = (): DinosaurValleyObservationState => ({ completed: [] });

export function nextDinosaurValleyObservation(
  state: DinosaurValleyObservationState,
): DinosaurValleyObservation | null {
  return DINOSAUR_VALLEY_OBSERVATIONS[state.completed.length] ?? null;
}

export function observeDinosaurValleyClue(
  state: DinosaurValleyObservationState,
  observation: DinosaurValleyObservation,
): DinosaurValleyObservationState {
  if (state.completed.includes(observation)) return state;
  if (nextDinosaurValleyObservation(state) !== observation) return state;
  return { completed: [...state.completed, observation] };
}

export function isDinosaurValleyObservationComplete(state: DinosaurValleyObservationState): boolean {
  return state.completed.length === DINOSAUR_VALLEY_OBSERVATIONS.length;
}
