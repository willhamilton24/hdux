import type {
  CSSProperties,
  ChangeEvent,
  HTMLInputTypeAttribute,
  KeyboardEvent,
  FocusEvent,
} from "react";

export interface InputProps {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  type?: HTMLInputTypeAttribute;
  /** Override the corner/accent color */
  color?: string;
  cornerLength?: number;
  cornerWidth?: number;
  className?: string;
  style?: CSSProperties;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  /** Supplemental text displayed below the field */
  helperText?: string;
  /** Error message — sets aria-invalid and renders below the field in error color */
  errorText?: string;
  /** Native required attribute */
  required?: boolean;
  /** Native autocomplete attribute */
  autoComplete?: string;
  /** Native pattern attribute */
  pattern?: string;
  /** Native minlength attribute */
  minLength?: number;
  /** Native maxlength attribute */
  maxLength?: number;
  /** Native min attribute (number/date inputs) */
  min?: string | number;
  /** Native max attribute (number/date inputs) */
  max?: string | number;
  /** aria-label when no visible label is provided */
  "aria-label"?: string;
}
