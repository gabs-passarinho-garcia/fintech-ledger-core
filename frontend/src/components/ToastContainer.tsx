import Toast, { type ToastType } from "./Toast";

export interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

/**
 * Container component for managing multiple toast notifications
 */
export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps): JSX.Element {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => {
            onRemove(toast.id);
          }}
        />
      ))}
    </div>
  );
}
