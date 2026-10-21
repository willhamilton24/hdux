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
}
