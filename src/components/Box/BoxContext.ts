import { createContext, useContext } from "react";
import type { AnimationPhase } from "./types";

export interface BoxContextValue {
  phase: AnimationPhase;
}

export const BoxContext = createContext<BoxContextValue | null>(null);

/** Returns the parent Box's animation phase, or null if not inside a Box. */
export function useBoxContext(): BoxContextValue | null {
  return useContext(BoxContext);
}
