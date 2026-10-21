import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
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

  // Focus the dialog on open
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
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

  return createPortal(modal, document.body);
}
