interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "primary" | "success" | "warning" | "error";
  className?: string;
}

/**
 * Progress bar component for displaying progress or metrics
 */
export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = "primary",
  className = "",
}: ProgressBarProps): JSX.Element {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variantClasses = {
    primary: "bg-primary-500 dark:bg-primary-600",
    success: "bg-green-500 dark:bg-green-600",
    warning: "bg-yellow-500 dark:bg-yellow-600",
    error: "bg-red-500 dark:bg-red-600",
  };

  const ariaLabel = label || `Progress: ${percentage}%`;
  const progressValue = Math.round(value);
  const progressMax = Math.round(max);

  const progressBarProps: {
    className: string;
    style: { width: string };
    role: "progressbar";
    "aria-valuenow": number;
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-label": string;
    title: string;
  } = {
    className: `h-full rounded-full transition-all duration-500 ease-out ${variantClasses[variant]}`,
    style: { width: `${percentage}%` },
    role: "progressbar",
    "aria-valuenow": progressValue,
    "aria-valuemin": 0,
    "aria-valuemax": progressMax,
    "aria-label": ariaLabel,
    title: ariaLabel,
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div {...progressBarProps} />
      </div>
    </div>
  );
}
