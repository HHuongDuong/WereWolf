/**
 * ToastContext — global notification system.
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast("Joined room!", "success");
 *   toast("Wrong password", "error");
 */

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  /** Duration in ms before auto-dismiss. 0 = persist until manually closed. */
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast(message: string, type?: ToastType, duration?: number): void;
  dismiss(id: number): void;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD";     toast: Toast }
  | { type: "DISMISS"; id: number };

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case "ADD":     return [...state, action.toast];
    case "DISMISS": return state.filter(t => t.id !== action.id);
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    dispatch({ type: "DISMISS", id });
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = nextId.current++;
      dispatch({ type: "ADD", toast: { id, message, type, duration } });
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── UI ────────────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const icons: Record<ToastType, string> = {
    success: "M20 6 9 17l-5-5",
    error:   "M18 6 6 18M6 6l12 12",
    info:    "M12 16v-4m0-4h.01",
    warning: "M12 9v4m0 4h.01",
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <svg
        className="toast-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        <path d={icons[toast.type]} />
      </svg>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
