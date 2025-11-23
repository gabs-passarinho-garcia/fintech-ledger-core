import { useState } from "react";

interface SimpleChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
  color?: string; // Default color if item doesn't have its own color
  className?: string;
}

/**
 * Enhanced bar chart component with labels, axis, and better responsiveness
 * Uses SVG for rendering without external dependencies
 */
export default function SimpleChart({
  data,
  height = 300,
  color = "#2563eb",
  className = "",
}: SimpleChartProps): JSX.Element {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-gray-400 dark:text-gray-500 ${className}`}
        style={{ height: `${height}px` }}
      >
        <p>No data to display</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartHeight = height - 60; // Reserve space for labels and axis
  const chartWidth = 100;
  const padding = 8;
  const availableWidth = chartWidth - padding * 2;
  const barWidth = Math.min(availableWidth / data.length - 2, 15); // Max bar width, with spacing
  const sectionWidth = availableWidth / data.length; // Width of each section (bar + spacing)

  const handleBarMouseEnter = (
    index: number,
    event: React.MouseEvent<SVGRectElement>,
  ): void => {
    setHoveredIndex(index);
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget
      .closest("div")
      ?.getBoundingClientRect();
    if (container) {
      setTooltipPosition({
        x: rect.left - container.left + rect.width / 2,
        y: rect.top - container.top - 10,
      });
    }
  };

  const handleBarMouseLeave = (): void => {
    setHoveredIndex(null);
    setTooltipPosition(null);
  };

  const handleBarMouseMove = (
    event: React.MouseEvent<SVGRectElement>,
  ): void => {
    if (hoveredIndex !== null) {
      const rect = event.currentTarget.getBoundingClientRect();
      const container = event.currentTarget
        .closest("div")
        ?.getBoundingClientRect();
      if (container) {
        setTooltipPosition({
          x: rect.left - container.left + rect.width / 2,
          y: rect.top - container.top - 10,
        });
      }
    }
  };

  // Generate Y-axis tick values
  const tickCount = 5;
  const tickValues = Array.from(
    { length: tickCount + 1 },
    (_, i) => (maxValue / tickCount) * i,
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis line */}
          <line
            x1={padding}
            y1={10}
            x2={padding}
            y2={chartHeight + 10}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-300 dark:text-gray-600"
          />

          {/* Y-axis ticks and labels */}
          {tickValues.map((tick, index) => {
            const y = chartHeight + 10 - (tick / maxValue) * chartHeight;
            return (
              <g key={`tick-${index}`}>
                <line
                  x1={padding - 2}
                  y1={y}
                  x2={padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-300 dark:text-gray-600"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="2.5"
                  className="fill-gray-500 dark:fill-gray-400"
                >
                  {Math.round(tick)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            // Center each bar in its section
            const sectionCenter =
              padding + index * sectionWidth + sectionWidth / 2;
            const x = sectionCenter - barWidth / 2;
            const y = chartHeight + 10 - barHeight;
            const barColor = item.color || color;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={barColor}
                  opacity={hoveredIndex === index ? "1" : "0.8"}
                  className="transition-opacity cursor-pointer"
                  rx="2"
                  onMouseEnter={(e) => handleBarMouseEnter(index, e)}
                  onMouseLeave={handleBarMouseLeave}
                  onMouseMove={handleBarMouseMove}
                />

                {/* Value label on top of bar */}
                {barHeight > 15 && (
                  <text
                    x={sectionCenter}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize="3"
                    fontWeight="600"
                    className="fill-gray-700 dark:fill-gray-200 pointer-events-none"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div
          className="absolute bottom-0 left-0 right-0 flex justify-around px-2"
          style={{ height: "50px" }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-start min-w-0 px-1"
            >
              <span
                className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center break-words"
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredIndex !== null && tooltipPosition && (
          <div
            className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl p-3 min-w-[160px] border border-gray-700 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor: data[hoveredIndex].color || color,
                  }}
                />
                <span className="font-semibold text-sm">
                  {data[hoveredIndex].label}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Value:</span>
                  <span className="font-medium">
                    {data[hoveredIndex].value}
                  </span>
                </div>
                {totalValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Percentage:</span>
                    <span className="font-medium">
                      {((data[hoveredIndex].value / totalValue) * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Color:</span>
                  <span className="font-mono text-xs">
                    {data[hoveredIndex].color || color}
                  </span>
                </div>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
