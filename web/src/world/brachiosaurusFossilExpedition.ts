export const FOSSIL_LAYERS = ["river-silt", "fern-shale", "volcanic-ash"] as const;
export const BRUSH_ROUTE = ["outer-ridge", "vertebra", "femur"] as const;
export const BRACHIOSAURUS_PERIOD = "Jurassic";

export type FossilLayer = typeof FOSSIL_LAYERS[number];
export type BrushZone = typeof BRUSH_ROUTE[number];
export type FossilExpeditionStage = "survey" | "brush" | "classify" | "complete";

export type FossilExpeditionState = {
  layer: FossilLayer | null;
  brushed: BrushZone[];
  period: string | null;
};

export const initialFossilExpeditionState = (complete = false): FossilExpeditionState => ({
  layer: complete ? "fern-shale" : null,
  brushed: complete ? [...BRUSH_ROUTE] : [],
  period: complete ? BRACHIOSAURUS_PERIOD : null,
});

export function fossilExpeditionStage(state: FossilExpeditionState): FossilExpeditionStage {
  if (state.period === BRACHIOSAURUS_PERIOD) return "complete";
  if (state.brushed.length === BRUSH_ROUTE.length) return "classify";
  if (state.layer === "fern-shale") return "brush";
  return "survey";
}

export function selectFossilLayer(state: FossilExpeditionState, layer: FossilLayer): FossilExpeditionState {
  if (fossilExpeditionStage(state) !== "survey") return state;
  return state.layer === layer ? state : { ...state, layer };
}

export function brushFossilZone(state: FossilExpeditionState, zone: BrushZone): FossilExpeditionState {
  if (fossilExpeditionStage(state) !== "brush") return state;
  if (state.brushed.includes(zone)) return state;
  if (BRUSH_ROUTE[state.brushed.length] !== zone) return state;
  return { ...state, brushed: [...state.brushed, zone] };
}

export function classifyFossilPeriod(state: FossilExpeditionState, period: string): FossilExpeditionState {
  if (fossilExpeditionStage(state) !== "classify") return state;
  return state.period === period ? state : { ...state, period };
}
