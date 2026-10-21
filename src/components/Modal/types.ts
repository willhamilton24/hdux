import type { ReactNode, CSSProperties } from "react";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: ReactNode;
  /** Width of the dialog; number = px */
  width?: string | number;
  /** Override the corner/accent color */
  color?: string;
  cornerLength?: number;
  cornerWidth?: number;
  /** Clicking the backdrop closes the modal (default true) */
  closeOnBackdrop?: boolean;
  className?: string;
  style?: CSSProperties;
}
