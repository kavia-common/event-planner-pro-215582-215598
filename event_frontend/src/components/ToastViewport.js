import React from "react";
import { useToasts } from "../hooks/useToasts";

/**
 * PUBLIC_INTERFACE
 * @returns {JSX.Element}
 */
export default function ToastViewport() {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="toastWrap" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => {
        const dotClass =
          t.type === "error" ? "toastDot toastDotErr" : t.type === "warning" ? "toastDot toastDotWarn" : "toastDot";
        return (
          <div key={t.id} className="toast" role="status">
            <div className={dotClass} aria-hidden="true" />
            <div className="toastContent">
              <div className="toastTitle">{t.title}</div>
              {t.message ? <div className="toastMsg">{t.message}</div> : null}
              <div style={{ marginTop: 6 }}>
                <button className="btn btnGhost" type="button" onClick={() => removeToast(t.id)}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
