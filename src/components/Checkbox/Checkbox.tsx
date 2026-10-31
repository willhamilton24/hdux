import { forwardRef } from "react";
import { FormControl } from "../FormControl/FormControl";
import type { CheckboxProps } from "./types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, helperText, errorText, color, cornerLength, cornerWidth, className, style,
    id, disabled, required, "aria-describedby": describedBy, "aria-invalid": invalid, ...props }, ref,
) {
  return (
    <FormControl kind="checkbox" {...{ label, helperText, errorText, color, cornerLength, cornerWidth, className, style, id, disabled, required }}
      aria-describedby={describedBy} aria-invalid={invalid}>
      {(attributes) => <input type="checkbox" {...props} {...attributes} ref={ref} disabled={disabled} required={required} className="hdux-input-el hdux-checkbox-el" />}
    </FormControl>
  );
});
