import React from "react";

/**
 * PUBLIC_INTERFACE
 * @param {{title?: string, message: string, onRetry?: () => void}} props
 * @returns {JSX.Element}
 */
export default function ErrorBanner({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="panel">
      <div className="panelHeader">
        <h3 className="panelTitle">{title}</h3>
        {onRetry ? (
          <button className="btn btnPrimary" type="button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
      <div className="panelBody">
        <div className="errorText">{message}</div>
      </div>
    </div>
  );
}
