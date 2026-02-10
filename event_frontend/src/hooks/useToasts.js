import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * @typedef {"info"|"warning"|"error"} ToastType
 * @typedef {{id: string, title: string, message?: string, type: ToastType}} Toast
 */

const ToastsContext = createContext(null);

/**
 * PUBLIC_INTERFACE
 * @returns {{toasts: Toast[], pushToast: (t: Omit<Toast,"id">) => void, removeToast: (id: string) => void}}
 */
export function useToasts() {
  const ctx = useContext(ToastsContext);
  if (!ctx) {
    throw new Error("useToasts must be used within <ToastsProvider />");
  }
  return ctx;
}

/**
 * PUBLIC_INTERFACE
 * @param {{children: React.ReactNode}} props
 * @returns {JSX.Element}
 */
export function ToastsProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((t) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const toast = { id, ...t };
    setToasts((prev) => [toast, ...prev].slice(0, 5));

    // Auto-dismiss
    window.setTimeout(() => {
      removeToast(id);
    }, 4200);
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, pushToast, removeToast }), [toasts, pushToast, removeToast]);

  return <ToastsContext.Provider value={value}>{children}</ToastsContext.Provider>;
}
