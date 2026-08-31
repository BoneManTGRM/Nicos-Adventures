export const FRIENDLY_DUEL_ID = "Friendship Duel";
export const FRIENDLY_DUEL_MISSION = "arcade:friendly-duel:first-friend";

export type FriendlyDuelMove = "quick" | "block" | "star";
export type FriendlyDuelStatus = "playing" | "won" | "breather";
export type FriendlyDuelEvent = "ready" | "quick" | "blocked" | "star" | "rival" | "won" | "breather";

export type FriendlyDuelState = Readonly<{
  nicoCourage: number;
  rivalMischief: number;
  starCharge: number;
  round: number;
  status: FriendlyDuelStatus;
  lastEvent: FriendlyDuelEvent;
  lastMove: FriendlyDuelMove | null;
}>;

export const FRIENDLY_DUEL_MAX = 6;

export const initialFriendlyDuelState: FriendlyDuelState = {
  nicoCourage: FRIENDLY_DUEL_MAX,
  rivalMischief: FRIENDLY_DUEL_MAX,
  starCharge: 1,
  round: 1,
  status: "playing",
  lastEvent: "ready",
  lastMove: null,
};

export function playFriendlyDuelMove(state: FriendlyDuelState, move: FriendlyDuelMove): FriendlyDuelState {
  if (state.status !== "playing") return state;
  if (move === "star" && state.starCharge < 2) return state;

  const playerPower = move === "quick" ? 1 : move === "star" ? 2 : 0;
  const nextMischief = Math.max(0, state.rivalMischief - playerPower);
  const nextCharge = move === "star" ? 0 : Math.min(2, state.starCharge + 1);
  if (nextMischief === 0) {
    return {
      ...state,
      rivalMischief: 0,
      starCharge: nextCharge,
      status: "won",
      lastEvent: "won",
      lastMove: move,
    };
  }

  const rivalPower = state.round % 3 === 0 ? 2 : 1;
  const nextCourage = Math.max(0, state.nicoCourage - (move === "block" ? 0 : rivalPower));
  if (nextCourage === 0) {
    return {
      ...state,
      nicoCourage: 0,
      rivalMischief: nextMischief,
      starCharge: nextCharge,
      status: "breather",
      lastEvent: "breather",
      lastMove: move,
    };
  }

  return {
    nicoCourage: nextCourage,
    rivalMischief: nextMischief,
    starCharge: nextCharge,
    round: state.round + 1,
    status: "playing",
    lastEvent: move === "block" ? "blocked" : move === "star" ? "star" : state.round % 2 === 0 ? "rival" : "quick",
    lastMove: move,
  };
}

export function friendlyDuelScore(state: FriendlyDuelState): number {
  return state.status === "won" ? state.nicoCourage * 100 + Math.max(0, 100 - state.round * 5) : 0;
}
