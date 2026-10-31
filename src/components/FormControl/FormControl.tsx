import { useId, type AriaAttributes, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "../../theme/useTheme";
import type { InputProps } from "../Input/types";
import "../Input/Input.css";
import "./FormControl.css";

export type FormControlProps = Pick<InputProps,
  "label" | "helperText" | "errorText" | "color" | "cornerLength" | "cornerWidth" |
  "className" | "style" | "id" | "disabled" | "required"
> & Pick<AriaAttributes, "aria-describedby" | "aria-invalid">;

type ControlAttributes = Pick<AriaAttributes, "aria-describedby" | "aria-invalid"> & { id: string };

/** Shared presentation for the additional native form controls. */
export function FormControl({
  label, helperText, errorText, color, cornerLength, cornerWidth, className, style,
  id: idProp, disabled, required, kind, children,
  "aria-describedby": describedBy, "aria-invalid": invalid,
}: FormControlProps & {
  kind: "select" | "checkbox" | "textarea";
  children: (attributes: ControlAttributes) => ReactNode;
}) {
  const { theme } = useTheme();
  const autoId = useId();
  const descId = useId();
  const id = idProp ?? autoId;
  const description = errorText || helperText;
  const labelElement = label && (
    <label htmlFor={id} className="hdux-input-label">
      {label}{required && <span className="hdux-input-required" aria-hidden="true"> *</span>}
    </label>
  );
  const field = (
    <div className="hdux-input-field">
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div key={pos} className={`hdux-input-corner hdux-input-corner--${pos}`} aria-hidden="true">
          <div className="hdux-input-corner-h" /><div className="hdux-input-corner-v" />
        </div>
      ))}
      {children({
        id,
        "aria-describedby": [describedBy, description ? descId : undefined].filter(Boolean).join(" ") || undefined,
        "aria-invalid": errorText ? true : invalid,
      })}
    </div>
  );
  return (
    <div
      className={["hdux-input-wrapper", `hdux-${kind}-wrapper`, disabled && "hdux-input-wrapper--disabled", errorText && "hdux-input-wrapper--error", className].filter(Boolean).join(" ")}
      style={{
        "--hdux-input-color": errorText ? "#ff3b3b" : (color ?? theme.mainColor),
        "--hdux-input-corner-len": cornerLength === undefined ? theme.boxCorners.length : `${cornerLength}px`,
        "--hdux-input-corner-wid": cornerWidth === undefined ? theme.boxCorners.width : `${cornerWidth}px`,
        ...style,
      } as CSSProperties}
    >
      {kind === "checkbox" ? <div className="hdux-checkbox-row">{field}{labelElement}</div> : <>{labelElement}{field}</>}
      {description && <span id={descId} className={errorText ? "hdux-input-error-text" : "hdux-input-helper-text"}>{description}</span>}
    </div>
  );
}
