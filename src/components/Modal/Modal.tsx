import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { tabbable } from "tabbable";
import { useTheme } from "../../theme/useTheme";
import type { ModalProps } from "./types";
import "./Modal.css";

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 480,
  color,
  cornerLength,
  cornerWidth,
  closeOnBackdrop = true,
  className,
  style,
}: ModalProps) {
  const { theme } = useTheme();
  const resolvedColor = color ?? theme.mainColor;
  const resolvedCornerLen = cornerLength
    ? `${cornerLength}px`
    : theme.boxCorners.length;
  const resolvedCornerWid = cornerWidth
    ? `${cornerWidth}px`
    : theme.boxCorners.width;

  const dialogRef = useRef<HTMLDivElement>(null);
  // Track the element that had focus when the modal opened so we can restore it.
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      // Recompute on every keypress: content, visibility and tab order can change.
      const candidates = tabbable(dialog);
      const index = candidates.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      if (candidates.length === 0) {
        dialog.focus();
        return;
      }
      // Escaped focus and programmatically focused non-tabbable descendants
      // enter at the appropriate boundary, just like the dialog container.
      const next = index === -1
        ? (e.shiftKey ? candidates.length - 1 : 0)
        : (index + (e.shiftKey ? -1 : 1) + candidates.length) % candidates.length;
      candidates[next].focus();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Cleanup runs on close, unmount and StrictMode replay. Restore before the
  // next setup captures focus, and never capture the dialog as its own trigger.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && !dialogRef.current?.contains(active)) {
      triggerRef.current = active;
    }
    dialogRef.current?.focus();
    return () => {
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus();
      }
      triggerRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  const resolvedWidth =
    typeof width === "number" ? `${width}px` : width;

  const hasHeader = title != null || onClose != null;

  const modal = (
    <div
      className="hdux-modal-backdrop"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={["hdux-modal", className].filter(Boolean).join(" ")}
        style={
          {
            "--hdux-modal-color": resolvedColor,
            "--hdux-modal-corner-len": resolvedCornerLen,
            "--hdux-modal-corner-wid": resolvedCornerWid,
            width: resolvedWidth,
            maxWidth: "calc(100vw - 48px)",
            ...style,
          } as React.CSSProperties
        }
      >
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div key={pos} className={`hdux-modal-corner hdux-modal-corner--${pos}`}>
            <div className="hdux-modal-corner-h" />
            <div className="hdux-modal-corner-v" />
          </div>
        ))}

        {hasHeader && (
          <div className="hdux-modal-header">
            {title && <span className="hdux-modal-title">{title}</span>}
            {onClose && (
              <button
                className="hdux-modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                ╳
              </button>
            )}
          </div>
        )}

        <div className="hdux-modal-body">{children}</div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}
