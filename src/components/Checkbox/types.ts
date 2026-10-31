import type { InputHTMLAttributes } from "react";
import type { FormControlProps } from "../FormControl/FormControl";

/** Native input attributes plus Input-compatible theme and validation props.
 * className and style apply to the wrapper; the ref targets the native control.
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "color" | "type" | "children">, FormControlProps {}
