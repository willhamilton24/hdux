import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../theme/useTheme";
import { useBoxContext } from "../Box/BoxContext";
import type { TextProps } from "./types";
import {
  VARIANT_ELEMENTS,
  VARIANT_FONT_SIZES,
  VARIANT_FONT_WEIGHTS,
} from "./types";
import "./Text.css";

const PRINT_CHAR_INTERVAL = 18; // ms per character
const SWEEP_DURATION = 600; // ms

export function Text({
  children,
  animation = "none",
  color,
  fontSize,
  fontFamily,
  variant = "body",
  className,
  style,
}: TextProps) {
  const { theme } = useTheme();
  const boxCtx = useBoxContext();

  // Resolve styling from variant -> theme -> props (props win)
  const themeVariantFont = theme.typography.variants[variant];
  const resolvedFontFamily =
    fontFamily ?? themeVariantFont ?? theme.typography.mainFont;
  const resolvedFontSize =
    fontSize != null
      ? typeof fontSize === "number"
        ? `${fontSize}px`
        : fontSize
      : VARIANT_FONT_SIZES[variant];
  const resolvedColor = color ?? theme.textColor;
  const resolvedWeight = VARIANT_FONT_WEIGHTS[variant];
  const tag = VARIANT_ELEMENTS[variant];

  // Determine if we should wait for a parent Box to settle
  const insideBox = boxCtx !== null;
  const boxSettled = !insideBox || boxCtx.phase === "settled";

  // Animation state
  const [animState, setAnimState] = useState<
    "waiting" | "animating" | "settled"
  >(() => {
    if (animation === "none") return "settled";
    if (insideBox && !boxSettled) return "waiting";
    return "animating";
  });

  // Start animation when box settles (or immediately if no box)
  useEffect(() => {
    if (animation === "none") {
      setAnimState("settled");
      return;
    }
    if (!boxSettled) {
      setAnimState("waiting");
      return;
    }
    // Box just settled (or no box) — start animating
    setAnimState("animating");
  }, [animation, boxSettled]);

  // Print animation: reveal characters one at a time
  const textContent = useMemo(() => extractText(children), [children]);
  const [visibleChars, setVisibleChars] = useState(0);
  const printTimerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (animation !== "print" || animState !== "animating") return;
    setVisibleChars(0);
    const total = textContent.length;
    if (total === 0) {
      setAnimState("settled");
      return;
    }
    let count = 0;
    printTimerRef.current = setInterval(() => {
      count++;
      setVisibleChars(count);
      if (count >= total) {
        clearInterval(printTimerRef.current);
        setAnimState("settled");
      }
    }, PRINT_CHAR_INTERVAL);
    return () => clearInterval(printTimerRef.current);
  }, [animation, animState, textContent]);

  // Sweep animation: let CSS handle it, settle after duration
  useEffect(() => {
    if (animation !== "sweep" || animState !== "animating") return;
    const id = setTimeout(() => setAnimState("settled"), SWEEP_DURATION);
    return () => clearTimeout(id);
  }, [animation, animState]);

  // Build CSS classes
  const classes = ["hdux-text"];
  if (animation === "print") classes.push("hdux-text--print");
  if (animation === "sweep") classes.push("hdux-text--sweep");
  if (animState === "animating") classes.push("hdux-text--animating");
  if (animState === "settled") classes.push("hdux-text--settled");
  if (className) classes.push(className);

  // Render content
  let renderedContent: React.ReactNode;
  if (animation === "print" && animState !== "settled") {
    // Render each character as a span with visibility controlled by index
    renderedContent = textContent.split("").map((char, i) => (
      <span
        key={i}
        className={`hdux-text-char${i < visibleChars ? " hdux-text-char--visible" : ""}`}
      >
        {char}
      </span>
    ));
  } else {
    renderedContent = children;
  }

  return createElement(
    tag,
    {
      className: classes.join(" "),
      style: {
        color: resolvedColor,
        fontSize: resolvedFontSize,
        fontFamily: resolvedFontFamily,
        fontWeight: resolvedWeight,
        "--hdux-text-sweep-duration": `${SWEEP_DURATION}ms`,
        ...style,
      } as React.CSSProperties,
    },
    renderedContent
  );
}

/** Recursively extract plain text from React children */
function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && "props" in node) {
    return extractText(node.props.children);
  }
  return "";
}
