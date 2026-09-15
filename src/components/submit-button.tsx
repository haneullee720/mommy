"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./ui";

export function SubmitButton({
  children,
  pendingText = "처리 중...",
  variant = "primary",
  size = "md",
  className,
  disabled,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "secondary" | "ghost" | "dark" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={buttonClass(variant, size, className)}>
      {pending ? pendingText : children}
    </button>
  );
}
