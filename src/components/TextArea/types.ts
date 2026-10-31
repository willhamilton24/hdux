import type { TextareaHTMLAttributes } from "react";
import type { FormControlProps } from "../FormControl/FormControl";

/** Native textarea attributes plus Input-compatible theme and validation props.
 * className and style apply to the wrapper; the ref targets the native control.
 */
export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "color">, FormControlProps {}
