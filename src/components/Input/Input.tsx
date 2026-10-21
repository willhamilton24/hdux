import { useId } from "react";
import { useTheme } from "../../theme/useTheme";
import type { InputProps } from "./types";
import "./Input.css";

export function Input({
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  readOnly = false,
  type = "text",
  color,
  cornerLength,
  cornerWidth,
  className,
  style,
  onFocus,
  onBlur,
  onKeyDown,
  id: idProp,
  name,
  autoFocus,
}: InputProps) {
  const { theme } = useTheme();
  const autoId = useId();
  const id = idProp ?? autoId;

  const resolvedColor = color ?? theme.mainColor;
  const resolvedCornerLen = cornerLength
    ? `${cornerLength}px`
    : theme.boxCorners.length;
  const resolvedCornerWid = cornerWidth
    ? `${cornerWidth}px`
    : theme.boxCorners.width;

  const wrapperClasses = ["hdux-input-wrapper"];
  if (disabled) wrapperClasses.push("hdux-input-wrapper--disabled");
  if (className) wrapperClasses.push(className);

  return (
    <div
      className={wrapperClasses.join(" ")}
      style={
        {
          "--hdux-input-color": resolvedColor,
          "--hdux-input-corner-len": resolvedCornerLen,
          "--hdux-input-corner-wid": resolvedCornerWid,
          ...style,
        } as React.CSSProperties
      }
    >
      {label && (
        <label htmlFor={id} className="hdux-input-label">
          {label}
        </label>
      )}
      <div className="hdux-input-field">
        {(["tl", "tr", "bl", "br"] as const).map((pos) => (
          <div key={pos} className={`hdux-input-corner hdux-input-corner--${pos}`}>
            <div className="hdux-input-corner-h" />
            <div className="hdux-input-corner-v" />
          </div>
        ))}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          className="hdux-input-el"
        />
      </div>
    </div>
  );
}
