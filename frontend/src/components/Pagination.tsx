interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showPageNumbers?: boolean;
}

/**
 * Pagination component with visual navigation
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  showPageNumbers = true,
}: PaginationProps): JSX.Element {
  const getPageNumbers = (): number[] => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [
        ...Array.from({ length: 4 }, (_, i) => i + 1),
        -1, // Ellipsis
        totalPages,
      ];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        -1, // Ellipsis
        ...Array.from({ length: 4 }, (_, i) => totalPages - 3 + i),
      ];
    }

    return [
      1,
      -1, // Ellipsis
      ...Array.from({ length: 3 }, (_, i) => currentPage - 1 + i),
      -1, // Ellipsis
      totalPages,
    ];
  };

  const handlePrevious = (): void => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (): void => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return <></>;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {showPageNumbers &&
        pageNumbers.map((page, index) => {
          if (page === -1) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => {
                onPageChange(page);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                page === currentPage
                  ? "bg-primary-500 dark:bg-primary-600 text-white shadow-md"
                  : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
