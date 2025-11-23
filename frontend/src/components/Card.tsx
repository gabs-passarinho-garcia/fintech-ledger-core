import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

/**
 * Enhanced card component with hover effects and gradients
 */
export default function Card({
  children,
  className = "",
  hover = false,
  gradient = false,
  onClick,
}: CardProps): JSX.Element {
  const baseClasses = "card";
  const hoverClasses = hover
    ? "hover:shadow-lg dark:hover:shadow-float-dark transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    : "";
  const gradientClasses = gradient
    ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
    : "";

  if (onClick) {
    return (
      <div
        className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e): void => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}
    >
      {children}
    </div>
  );
}
