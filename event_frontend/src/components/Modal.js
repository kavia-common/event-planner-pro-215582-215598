import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * @param {{
 *  open: boolean,
 *  title: string,
 *  children: React.ReactNode,
 *  footer?: React.ReactNode,
 *  onClose: () => void
 * }} props
 * @returns {JSX.Element|null}
 */
export default function Modal({ open, title, children, footer, onClose }) {
  useEffect(() => {
    if (!open) return;

    /** @param {KeyboardEvent} e */
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h3 className="modalTitle">{title}</h3>
          <button className="btn btnGhost" type="button" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {footer ? <div className="modalFooter">{footer}</div> : null}
      </div>
    </div>
  );
}
