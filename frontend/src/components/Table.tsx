import { type ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

/**
 * Reusable table component
 */
export default function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
}: TableProps<T>): JSX.Element {
  if (data.length === 0) {
    return (
      <div className={`card ${className}`}>
        <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`card overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${column.className || ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-gray-100 ${onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-sm text-gray-900 ${column.className || ""}`}
                >
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
