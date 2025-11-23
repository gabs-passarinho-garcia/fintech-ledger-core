import { type ReactNode } from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "primary"
  | "secondary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

/**
 * Badge component for displaying status, labels, or achievements
 */
export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}: BadgeProps): JSX.Element {
  const variantClasses = {
    success:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
    error:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    primary:
      "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-700",
    secondary:
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
