import { useRef, useState, useEffect, useMemo } from "react";
import { useTheme } from "../../theme/useTheme";
import { useBoxAnimation } from "./useBoxAnimation";
import { BoxContext } from "./BoxContext";
import type { BoxProps } from "./types";
import "./Box.css";

const LOADING_RECT_PADDING = 20; // px padding around loading text
const LOADING_EMPTY_SIZE = 40; // px side length when hideLoadingText + no text
const TRAVERSE_DURATION = 400; // ms — must match useBoxAnimation

export function Box({
  animation = "static",
  loadingText,
  hideLoadingText = false,
  hasLoaded = true,
  color,
  textColor,
  cornerColor,
  cornerLength,
  cornerWidth,
  loadingAnimations,
  fullBorder = false,
  noPadding = false,
  children,
  className,
  style,
}: BoxProps) {
  const { theme } = useTheme();

  // Resolve colors: specific prop -> color prop -> theme
  const resolvedCornerColor = cornerColor ?? color ?? theme.mainColor;
  const resolvedTextColor = textColor ?? color ?? theme.textColor;
  const resolvedCornerLen = cornerLength
    ? `${cornerLength}px`
    : theme.boxCorners.length;
  const resolvedCornerWid = cornerWidth
    ? `${cornerWidth}px`
    : theme.boxCorners.width;

  // Loading text to display
  const displayLoadingText =
    hideLoadingText ? "" : (loadingText ?? "LOADING");

  // Measure loading text width for centered loading rect
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingRectSize, setLoadingRectSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (animation === "static") return;
    if (hideLoadingText || !displayLoadingText) {
      setLoadingRectSize({ w: LOADING_EMPTY_SIZE, h: LOADING_EMPTY_SIZE });
      return;
    }
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setLoadingRectSize({
        w: rect.width + LOADING_RECT_PADDING * 2,
        h: rect.height + LOADING_RECT_PADDING * 2,
      });
    }
  }, [animation, displayLoadingText, hideLoadingText]);

  const {
    phase,
    cssClasses,
    loadingTextOpacity,
    contentOpacity,
    traverseAxis,
    showFullBorder,
  } = useBoxAnimation({
    animation,
    hasLoaded,
    loadingAnimations,
    fullBorder,
  });

  // Compute corner positions
  // In loading state: corners form a small rect centered in the container
  // In final state: corners are at the edges of the container
  const isAtFinal = traverseAxis === "both";
  const isVerticalDone =
    traverseAxis === "vertical" || traverseAxis === "both";
  const isHorizontalDone =
    traverseAxis === "horizontal" || traverseAxis === "both";

  const cornerPositions = getCornerPositions(
    animation,
    isAtFinal,
    isVerticalDone,
    isHorizontalDone,
    loadingRectSize
  );

  // CSS custom property values for animations
  const animVars: Record<string, string> = {};
  if (loadingAnimations?.textPulse) {
    const tp = loadingAnimations.textPulse;
    const dur = (tp.duration ?? 600) * 2;
    animVars["--hdux-box-pulse-duration"] = `${dur}ms`;
    if (tp.delayBetween)
      animVars["--hdux-box-pulse-delay"] = `${tp.delayBetween}ms`;
  }
  if (loadingAnimations?.cornerPulse) {
    const cp = loadingAnimations.cornerPulse;
    const dur = (cp.duration ?? 600) * 2;
    animVars["--hdux-box-corner-pulse-duration"] = `${dur}ms`;
    if (cp.delayBetween)
      animVars["--hdux-box-corner-pulse-delay"] = `${cp.delayBetween}ms`;
  }
  if (loadingAnimations?.cornerSpin) {
    const cs = loadingAnimations.cornerSpin;
    animVars["--hdux-box-spin-duration"] = `${(cs.duration ?? 400) * 4}ms`;
  }
  if (loadingAnimations?.textBlink) {
    animVars["--hdux-box-text-blink-iterations"] = String(
      Math.min(4, loadingAnimations.textBlink.iterations ?? 1)
    );
  }
  if (loadingAnimations?.cornerBlinkStart || loadingAnimations?.cornerBlinkEnd) {
    const iter =
      phase === "corner-blink-start"
        ? loadingAnimations?.cornerBlinkStart?.iterations
        : loadingAnimations?.cornerBlinkEnd?.iterations;
    animVars["--hdux-box-corner-blink-iterations"] = String(
      Math.min(4, iter ?? 1)
    );
  }
  if (loadingAnimations?.contentBlink) {
    animVars["--hdux-box-content-blink-iterations"] = String(
      Math.min(4, loadingAnimations.contentBlink.iterations ?? 1)
    );
  }

  const rootClasses = ["hdux-box", ...cssClasses];
  if (noPadding) rootClasses.push("hdux-box--no-padding");
  if (className) rootClasses.push(className);

  const boxContextValue = useMemo(() => ({ phase }), [phase]);

  return (
    <BoxContext.Provider value={boxContextValue}>
      <div
        ref={containerRef}
        className={rootClasses.join(" ")}
        style={
          {
            "--hdux-box-corner-color": resolvedCornerColor,
            "--hdux-box-text-color": resolvedTextColor,
            "--hdux-box-corner-len": resolvedCornerLen,
            "--hdux-box-corner-wid": resolvedCornerWid,
            ...animVars,
            ...style,
          } as React.CSSProperties
        }
      >
        {/* Corners */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className={`hdux-box-corner hdux-box-corner--${pos}`}
          style={{
            ...cornerPositions[pos],
            transition:
              animation !== "static"
                ? `top ${TRAVERSE_DURATION}ms ease-in-out, bottom ${TRAVERSE_DURATION}ms ease-in-out, left ${TRAVERSE_DURATION}ms ease-in-out, right ${TRAVERSE_DURATION}ms ease-in-out`
                : undefined,
          }}
        >
          <div className="hdux-box-corner-h" />
          <div className="hdux-box-corner-v" />
        </div>
      ))}

      {/* Full border lines */}
      {fullBorder && (
        <>
          <div
            className={`hdux-box-border hdux-box-border--top${showFullBorder ? " hdux-box-border--visible" : ""}`}
          />
          <div
            className={`hdux-box-border hdux-box-border--right${showFullBorder ? " hdux-box-border--visible" : ""}`}
          />
          <div
            className={`hdux-box-border hdux-box-border--bottom${showFullBorder ? " hdux-box-border--visible" : ""}`}
          />
          <div
            className={`hdux-box-border hdux-box-border--left${showFullBorder ? " hdux-box-border--visible" : ""}`}
          />
        </>
      )}

      {/* Loading text */}
      {animation !== "static" && (
        <div
          ref={textRef}
          className="hdux-box-loading-text"
          style={{ opacity: loadingTextOpacity }}
        >
          {displayLoadingText}
        </div>
      )}

        {/* Content */}
        <div
          className="hdux-box-content"
          style={{
            opacity: animation === "static" ? 1 : contentOpacity,
            // Hide content from layout during loading so it doesn't interfere
            // with the loading rect, but keep it rendered for measurement
            visibility:
              animation !== "static" && contentOpacity === 0
                ? "hidden"
                : "visible",
          }}
        >
          {children}
        </div>
      </div>
    </BoxContext.Provider>
  );
}

/**
 * Compute inline style positions for each corner based on animation state.
 */
function getCornerPositions(
  animation: BoxProps["animation"],
  isAtFinal: boolean,
  isVerticalDone: boolean,
  isHorizontalDone: boolean,
  loadingRectSize: { w: number; h: number }
): Record<"tl" | "tr" | "bl" | "br", React.CSSProperties> {
  if (animation === "static" || isAtFinal) {
    return {
      tl: { top: 0, left: 0 },
      tr: { top: 0, right: 0 },
      bl: { bottom: 0, left: 0 },
      br: { bottom: 0, right: 0 },
    };
  }

  // Loading/pre-final: corners centered around a small rect
  const halfW = loadingRectSize.w / 2;
  const halfH = loadingRectSize.h / 2;

  // For two-phase traversals, one axis may be done while the other isn't
  const topY = isVerticalDone ? 0 : `calc(50% - ${halfH}px)`;
  const bottomY = isVerticalDone ? 0 : `calc(50% - ${halfH}px)`;
  const leftX = isHorizontalDone ? 0 : `calc(50% - ${halfW}px)`;
  const rightX = isHorizontalDone ? 0 : `calc(50% - ${halfW}px)`;

  return {
    tl: { top: topY, left: leftX },
    tr: { top: topY, right: rightX },
    bl: { bottom: bottomY, left: leftX },
    br: { bottom: bottomY, right: rightX },
  };
}
