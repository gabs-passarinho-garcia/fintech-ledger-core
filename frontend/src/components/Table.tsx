import { useState, type ReactNode } from "react";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

/**
 * Enhanced reusable table component with sorting
 */
export default function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}: TableProps<T>): JSX.Element {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: Column<T>): void => {
    if (!column.sortable && !column.sortFn) {
      return;
    }

    if (sortKey === column.key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortKey(column.key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data];
  if (sortKey && sortDirection) {
    const column = columns.find((col) => col.key === sortKey);
    if (column?.sortFn) {
      sortedData.sort((a, b) => {
        const result = column.sortFn ? column.sortFn(a, b) : 0;
        return sortDirection === "asc" ? result : -result;
      });
    }
  }

  if (sortedData.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card overflow-x-auto ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column) => {
                const isSortable = column.sortable || !!column.sortFn;
                const isSorted = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    onClick={() => {
                      handleSort(column);
                    }}
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                      isSortable
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors select-none"
                        : ""
                    } ${column.className || ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {isSortable && (
                        <span className="inline-flex flex-col">
                          <svg
                            className={`w-3 h-3 ${
                              isSorted && sortDirection === "asc"
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <svg
                            className={`w-3 h-3 -mt-1 ${
                              isSorted && sortDirection === "desc"
                                ? "text-primary-600 dark:text-primary-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-gray-100 dark:border-gray-700/50 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    : ""
                } ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"}`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-gray-900 dark:text-gray-100 ${column.className || ""}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
