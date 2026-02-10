import React from "react";

/**
 * PUBLIC_INTERFACE
 * @param {{label?: string}} props
 * @returns {JSX.Element}
 */
export default function Spinner({ label = "Loading" }) {
  return (
    <div className="badge" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
