import { forwardRef, useId } from "react";
import { useTheme } from "../../theme/useTheme";
import type { InputProps } from "./types";
import "./Input.css";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
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
    helperText,
    errorText,
    required,
    autoComplete,
    pattern,
    minLength,
    maxLength,
    min,
    max,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const { theme } = useTheme();
  const autoId = useId();
  const descId = useId();
  const id = idProp ?? autoId;

  const resolvedColor = color ?? theme.mainColor;
  const resolvedCornerLen = cornerLength
    ? `${cornerLength}px`
    : theme.boxCorners.length;
  const resolvedCornerWid = cornerWidth
    ? `${cornerWidth}px`
    : theme.boxCorners.width;

  const hasDesc = !!(helperText || errorText);
  const isInvalid = !!errorText;

  const wrapperClasses = ["hdux-input-wrapper"];
  if (disabled) wrapperClasses.push("hdux-input-wrapper--disabled");
  if (isInvalid) wrapperClasses.push("hdux-input-wrapper--error");
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
          {required && (
            <span className="hdux-input-required" aria-hidden="true">
              {" "}*
            </span>
          )}
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
          ref={ref}
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
          required={required}
          autoComplete={autoComplete}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          min={min}
          max={max}
          aria-label={ariaLabel}
          aria-describedby={hasDesc ? descId : undefined}
          aria-invalid={isInvalid || undefined}
          className="hdux-input-el"
        />
      </div>
      {hasDesc && (
        <span
          id={descId}
          className={isInvalid ? "hdux-input-error-text" : "hdux-input-helper-text"}
        >
          {isInvalid ? errorText : helperText}
        </span>
      )}
    </div>
  );
});
