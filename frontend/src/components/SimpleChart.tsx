interface SimpleChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  className?: string;
}

/**
 * Simple bar chart component using SVG (no external dependencies)
 */
export default function SimpleChart({
  data,
  height = 200,
  color = "#2563eb",
  className = "",
}: SimpleChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-${height} text-gray-400 dark:text-gray-500 ${className}`}
      >
        <p>No data to display</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;
  const padding = 2;

  return (
    <div className={`w-full ${className}`}>
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          const x = (index * 100) / data.length;
          const width = barWidth - padding * 2;

          return (
            <g key={index}>
              <rect
                x={x + padding}
                y={height - barHeight}
                width={width}
                height={barHeight}
                fill={color}
                opacity="0.8"
                className="hover:opacity-100 transition-opacity"
              >
                <title>
                  {item.label}: {item.value}
                </title>
              </rect>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
        {data.map((item, index) => (
          <span key={index} className="truncate" title={item.label}>
            {item.label.length > 8
              ? `${item.label.slice(0, 8)}...`
              : item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
