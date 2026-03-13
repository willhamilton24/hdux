import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnimationPhase,
  BoxAnimationMode,
  CornerBoxLoadingAnimationConfig,
} from "./types";

const BLINK_DURATION = 240; // ms per blink iteration
const TRAVERSE_DURATION = 400; // ms for corner slide
const TRAVERSE_STEP_GAP = 180; // ms gap between two-phase traverse steps
const FULL_BORDER_DELAY = 100; // ms before full border starts extending
const CONTENT_FADE = 250; // ms for content to appear

function clampIterations(n: number | undefined, def = 1): number {
  const v = n ?? def;
  return Math.max(1, Math.min(4, v));
}

interface UseBoxAnimationConfig {
  animation: BoxAnimationMode;
  hasLoaded: boolean;
  loadingAnimations?: CornerBoxLoadingAnimationConfig;
  fullBorder?: boolean;
}

interface UseBoxAnimationResult {
  phase: AnimationPhase;
  /** CSS classes to apply to the root .hdux-box element */
  cssClasses: string[];
  /** Opacity of the loading text */
  loadingTextOpacity: number;
  /** Opacity of the content area */
  contentOpacity: number;
  /** Whether corners are in their final positions */
  cornersAtFinal: boolean;
  /**
   * For two-phase traversals:
   * - verticalFirst: phase1 = vertical done, phase2 = horizontal done
   * - horizontalFirst: phase1 = horizontal done, phase2 = vertical done
   */
  traverseAxis: "none" | "vertical" | "horizontal" | "both";
  /** Whether full border lines should be visible */
  showFullBorder: boolean;
}

export function useBoxAnimation({
  animation,
  hasLoaded,
  loadingAnimations,
  fullBorder,
}: UseBoxAnimationConfig): UseBoxAnimationResult {
  const [phase, setPhase] = useState<AnimationPhase>(() =>
    animation === "static" ? "settled" : "idle"
  );
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasTransitioned = useRef(false);
  // Keep refs for object/optional deps so the transition effect
  // doesn't re-fire when a new object reference is passed.
  const loadingAnimationsRef = useRef(loadingAnimations);
  loadingAnimationsRef.current = loadingAnimations;
  const fullBorderRef = useRef(fullBorder);
  fullBorderRef.current = fullBorder;

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeouts.current.push(id);
    return id;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  // Static mode: always settled
  useEffect(() => {
    if (animation === "static") {
      setPhase("settled");
    }
  }, [animation]);

  // Start loading phase when not static and not yet loaded
  useEffect(() => {
    if (animation !== "static" && !hasLoaded) {
      hasTransitioned.current = false;
      setPhase("loading");
    }
  }, [animation, hasLoaded]);

  // Trigger the transition sequence once when hasLoaded becomes true
  useEffect(() => {
    if (animation === "static" || !hasLoaded) return;
    if (hasTransitioned.current) return;
    hasTransitioned.current = true;

    const anims = loadingAnimationsRef.current;
    const border = fullBorderRef.current;

    // Clear any pending timeouts from previous runs
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    let elapsed = 0;

    // Phase: text-blink
    const textBlinkIter = anims?.textBlink
      ? clampIterations(anims.textBlink.iterations)
      : 0;
    if (textBlinkIter > 0) {
      scheduleTimeout(() => setPhase("text-blink"), elapsed);
      elapsed += textBlinkIter * BLINK_DURATION;
    }

    // Phase: corner-blink-start
    const cornerBlinkStartIter = anims?.cornerBlinkStart
      ? clampIterations(anims.cornerBlinkStart.iterations)
      : 0;
    if (cornerBlinkStartIter > 0) {
      scheduleTimeout(() => setPhase("corner-blink-start"), elapsed);
      elapsed += cornerBlinkStartIter * BLINK_DURATION;
    }

    // Phase: traverse
    if (animation === "standard") {
      scheduleTimeout(() => setPhase("traverse-phase-1"), elapsed);
      elapsed += TRAVERSE_DURATION;
      // standard only needs one phase — both axes move together
      scheduleTimeout(() => setPhase("traverse-phase-2"), elapsed);
    } else if (animation === "verticalFirst" || animation === "horizontalFirst") {
      scheduleTimeout(() => setPhase("traverse-phase-1"), elapsed);
      elapsed += TRAVERSE_DURATION;
      scheduleTimeout(() => setPhase("traverse-phase-2"), elapsed + TRAVERSE_STEP_GAP);
      elapsed += TRAVERSE_STEP_GAP + TRAVERSE_DURATION;
    }

    // Phase: corner-blink-end
    const cornerBlinkEndIter = anims?.cornerBlinkEnd
      ? clampIterations(anims.cornerBlinkEnd.iterations)
      : 0;
    if (cornerBlinkEndIter > 0) {
      scheduleTimeout(() => setPhase("corner-blink-end"), elapsed);
      elapsed += cornerBlinkEndIter * BLINK_DURATION;
    }

    // Phase: content-reveal
    scheduleTimeout(() => setPhase("content-reveal"), elapsed);
    elapsed += CONTENT_FADE;

    // Phase: full-border (if enabled)
    if (border) {
      scheduleTimeout(() => setPhase("full-border"), elapsed + FULL_BORDER_DELAY);
      elapsed += FULL_BORDER_DELAY + 300; // 300ms for border extend transition
    }

    // Phase: settled
    scheduleTimeout(() => setPhase("settled"), elapsed);
  }, [animation, hasLoaded, scheduleTimeout]);

  // Derive output from current phase
  const isLoading = phase === "idle" || phase === "loading";
  const isPreTraverse =
    isLoading || phase === "text-blink" || phase === "corner-blink-start";

  // CSS classes for loading animations
  const cssClasses: string[] = [];
  if (isLoading && loadingAnimations) {
    if (loadingAnimations.textPulse) cssClasses.push("hdux-box--text-pulse");
    if (loadingAnimations.cornerPulse) cssClasses.push("hdux-box--corner-pulse");
    if (loadingAnimations.cornerSpin) cssClasses.push("hdux-box--corner-spin");
  }
  if (phase === "text-blink") cssClasses.push("hdux-box--text-blink");
  if (phase === "corner-blink-start" || phase === "corner-blink-end")
    cssClasses.push("hdux-box--corner-blink");
  if (phase === "content-reveal" && loadingAnimations?.contentBlink)
    cssClasses.push("hdux-box--content-blink");

  // Corner positions
  const cornersAtFinal = !isPreTraverse;

  // Traverse axis resolution
  let traverseAxis: UseBoxAnimationResult["traverseAxis"] = "none";
  if (phase === "settled" || phase === "full-border" || phase === "content-reveal" || phase === "corner-blink-end") {
    traverseAxis = "both";
  } else if (phase === "traverse-phase-2") {
    traverseAxis = "both";
  } else if (phase === "traverse-phase-1") {
    if (animation === "standard") {
      traverseAxis = "both";
    } else if (animation === "verticalFirst") {
      traverseAxis = "vertical";
    } else if (animation === "horizontalFirst") {
      traverseAxis = "horizontal";
    }
  }

  // Loading text
  const loadingTextOpacity = isLoading ? 1 : 0;

  // Content
  const showContent =
    phase === "content-reveal" ||
    phase === "full-border" ||
    phase === "settled";
  const contentOpacity = showContent ? 1 : 0;

  // Full border
  const showFullBorder =
    !!fullBorder && (phase === "full-border" || phase === "settled");

  return {
    phase,
    cssClasses,
    loadingTextOpacity,
    contentOpacity,
    cornersAtFinal,
    traverseAxis,
    showFullBorder,
  };
}
