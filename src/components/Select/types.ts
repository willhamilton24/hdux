import type { SelectHTMLAttributes } from "react";
import type { FormControlProps } from "../FormControl/FormControl";

/** Native select attributes plus Input-compatible theme and validation props.
 * className and style apply to the wrapper; the ref targets the native control.
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "color">, FormControlProps {}
