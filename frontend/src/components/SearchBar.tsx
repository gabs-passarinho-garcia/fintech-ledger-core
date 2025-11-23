import { useState } from "react";
import Input from "./Input";
import Badge from "./Badge";

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  placeholder?: string;
  filters?: FilterOption[];
  className?: string;
}

/**
 * Search bar component with advanced filtering capabilities
 */
export default function SearchBar({
  onSearch,
  onFilterChange,
  placeholder = "Search...",
  filters = [],
  className = "",
}: SearchBarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string): void => {
    const newFilters = { ...activeFilters };
    if (value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const removeFilter = (key: string): void => {
    handleFilterChange(key, "");
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          leftIcon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          className="w-full"
        />
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={activeFilters[filter.key] || ""}
              onChange={(e) => {
                handleFilterChange(filter.key, e.target.value);
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              title={`Filter by ${filter.label}`}
              aria-label={`Filter by ${filter.label}`}
            >
              <option value="">All {filter.label}</option>
              <option value={filter.value}>{filter.label}</option>
            </select>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Active filters:
          </span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            return (
              <div key={key} className="inline-flex items-center">
                <Badge
                  variant="info"
                  size="sm"
                  className="cursor-pointer hover:opacity-80"
                >
                  {filter?.label || key}: {value}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(key);
                    }}
                    className="ml-1.5 hover:opacity-70"
                    aria-label="Remove filter"
                    type="button"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            );
          })}
          <button
            onClick={() => {
              setActiveFilters({});
              onFilterChange?.({});
            }}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            type="button"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
