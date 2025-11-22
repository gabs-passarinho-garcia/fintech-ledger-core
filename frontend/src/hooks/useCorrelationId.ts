import { useEffect, useState } from "react";
import { getCorrelationId, resetCorrelationId } from "../utils/correlationId";

/**
 * Hook to manage correlation ID in React components
 * @returns Object with correlationId and reset function
 */
export function useCorrelationId(): {
  correlationId: string;
  reset: () => void;
} {
  const [correlationId, setCorrelationIdState] = useState<string>(() =>
    getCorrelationId(),
  );

  useEffect(() => {
    // Ensure correlation ID is set on mount
    const currentId = getCorrelationId();
    setCorrelationIdState(currentId);
  }, []);

  const reset = (): void => {
    const newId = resetCorrelationId();
    setCorrelationIdState(newId);
  };

  return {
    correlationId,
    reset,
  };
}
