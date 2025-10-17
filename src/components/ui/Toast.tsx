import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: number;
  message: string;
  title?: string;
  variant: ToastVariant;
  duration: number; // ms
};

type ToastContextType = {
  addToast: (t: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = idRef.current++;
    const item: ToastItem = { id, ...t };
    setToasts((prev) => [...prev, item]);
    // auto dismiss
    window.setTimeout(() => removeToast(id), t.duration);
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');

  const show = useCallback((message: string, variant: ToastVariant = 'info', opts?: { title?: string; duration?: number }) => {
    ctx.addToast({
      message,
      title: opts?.title,
      variant,
      duration: opts?.duration ?? 4000,
    });
  }, [ctx]);

  return {
    toast: {
      success: (message: string, opts?: { title?: string; duration?: number }) => show(message, 'success', opts),
      error: (message: string, opts?: { title?: string; duration?: number }) => show(message, 'error', opts),
      info: (message: string, opts?: { title?: string; duration?: number }) => show(message, 'info', opts),
      warning: (message: string, opts?: { title?: string; duration?: number }) => show(message, 'warning', opts),
    },
    showToast: show,
  };
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 w-[min(96vw,380px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            'pointer-events-auto rounded-xl shadow-lg border px-4 py-3 text-sm flex gap-3 items-start animate-in fade-in zoom-in-50 duration-200',
            variantClass(t.variant),
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          <div className="flex-1 min-w-0">
            {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
            <div className="text-sm/5 text-slate-800">{t.message}</div>
          </div>
          <button
            className="ml-2 shrink-0 text-slate-500 hover:text-slate-700"
            onClick={() => onDismiss(t.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function variantClass(v: ToastVariant) {
  switch (v) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-900';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-900';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    case 'info':
    default:
      return 'bg-blue-50 border-blue-200 text-blue-900';
  }
}
