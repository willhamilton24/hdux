import { forwardRef } from "react";
import { FormControl } from "../FormControl/FormControl";
import type { SelectProps } from "./types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, errorText, color, cornerLength, cornerWidth, className, style,
    id, disabled, required, "aria-describedby": describedBy, "aria-invalid": invalid, ...props }, ref,
) {
  return (
    <FormControl kind="select" {...{ label, helperText, errorText, color, cornerLength, cornerWidth, className, style, id, disabled, required }}
      aria-describedby={describedBy} aria-invalid={invalid}>
      {(attributes) => <select {...props} {...attributes} ref={ref} disabled={disabled} required={required} className="hdux-input-el hdux-select-el" />}
    </FormControl>
  );
});
