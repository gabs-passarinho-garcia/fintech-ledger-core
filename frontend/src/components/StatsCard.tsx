import { type ReactNode } from "react";
import Card from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: "primary" | "success" | "warning" | "info";
  className?: string;
}

/**
 * Statistics card component with icon, value, and trend indicator
 */
export default function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = "primary",
  className = "",
}: StatsCardProps): JSX.Element {
  const variantClasses = {
    primary: "from-primary-500 to-primary-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    info: "from-blue-500 to-blue-600",
  };

  return (
    <Card className={`relative overflow-hidden ${className}`} hover gradient>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-semibold ${
                  trend.positive !== false
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.positive !== false ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${variantClasses[variant]} text-white shadow-lg`}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${variantClasses[variant]} opacity-10 rounded-full -mr-16 -mt-16`}
      />
    </Card>
  );
}
