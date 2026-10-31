import { forwardRef } from "react";
import { FormControl } from "../FormControl/FormControl";
import type { TextAreaProps } from "./types";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, helperText, errorText, color, cornerLength, cornerWidth, className, style,
    id, disabled, required, "aria-describedby": describedBy, "aria-invalid": invalid, ...props }, ref,
) {
  return (
    <FormControl kind="textarea" {...{ label, helperText, errorText, color, cornerLength, cornerWidth, className, style, id, disabled, required }}
      aria-describedby={describedBy} aria-invalid={invalid}>
      {(attributes) => <textarea rows={4} {...props} {...attributes} ref={ref} disabled={disabled} required={required} className="hdux-input-el hdux-textarea-el" />}
    </FormControl>
  );
});
