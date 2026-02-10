/**
 * Minimal fetch wrapper used across the app.
 * - Centralizes base URL, JSON parsing, and error shaping.
 * - Keeps the UI consistent for loading and error states.
 */

const DEFAULT_BASE = "/api";

/** @returns {string} */
function getApiBaseUrl() {
  // CRA exposes REACT_APP_* variables at build-time.
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
}

/**
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number} status
 * @property {any} details
 */

/**
 * PUBLIC_INTERFACE
 * @template T
 * @param {string} path
 * @param {RequestInit & { json?: any }} [options]
 * @returns {Promise<T>}
 */
export async function apiRequest(path, options = {}) {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  let body = options.body;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  if (isJson) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    /** @type {ApiError} */
    const err = {
      status: res.status,
      message: typeof data === "string" && data ? data : (data && data.detail) ? data.detail : `Request failed (${res.status})`,
      details: data
    };
    throw err;
  }

  return /** @type {T} */ (data);
}

/**
 * PUBLIC_INTERFACE
 * @returns {string}
 */
export function getApiInfoForUi() {
  const base = getApiBaseUrl();
  return base === DEFAULT_BASE ? "Same-origin /api" : base;
}
