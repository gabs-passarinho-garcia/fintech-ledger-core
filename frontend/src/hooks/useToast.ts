import { useState, useCallback } from "react";
import type { ToastData } from "../components/ToastContainer";

/**
 * Hook for managing toast notifications
 */
export function useToast(): {
  toasts: ToastData[];
  showToast: (
    message: string,
    type?: ToastData["type"],
    duration?: number,
  ) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
} {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (message: string, type?: ToastData["type"], duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastData = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "success", duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "error", duration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "warning", duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "info", duration);
    },
    [showToast],
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
